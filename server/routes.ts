import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupStripeRoutes } from "./stripe";
import { setupZohoWebhook } from "./zoho";
import { summarizeNewsletter } from "./openai";
import { Newsletter, SummaryRequest, summaryRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up Stripe payment routes
  setupStripeRoutes(app);
  
  // Set up Zoho mail webhook
  setupZohoWebhook(app);

  // API routes
  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const newsletters = await storage.getNewslettersByUser(req.user.id);
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.get("/api/newsletters/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const newsletterId = parseInt(req.params.id);
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      if (newsletter.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this newsletter" });
      }
      
      // Mark newsletter as read
      if (!newsletter.isRead) {
        await storage.updateNewsletter(newsletterId, { isRead: true });
      }
      
      res.json(newsletter);
    } catch (error) {
      console.error("Error fetching newsletter:", error);
      res.status(500).json({ message: "Failed to fetch newsletter" });
    }
  });

  app.patch("/api/newsletters/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const newsletterId = parseInt(req.params.id);
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      if (newsletter.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this newsletter" });
      }
      
      // Validate the update data
      const updateSchema = z.object({
        isRead: z.boolean().optional(),
        isStarred: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        category: z.string().optional(),
        labels: z.array(z.string()).optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const updatedNewsletter = await storage.updateNewsletter(newsletterId, validatedData);
      
      res.json(updatedNewsletter);
    } catch (error) {
      console.error("Error updating newsletter:", error);
      res.status(500).json({ message: "Failed to update newsletter" });
    }
  });

  // AI Summary routes
  app.get("/api/summaries/:newsletterId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const newsletterId = parseInt(req.params.newsletterId);
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      if (newsletter.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access summaries for this newsletter" });
      }
      
      const summaries = await storage.getSummariesByNewsletter(newsletterId);
      
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });

  app.post("/api/summaries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request
      const { newsletterId, type, customParams } = summaryRequestSchema.parse(req.body);
      
      // Check if user has reached summary limit based on their plan
      const user = await storage.getUser(req.user.id);
      const summariesThisMonth = await storage.getSummariesCountByUserAndMonth(req.user.id);
      
      const summaryLimits = {
        free: 5,
        pro: 50,
        business: Number.POSITIVE_INFINITY,
      };
      
      const userPlan = user?.plan as keyof typeof summaryLimits || "free";
      const summaryLimit = summaryLimits[userPlan];
      
      if (summariesThisMonth >= summaryLimit && userPlan !== "business") {
        return res.status(403).json({
          message: `You've reached your monthly summary limit (${summaryLimit}). Please upgrade your plan for more summaries.`
        });
      }
      
      // Get the newsletter
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      if (newsletter.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to generate summaries for this newsletter" });
      }
      
      // Check if summary already exists
      const existingSummary = await storage.getSummaryByTypeAndNewsletter(type, newsletterId);
      
      if (existingSummary) {
        // Return existing summary if it exists
        return res.json(existingSummary);
      }
      
      // Generate summary with OpenAI
      const summaryContent = await summarizeNewsletter(newsletter, type, customParams);
      
      // Save summary to database
      const summary = await storage.createSummary({
        userId: req.user.id,
        newsletterId,
        type,
        content: summaryContent,
        customParams: customParams || undefined,
      });
      
      res.status(201).json(summary);
    } catch (error) {
      console.error("Error creating summary:", error);
      res.status(500).json({ message: "Failed to create summary" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const totalUsers = await storage.getUsersCount();
      const activeSubscriptions = await storage.getActiveSubscriptionsCount();
      const totalSummaries = await storage.getSummariesCount();
      const monthlyRevenue = await storage.getMonthlyRevenue();
      
      // Previous month stats for growth calculation
      const prevMonthUsers = await storage.getPreviousMonthUsersCount();
      const prevMonthSubscriptions = await storage.getPreviousMonthSubscriptionsCount();
      const prevMonthSummaries = await storage.getPreviousMonthSummariesCount();
      const prevMonthRevenue = await storage.getPreviousMonthRevenue();
      
      // Calculate growth percentages
      const userGrowth = prevMonthUsers > 0 
        ? Math.round(((totalUsers - prevMonthUsers) / prevMonthUsers) * 100) 
        : 100;
      
      const subscriptionGrowth = prevMonthSubscriptions > 0 
        ? Math.round(((activeSubscriptions - prevMonthSubscriptions) / prevMonthSubscriptions) * 100) 
        : 100;
      
      const summariesGrowth = prevMonthSummaries > 0 
        ? Math.round(((totalSummaries - prevMonthSummaries) / prevMonthSummaries) * 100) 
        : 100;
      
      const revenueGrowth = prevMonthRevenue > 0 
        ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) 
        : 100;
      
      res.json({
        totalUsers,
        activeSubscriptions,
        aiSummaries: totalSummaries,
        monthlyRevenue,
        userGrowth,
        subscriptionGrowth,
        summariesGrowth,
        revenueGrowth
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  app.get("/api/admin/activity", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const recentActivity = await storage.getRecentActivity();
      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching admin activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Subscription selection
  app.post("/api/subscriptions/select-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const planSchema = z.object({
        plan: z.enum(["free", "pro", "business"])
      });
      
      const { plan } = planSchema.parse(req.body);
      
      // Update user's plan
      await storage.updateUser(req.user.id, { plan });
      
      // For free plan, just update and return
      if (plan === "free") {
        return res.json({ 
          message: "Free plan selected successfully"
        });
      }
      
      // For paid plans, return details needed for payment page
      const planPrices = {
        pro: 9,
        business: 19
      };
      
      res.json({
        message: `${plan} plan selected, proceed to payment`,
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        amount: planPrices[plan as keyof typeof planPrices]
      });
    } catch (error) {
      console.error("Error selecting plan:", error);
      res.status(500).json({ message: "Failed to select plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
