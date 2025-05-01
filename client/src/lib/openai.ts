import { SummaryRequest } from "@shared/schema";
import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function generateSummary(newsletterId: number, type: SummaryRequest['type'], customParams?: Record<string, any>) {
  try {
    const response = await apiRequest("POST", "/api/summaries", {
      newsletterId,
      type,
      customParams
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

// Map summary types to human-readable descriptions
export const summaryTypes = {
  bullet_points: "Bullet Points",
  main_keys: "Main Keys",
  executive: "Executive Summary",
  action_items: "Action Items",
  custom: "Custom Summary"
};

// Summary type descriptions for UI
export const summaryTypeDescriptions = {
  bullet_points: "Key points in a concise bullet list format",
  main_keys: "The most important concepts and information",
  executive: "Comprehensive overview for busy executives",
  action_items: "Tasks and actions to take from the newsletter",
  custom: "Custom summary with your specified parameters"
};

// Default prompt templates for different summary types
export const summaryPromptTemplates = {
  bullet_points: "Summarize the key points in a concise bullet list format",
  main_keys: "Extract the most important concepts and information",
  executive: "Create a comprehensive executive summary",
  action_items: "Identify all actionable tasks and action items",
  custom: "Custom summary with the following parameters: {{params}}"
};
