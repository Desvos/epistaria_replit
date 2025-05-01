import OpenAI from "openai";
import { Newsletter, SummaryRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY || 'sk_fake_openai_key_123456789';
const openai = new OpenAI({ apiKey });

// In development with fake keys, we'll mock the OpenAI response
const isFakeKey = apiKey.includes('fake');

// Generate a summary for a newsletter
export async function summarizeNewsletter(
  newsletter: Newsletter,
  type: SummaryRequest["type"],
  customParams?: Record<string, any>
): Promise<string> {
  try {
    // If using fake key, return mock responses
    if (isFakeKey) {
      return getMockSummary(newsletter, type);
    }

    const promptTemplates = {
      bullet_points: `Create a concise bullet point summary of the key points in this newsletter. Extract 4-6 important points and format them as a bullet list.
      
Newsletter subject: ${newsletter.subject}
Newsletter content: ${newsletter.content}`,
      
      main_keys: `Identify and extract the main key concepts from this newsletter. Focus on the core ideas, technologies, or developments mentioned. Organize them in a clear, concise format.
      
Newsletter subject: ${newsletter.subject}
Newsletter content: ${newsletter.content}`,
      
      executive: `Create a comprehensive executive summary of this newsletter for busy professionals. Include the context, key points, implications, and conclusions in a well-structured paragraph format.
      
Newsletter subject: ${newsletter.subject}
Newsletter content: ${newsletter.content}`,
      
      action_items: `Extract all actionable tasks and items from this newsletter. Identify anything the reader should do, follow up on, or implement. Format as a clear list of action items.
      
Newsletter subject: ${newsletter.subject}
Newsletter content: ${newsletter.content}`,
      
      custom: `Create a custom summary of this newsletter based on the following parameters: ${JSON.stringify(customParams)}.
      
Newsletter subject: ${newsletter.subject}
Newsletter content: ${newsletter.content}`
    };

    const prompt = promptTemplates[type];

    // Define response format based on summary type
    const responseFormat = type === 'bullet_points' 
      ? { type: "text" as const } 
      : { type: "json_object" as const };
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert summarizer that creates concise, accurate, and helpful summaries of newsletter content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      // Only use response_format for non-bullet-point summaries
      ...(type !== 'bullet_points' && { response_format: responseFormat })
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Failed to generate summary: Empty response from OpenAI");
    }

    // For JSON responses, extract the content
    if (type !== 'bullet_points') {
      try {
        const jsonResponse = JSON.parse(content);
        
        // Different response structures based on summary types
        if (type === 'main_keys' && jsonResponse.main_keys) {
          return jsonResponse.main_keys.join('\n\n');
        } else if (type === 'executive' && jsonResponse.summary) {
          return jsonResponse.summary;
        } else if (type === 'action_items' && jsonResponse.action_items) {
          return jsonResponse.action_items.join('\n\n');
        } else if (jsonResponse.content) {
          return jsonResponse.content;
        }
        
        // Fallback to the raw content if we can't extract structured data
        return content;
      } catch (e) {
        // If JSON parsing fails, return the raw content
        return content;
      }
    }
    
    return content;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Failed to generate ${type} summary: ${(error as Error).message}`);
  }
}

// Generate mock summaries for development with fake API keys
function getMockSummary(newsletter: Newsletter, type: SummaryRequest["type"]): string {
  const subject = newsletter.subject || "Newsletter";
  
  const mockResponses = {
    bullet_points: `• ${subject} provides key insights on industry trends and innovations
• The newsletter highlights recent changes in technology adoption across sectors
• Several case studies demonstrate successful implementation strategies
• Expert opinions suggest focusing on user experience and data security
• The conclusion offers practical steps for organizations looking to transform digitally`,
    
    main_keys: `Digital Transformation Framework\n\nCustomer Experience Enhancement\n\nData-Driven Decision Making\n\nAgile Methodology Implementation\n\nCybersecurity Best Practices`,
    
    executive: `The ${subject} newsletter offers a comprehensive overview of the current market landscape, highlighting several key trends that are reshaping the industry. The author presents compelling data showing a 27% increase in digital adoption across mid-size businesses, with particular emphasis on AI-powered solutions gaining traction. The analysis suggests that companies embracing these technologies are seeing an average of 32% improvement in operational efficiency. The newsletter concludes with practical recommendations for business leaders, emphasizing the importance of strategic investment in both technology infrastructure and employee upskilling programs to maintain competitive advantage in the rapidly evolving marketplace.`,
    
    action_items: `1. Review the latest industry benchmarks shared in the newsletter\n\n2. Schedule a team meeting to discuss implementation of the suggested frameworks\n\n3. Evaluate current technology stack against the recommended solutions\n\n4. Allocate budget for potential upgrades based on the ROI calculations provided\n\n5. Follow up with the author for the additional resources mentioned in the conclusion`,
    
    custom: `This is a custom summary of the newsletter "${subject}" generated for development purposes. The newsletter covers important industry trends, market analyses, and practical recommendations. When using a real OpenAI API key, this would contain custom content based on the provided parameters.`
  };
  
  return mockResponses[type] || `This is a mock summary for the "${type}" format of "${subject}" newsletter.`;
}
