import { users, type User, type InsertUser, newsletters, type Newsletter, type InsertNewsletter, summaries, type Summary, type InsertSummary, subscriptions, type Subscription, type InsertSubscription } from "@shared/schema";
import session from 'express-session';
import createMemoryStore from "memorystore";
import connectPg from 'connect-pg-simple';
import { db } from './db';
import { pool } from './db';
import { eq, desc, and, sql, count, sum } from 'drizzle-orm';

const PostgresSessionStore = connectPg(session);
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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
    return user;
  }

  async getUserByZohoAlias(zohoAlias: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.zohoAlias, zohoAlias));
    return user;
  }

  async createUser(userData: InsertUser & { zohoAlias?: string, role?: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      zohoAlias: userData.zohoAlias || `${userData.username}@example.com`,
      role: userData.role || "user",
      plan: "free"
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count || 0;
  }

  async getPreviousMonthUsersCount(): Promise<number> {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const [result] = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.createdAt} >= ${firstDayLastMonth}`, 
          sql`${users.createdAt} <= ${lastDayLastMonth}`
        )
      );
    
    return result?.count || 0;
  }

  // Newsletter operations
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return newsletter;
  }

  async getNewslettersByUser(userId: number): Promise<Newsletter[]> {
    return db.select()
      .from(newsletters)
      .where(eq(newsletters.userId, userId))
      .orderBy(desc(newsletters.receivedAt));
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db.insert(newsletters).values({
      ...newsletterData,
      labels: newsletterData.labels || []
    }).returning();
    return newsletter;
  }

  async updateNewsletter(id: number, newsletterData: Partial<Newsletter>): Promise<Newsletter> {
    const [newsletter] = await db.update(newsletters)
      .set(newsletterData)
      .where(eq(newsletters.id, id))
      .returning();
    
    if (!newsletter) {
      throw new Error(`Newsletter with ID ${id} not found`);
    }
    
    return newsletter;
  }

  // Summary operations
  async getSummary(id: number): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
    return summary;
  }

  async getSummariesByNewsletter(newsletterId: number): Promise<Summary[]> {
    return db.select()
      .from(summaries)
      .where(eq(summaries.newsletterId, newsletterId))
      .orderBy(desc(summaries.createdAt));
  }

  async getSummaryByTypeAndNewsletter(type: string, newsletterId: number): Promise<Summary | undefined> {
    const [summary] = await db.select()
      .from(summaries)
      .where(
        and(
          eq(summaries.type, type),
          eq(summaries.newsletterId, newsletterId)
        )
      );
    return summary;
  }

  async createSummary(summaryData: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries).values(summaryData).returning();
    return summary;
  }

  async getSummariesCountByUserAndMonth(userId: number): Promise<number> {
    const today = new Date();
    const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const [result] = await db.select({ count: count() })
      .from(summaries)
      .where(
        and(
          eq(summaries.userId, userId),
          sql`${summaries.createdAt} >= ${firstDayThisMonth}`,
          sql`${summaries.createdAt} <= ${lastDayThisMonth}`
        )
      );
    
    return result?.count || 0;
  }

  async getSummariesCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(summaries);
    return result?.count || 0;
  }

  async getPreviousMonthSummariesCount(): Promise<number> {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const [result] = await db.select({ count: count() })
      .from(summaries)
      .where(
        and(
          sql`${summaries.createdAt} >= ${firstDayLastMonth}`,
          sql`${summaries.createdAt} <= ${lastDayLastMonth}`
        )
      );
    
    return result?.count || 0;
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByUser(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async updateSubscriptionByUserId(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db.update(subscriptions)
      .set({
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    
    if (!subscription) {
      throw new Error(`Subscription for user ID ${userId} not found`);
    }
    
    return subscription;
  }

  async getActiveSubscriptionsCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    return result?.count || 0;
  }

  async getPreviousMonthSubscriptionsCount(): Promise<number> {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const [result] = await db.select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          sql`${subscriptions.createdAt} >= ${firstDayLastMonth}`,
          sql`${subscriptions.createdAt} <= ${lastDayLastMonth}`
        )
      );
    
    return result?.count || 0;
  }

  async getMonthlyRevenue(): Promise<number> {
    const [result] = await db.select({
      revenue: sql<number>`
        SUM(CASE
          WHEN ${users.plan} = 'pro' THEN 9
          WHEN ${users.plan} = 'business' THEN 19
          ELSE 0
        END)`
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(eq(subscriptions.status, 'active'));
    
    return result?.revenue || 0;
  }

  async getPreviousMonthRevenue(): Promise<number> {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const [result] = await db.select({
      revenue: sql<number>`
        SUM(CASE
          WHEN ${users.plan} = 'pro' THEN 9
          WHEN ${users.plan} = 'business' THEN 19
          ELSE 0
        END)`
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.status, 'active'),
        sql`${subscriptions.createdAt} >= ${firstDayLastMonth}`,
        sql`${subscriptions.createdAt} <= ${lastDayLastMonth}`
      )
    );
    
    return result?.revenue || 0;
  }

  // Admin operations
  async getRecentActivity(): Promise<any[]> {
    const recentUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);
    
    const recentSubscriptions = await db.select({
      subscription: subscriptions,
      user: users
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(5);
    
    const activity = [];
    
    // Add recent users to activity
    for (let i = 0; i < recentUsers.length; i++) {
      const user = recentUsers[i];
      activity.push({
        id: i + 1,
        user: {
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          initials: (user.name || user.username).substring(0, 2).toUpperCase(),
          avatarColor: `bg-${['blue', 'green', 'purple', 'yellow', 'red'][i % 5]}-500`
        },
        action: 'New User',
        plan: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
        date: user.createdAt.toISOString(),
        amount: 0
      });
    }
    
    // Add recent subscriptions to activity
    for (let i = 0; i < recentSubscriptions.length; i++) {
      const { subscription, user } = recentSubscriptions[i];
      activity.push({
        id: recentUsers.length + i + 1,
        user: {
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          initials: (user.name || user.username).substring(0, 2).toUpperCase(),
          avatarColor: `bg-${['blue', 'green', 'purple', 'yellow', 'red'][(i + 2) % 5]}-500`
        },
        action: subscription.status === 'active' ? 'New Subscription' : 'Subscription Cancellation',
        plan: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
        date: subscription.createdAt.toISOString(),
        amount: subscription.plan === 'pro' ? 9 : subscription.plan === 'business' ? 19 : 0
      });
    }
    
    // Sort by date
    return activity.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }).slice(0, 5);  // Take only 5 most recent
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
