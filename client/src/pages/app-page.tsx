import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Newsletter } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import AppSidebar from "@/components/app/Sidebar";
import EmailList from "@/components/app/EmailList";
import EmailContent from "@/components/app/EmailContent";
import MobileNavigation from "@/components/app/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Mail, Search, Bell, Menu, ArrowLeft } from "lucide-react";

export default function AppPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEmailContent, setShowEmailContent] = useState(false);

  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch newsletters
  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  // Find the selected newsletter
  const selectedNewsletter = newsletters.find(
    (newsletter) => newsletter.id === selectedNewsletterId
  );

  // Handle newsletter selection
  const handleSelectNewsletter = (id: number) => {
    setSelectedNewsletterId(id);
    if (isMobile) {
      setShowEmailContent(true);
    }
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowEmailContent(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Header */}
      <header className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Mail className="text-primary h-6 w-6 mr-2" />
            <span className="font-semibold text-xl hidden sm:inline">NewsletterAI</span>
          </div>

          <div className="max-w-md w-full mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 rounded-md bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search newsletters..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button
                className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center"
              >
                <span>{user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* App Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AppSidebar 
          isVisible={!isMobile || showMobileMenu} 
          onClose={() => setShowMobileMenu(false)}
          onLogout={() => logoutMutation.mutate()}
        />

        {/* Email List */}
        <EmailList
          newsletters={newsletters}
          isLoading={isLoading}
          onSelectNewsletter={handleSelectNewsletter}
          selectedId={selectedNewsletterId}
          isVisible={!isMobile || !showEmailContent}
          onShowSearch={() => setShowSearch(!showSearch)}
          showSearch={showSearch}
        />

        {/* Email Content */}
        <EmailContent
          newsletter={selectedNewsletter}
          isVisible={!isMobile || showEmailContent}
          onBackToList={handleBackToList}
        />

        {/* Mobile Navigation */}
        <MobileNavigation isVisible={isMobile} />
      </main>
    </div>
  );
}
