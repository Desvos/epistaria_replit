import { useEffect, useState } from "react";
import { Newsletter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type EmailListProps = {
  newsletters: Newsletter[];
  isLoading: boolean;
  onSelectNewsletter: (id: number) => void;
  selectedId: number | null;
  isVisible: boolean;
  onShowSearch: () => void;
  showSearch: boolean;
};

export default function EmailList({
  newsletters,
  isLoading,
  onSelectNewsletter,
  selectedId,
  isVisible,
  onShowSearch,
  showSearch,
}: EmailListProps) {
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNewsletters(newsletters);
      return;
    }

    const filtered = newsletters.filter(
      (newsletter) =>
        newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNewsletters(filtered);
  }, [newsletters, searchTerm]);

  if (!isVisible) return null;

  // Format the date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  // Get a short preview of the content
  const getContentPreview = (content: string, limit = 100) => {
    if (content.length <= limit) return content;
    return content.substring(0, limit) + "...";
  };

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <span className="ml-2 bg-primary bg-opacity-10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
          {newsletters.filter(n => !n.isRead).length} new
        </span>

        <div className="ml-auto flex">
          <Button variant="ghost" size="icon" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary md:hidden"
            onClick={onShowSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Email List Items */}
      <div>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-full mt-2" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <div className="mt-2 flex items-center">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full ml-2" />
              </div>
            </div>
          ))
        ) : newsletters.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No newsletters yet</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Subscribe to newsletters using your alias and they will appear here
            </p>
          </div>
        ) : (
          // Newsletters list
          filteredNewsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className={`border-l-4 ${
                selectedId === newsletter.id
                  ? "border-primary bg-light-hover dark:bg-dark-hover"
                  : "border-transparent hover:bg-light-hover dark:hover:bg-dark-hover"
              } cursor-pointer transition-colors`}
              onClick={() => onSelectNewsletter(newsletter.id)}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm ${newsletter.isRead ? "text-text-secondary-light dark:text-text-secondary-dark" : "font-semibold"}`}>
                    {newsletter.from}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {formatDate(newsletter.receivedAt)}
                  </span>
                </div>
                <h3 className={newsletter.isRead ? "text-base truncate" : "font-semibold text-base truncate"}>
                  {newsletter.subject}
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
                  {getContentPreview(newsletter.content)}
                </p>
                {newsletter.category && (
                  <div className="mt-2 flex items-center">
                    <span className="text-xs py-0.5 px-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full">
                      {newsletter.category}
                    </span>
                    {newsletter.labels && newsletter.labels.length > 0 && (
                      <span className="text-xs py-0.5 px-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full ml-2">
                        {newsletter.labels[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
