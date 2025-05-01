import { useState } from "react";
import { Newsletter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AISummary from "./AISummary";
import { 
  ArrowLeft, 
  Archive, 
  Trash, 
  Star, 
  Sparkles 
} from "lucide-react";
import { format } from "date-fns";

type EmailContentProps = {
  newsletter: Newsletter | undefined;
  isVisible: boolean;
  onBackToList: () => void;
};

export default function EmailContent({
  newsletter,
  isVisible,
  onBackToList,
}: EmailContentProps) {
  const [showSummary, setShowSummary] = useState(false);

  if (!isVisible) return null;

  // Display loading state when no newsletter is selected
  if (!newsletter) {
    return (
      <div className="flex-1 bg-white dark:bg-dark-card overflow-y-auto flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Select a newsletter to view its content
          </p>
        </div>
      </div>
    );
  }

  // Format the date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMMM d, yyyy");
  };

  return (
    <div className="flex-1 bg-white dark:bg-dark-card overflow-y-auto">
      {/* Email Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 p-1 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-light-hover dark:hover:bg-dark-hover md:hidden"
          onClick={onBackToList}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h2 className="text-lg font-semibold">{newsletter.subject}</h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            From {newsletter.from} • {formatDate(newsletter.receivedAt)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            <Archive className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            <Trash className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            <Star className="h-5 w-5" />
          </Button>
          <Button
            className="bg-accent text-white hover:bg-opacity-90"
            onClick={() => setShowSummary(!showSummary)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Summarize</span>
          </Button>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{newsletter.subject}</h1>

        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
      </div>

      {/* AI Summary Section */}
      {showSummary && (
        <AISummary newsletterId={newsletter.id} />
      )}
    </div>
  );
}
