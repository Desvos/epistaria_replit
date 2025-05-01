import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SummaryRequest, Summary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { generateSummary, summaryTypes } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { Brain, CircleDot, Loader2 } from "lucide-react";

type AISummaryProps = {
  newsletterId: number;
};

export default function AISummary({ newsletterId }: AISummaryProps) {
  const [activeType, setActiveType] = useState<SummaryRequest["type"]>("bullet_points");
  const { toast } = useToast();

  // Fetch existing summaries
  const {
    data: summaries,
    isLoading: isSummariesLoading,
    refetch: refetchSummaries,
  } = useQuery<Summary[]>({
    queryKey: ["/api/summaries", newsletterId],
  });

  // Generate new summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async (type: SummaryRequest["type"]) => {
      return await generateSummary(newsletterId, type);
    },
    onSuccess: () => {
      refetchSummaries();
      toast({
        title: "Summary generated",
        description: "Your AI summary has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate summary",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get current summary based on active type
  const currentSummary = summaries?.find((summary) => summary.type === activeType);

  // Handle summary type change
  const handleTypeChange = (type: SummaryRequest["type"]) => {
    setActiveType(type);
    
    // Generate summary if it doesn't exist for this type
    if (!summaries?.some(summary => summary.type === type)) {
      generateSummaryMutation.mutate(type);
    }
  };

  // Handle regenerate summary
  const handleRegenerateSummary = () => {
    generateSummaryMutation.mutate(activeType);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-800">
      <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <Brain className="text-accent mr-2 h-5 w-5" />
            AI Summary
          </h3>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Button
              size="sm"
              variant={activeType === "bullet_points" ? "secondary" : "outline"}
              onClick={() => handleTypeChange("bullet_points")}
              className="text-xs py-1 px-2 h-auto"
            >
              Bullet Points
            </Button>
            <Button
              size="sm"
              variant={activeType === "main_keys" ? "secondary" : "outline"}
              onClick={() => handleTypeChange("main_keys")}
              className="text-xs py-1 px-2 h-auto"
            >
              Main Keys
            </Button>
            <Button
              size="sm"
              variant={activeType === "executive" ? "secondary" : "outline"}
              onClick={() => handleTypeChange("executive")}
              className="text-xs py-1 px-2 h-auto"
            >
              Executive
            </Button>
            <Button
              size="sm"
              variant={activeType === "action_items" ? "secondary" : "outline"}
              onClick={() => handleTypeChange("action_items")}
              className="text-xs py-1 px-2 h-auto"
            >
              Action Items
            </Button>
          </div>
        </div>

        {/* Summary content */}
        <div className="space-y-2">
          {isSummariesLoading || generateSummaryMutation.isPending ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2">Generating summary...</span>
            </div>
          ) : currentSummary ? (
            // Display summary content based on type
            activeType === "bullet_points" ? (
              currentSummary.content.split('\n').map((point, index) => (
                <div key={index} className="flex items-start">
                  <CircleDot className="text-accent mt-1 mr-2 h-3 w-3" />
                  <p>{point}</p>
                </div>
              ))
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {currentSummary.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )
          ) : (
            <div className="py-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
              <p>No summary available for this newsletter. Click generate to create one.</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="link"
            className="text-sm text-accent p-0 h-auto"
            onClick={handleRegenerateSummary}
            disabled={generateSummaryMutation.isPending}
          >
            {currentSummary ? "Regenerate summary" : "Generate summary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
