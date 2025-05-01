import { Express } from "express";
import { storage } from "./storage";
import { createHash } from "crypto";

// Check for Zoho Mail API key (would be needed in a real implementation)
if (!process.env.ZOHO_API_KEY) {
  console.warn('Missing ZOHO_API_KEY - using mock implementation for Zoho Mail');
}

// Generate a unique Zoho Mail alias for a user
export async function generateZohoAlias(username: string): Promise<string> {
  // In a real implementation, this would call the Zoho Mail API to create an alias
  // For now, create a unique email-like string
  const timestamp = Date.now();
  const hash = createHash('md5').update(`${username}-${timestamp}`).digest('hex').substring(0, 8);
  
  const alias = `${username}-${hash}@newsletterai.example.com`;
  return alias;
}

// Process an incoming email from Zoho Mail
export async function processIncomingEmail(emailData: any): Promise<void> {
  try {
    // Extract relevant email data
    const { to, from, subject, content, html } = emailData;
    
    // Find the user by Zoho alias (to address)
    const user = await storage.getUserByZohoAlias(to);
    
    if (!user) {
      console.error(`No user found for alias: ${to}`);
      return;
    }
    
    // Create a new newsletter entry
    await storage.createNewsletter({
      userId: user.id,
      from,
      subject,
      content: html || content,
      isRead: false,
      isStarred: false,
      isArchived: false,
      category: detectCategory(subject, html || content),
      labels: []
    });
    
    console.log(`Saved newsletter from ${from} for user ${user.username}`);
  } catch (error) {
    console.error("Error processing incoming email:", error);
    throw error;
  }
}

// Simple category detection based on content keywords
function detectCategory(subject: string, content: string): string | undefined {
  const combinedText = (subject + ' ' + content).toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    'Tech': ['tech', 'technology', 'software', 'hardware', 'programming', 'developer', 'code', 'ai', 'machine learning'],
    'Business': ['business', 'entrepreneur', 'startup', 'company', 'market', 'finance', 'invest', 'economy'],
    'Marketing': ['marketing', 'advertising', 'campaign', 'brand', 'social media', 'content', 'seo'],
    'Finance': ['finance', 'money', 'invest', 'stock', 'market', 'economic', 'banking', 'fund'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }
  
  return undefined;
}

// Set up Zoho webhook endpoint
export function setupZohoWebhook(app: Express) {
  app.post('/api/zoho-webhook', async (req, res) => {
    try {
      // In a real implementation, this would verify the Zoho webhook signature
      // For now, just process the email data
      
      const emailData = req.body;
      
      if (!emailData || !emailData.to || !emailData.from || !emailData.subject) {
        return res.status(400).json({ message: 'Invalid email data' });
      }
      
      await processIncomingEmail(emailData);
      
      res.status(200).json({ message: 'Email processed successfully' });
    } catch (error) {
      console.error('Error in Zoho webhook:', error);
      res.status(500).json({ message: 'Error processing email' });
    }
  });
  
  // Endpoint to manually trigger email processing (for testing/demo)
  app.post('/api/demo/receive-email', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const { subject, content, from } = req.body;
      
      if (!subject || !content || !from) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Create a demo newsletter for the logged-in user
      const newsletter = await storage.createNewsletter({
        userId: req.user.id,
        from,
        subject,
        content,
        isRead: false,
        isStarred: false,
        isArchived: false,
        category: detectCategory(subject, content),
        labels: []
      });
      
      res.status(201).json({ 
        message: 'Demo newsletter created successfully',
        newsletter 
      });
    } catch (error) {
      console.error('Error creating demo newsletter:', error);
      res.status(500).json({ message: 'Error creating demo newsletter' });
    }
  });
}
