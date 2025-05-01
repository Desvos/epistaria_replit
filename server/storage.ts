import { users, type User, type InsertUser, newsletters, type Newsletter, type InsertNewsletter, summaries, type Summary, type InsertSummary, subscriptions, type Subscription, type InsertSubscription } from "@shared/schema";
import session from 'express-session';
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined>;
  getUserByZohoAlias(zohoAlias: string): Promise<User | undefined>;
  createUser(user: InsertUser & { zohoAlias?: string, role?: string }): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  getUsersCount(): Promise<number>;
  getPreviousMonthUsersCount(): Promise<number>;
  
  // Newsletter operations
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getNewslettersByUser(userId: number): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, newsletterData: Partial<Newsletter>): Promise<Newsletter>;
  
  // Summary operations
  getSummary(id: number): Promise<Summary | undefined>;
  getSummariesByNewsletter(newsletterId: number): Promise<Summary[]>;
  getSummaryByTypeAndNewsletter(type: string, newsletterId: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummariesCountByUserAndMonth(userId: number): Promise<number>;
  getSummariesCount(): Promise<number>;
  getPreviousMonthSummariesCount(): Promise<number>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUser(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionByUserId(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription>;
  getActiveSubscriptionsCount(): Promise<number>;
  getPreviousMonthSubscriptionsCount(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
  getPreviousMonthRevenue(): Promise<number>;
  
  // Admin operations
  getRecentActivity(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsletters: Map<number, Newsletter>;
  private summaries: Map<number, Summary>;
  private subscriptionsMap: Map<number, Subscription>;
  sessionStore: session.SessionStore;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.newsletters = new Map();
    this.summaries = new Map();
    this.subscriptionsMap = new Map();
    this.currentId = { users: 1, newsletters: 1, summaries: 1, subscriptions: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeSubscriptionId === subscriptionId,
    );
  }

  async getUserByZohoAlias(zohoAlias: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.zohoAlias === zohoAlias,
    );
  }

  async createUser(userData: InsertUser & { zohoAlias?: string, role?: string }): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      zohoAlias: userData.zohoAlias || `${userData.username}-${id}@example.com`,
      role: userData.role || "user",
      plan: "free",
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersCount(): Promise<number> {
    return this.users.size;
  }

  async getPreviousMonthUsersCount(): Promise<number> {
    // For demo purposes, return a slightly lower number
    return Math.max(0, this.users.size - Math.floor(this.users.size * 0.1));
  }

  // Newsletter operations
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    return this.newsletters.get(id);
  }

  async getNewslettersByUser(userId: number): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values())
      .filter(newsletter => newsletter.userId === userId)
      .sort((a, b) => {
        // Sort by received date, newest first
        const dateA = new Date(a.receivedAt).getTime();
        const dateB = new Date(b.receivedAt).getTime();
        return dateB - dateA;
      });
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const id = this.currentId.newsletters++;
    const now = new Date();
    const newsletter: Newsletter = { 
      ...newsletterData, 
      id, 
      receivedAt: now,
      isRead: false,
      isStarred: false, 
      isArchived: false,
      labels: newsletterData.labels || []
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async updateNewsletter(id: number, newsletterData: Partial<Newsletter>): Promise<Newsletter> {
    const newsletter = await this.getNewsletter(id);
    if (!newsletter) {
      throw new Error(`Newsletter with ID ${id} not found`);
    }
    
    const updatedNewsletter = { ...newsletter, ...newsletterData };
    this.newsletters.set(id, updatedNewsletter);
    return updatedNewsletter;
  }

  // Summary operations
  async getSummary(id: number): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async getSummariesByNewsletter(newsletterId: number): Promise<Summary[]> {
    return Array.from(this.summaries.values())
      .filter(summary => summary.newsletterId === newsletterId)
      .sort((a, b) => {
        // Sort by created date, newest first
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }

  async getSummaryByTypeAndNewsletter(type: string, newsletterId: number): Promise<Summary | undefined> {
    return Array.from(this.summaries.values()).find(
      (summary) => summary.type === type && summary.newsletterId === newsletterId,
    );
  }

  async createSummary(summaryData: InsertSummary): Promise<Summary> {
    const id = this.currentId.summaries++;
    const now = new Date();
    const summary: Summary = { 
      ...summaryData, 
      id, 
      createdAt: now
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async getSummariesCountByUserAndMonth(userId: number): Promise<number> {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return Array.from(this.summaries.values()).filter(summary => {
      const summaryDate = new Date(summary.createdAt);
      return summary.userId === userId && 
             summaryDate.getMonth() === currentMonth &&
             summaryDate.getFullYear() === currentYear;
    }).length;
  }

  async getSummariesCount(): Promise<number> {
    return this.summaries.size;
  }

  async getPreviousMonthSummariesCount(): Promise<number> {
    // For demo purposes, return a slightly lower number
    return Math.max(0, this.summaries.size - Math.floor(this.summaries.size * 0.15));
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsMap.get(id);
  }

  async getSubscriptionByUser(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptionsMap.values()).find(
      (subscription) => subscription.userId === userId,
    );
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.currentId.subscriptions++;
    const now = new Date();
    const subscription: Subscription = { 
      ...subscriptionData, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.subscriptionsMap.set(id, subscription);
    return subscription;
  }

  async updateSubscriptionByUserId(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = await this.getSubscriptionByUser(userId);
    if (!subscription) {
      throw new Error(`Subscription for user ID ${userId} not found`);
    }
    
    const updatedSubscription = { 
      ...subscription, 
      ...subscriptionData,
      updatedAt: new Date()
    };
    this.subscriptionsMap.set(subscription.id, updatedSubscription);
    return updatedSubscription;
  }

  async getActiveSubscriptionsCount(): Promise<number> {
    return Array.from(this.subscriptionsMap.values()).filter(
      subscription => subscription.status === 'active'
    ).length;
  }

  async getPreviousMonthSubscriptionsCount(): Promise<number> {
    // For demo purposes, return a slightly lower number
    const activeCount = await this.getActiveSubscriptionsCount();
    return Math.max(0, activeCount - Math.floor(activeCount * 0.08));
  }

  async getMonthlyRevenue(): Promise<number> {
    // Calculate based on active subscriptions
    const activeSubscriptions = Array.from(this.subscriptionsMap.values()).filter(
      subscription => subscription.status === 'active'
    );
    
    let revenue = 0;
    for (const subscription of activeSubscriptions) {
      const user = await this.getUser(subscription.userId);
      if (user) {
        if (user.plan === 'pro') {
          revenue += 9;
        } else if (user.plan === 'business') {
          revenue += 19;
        }
      }
    }
    
    return revenue;
  }

  async getPreviousMonthRevenue(): Promise<number> {
    // For demo purposes, return a slightly lower number
    const revenue = await this.getMonthlyRevenue();
    return Math.max(0, revenue - Math.floor(revenue * 0.07));
  }

  // Admin operations
  async getRecentActivity(): Promise<any[]> {
    // Create demo activity data for admin dashboard
    const activity = [];
    const users = Array.from(this.users.values()).slice(0, 5);
    
    // Generate some sample activity data
    if (users.length > 0) {
      activity.push({
        id: 1,
        user: {
          id: users[0].id,
          name: users[0].name || users[0].username,
          email: users[0].email,
          initials: (users[0].name || users[0].username).substring(0, 2).toUpperCase(),
          avatarColor: 'bg-blue-500'
        },
        action: 'New Subscription',
        plan: users[0].plan.charAt(0).toUpperCase() + users[0].plan.slice(1),
        date: new Date().toISOString(),
        amount: users[0].plan === 'pro' ? 9 : users[0].plan === 'business' ? 19 : 0
      });
    }
    
    if (users.length > 1) {
      activity.push({
        id: 2,
        user: {
          id: users[1].id,
          name: users[1].name || users[1].username,
          email: users[1].email,
          initials: (users[1].name || users[1].username).substring(0, 2).toUpperCase(),
          avatarColor: 'bg-green-500'
        },
        action: 'Plan Upgrade',
        plan: 'Business',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        amount: 19
      });
    }
    
    if (users.length > 2) {
      activity.push({
        id: 3,
        user: {
          id: users[2].id,
          name: users[2].name || users[2].username,
          email: users[2].email,
          initials: (users[2].name || users[2].username).substring(0, 2).toUpperCase(),
          avatarColor: 'bg-purple-500'
        },
        action: 'Subscription Renewal',
        plan: 'Pro',
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        amount: 9
      });
    }
    
    if (users.length > 3) {
      activity.push({
        id: 4,
        user: {
          id: users[3].id,
          name: users[3].name || users[3].username,
          email: users[3].email,
          initials: (users[3].name || users[3].username).substring(0, 2).toUpperCase(),
          avatarColor: 'bg-yellow-500'
        },
        action: 'Subscription Cancellation',
        plan: 'Business',
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        amount: 0
      });
    }
    
    if (users.length > 4) {
      activity.push({
        id: 5,
        user: {
          id: users[4].id,
          name: users[4].name || users[4].username,
          email: users[4].email,
          initials: (users[4].name || users[4].username).substring(0, 2).toUpperCase(),
          avatarColor: 'bg-red-500'
        },
        action: 'New User',
        plan: 'Free',
        date: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
        amount: 0
      });
    }
    
    return activity;
  }
}

export const storage = new MemStorage();
