import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  zohoAlias: text("zoho_alias").unique(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").default("free"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  isArchived: boolean("is_archived").default(false),
  category: text("category"),
  labels: text("labels").array(),
});

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  newsletterId: integer("newsletter_id").notNull(),
  type: text("type").notNull(), // 'bullet_points', 'main_keys', 'executive', 'action_items', 'custom'
  content: text("content").notNull(),
  customParams: jsonb("custom_params"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plan: text("plan").notNull(), // 'free', 'pro', 'business'
  status: text("status").notNull(), // 'active', 'canceled', 'past_due'
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  zohoAlias: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  createdAt: true
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  receivedAt: true
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schemas for login
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Schemas for AI summary requests
export const summaryRequestSchema = z.object({
  newsletterId: z.number(),
  type: z.enum(['bullet_points', 'main_keys', 'executive', 'action_items', 'custom']),
  customParams: z.record(z.any()).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SummaryRequest = z.infer<typeof summaryRequestSchema>;
