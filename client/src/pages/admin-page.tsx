import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/Sidebar";
import StatsCards from "@/components/admin/StatsCards";
import RecentActivity from "@/components/admin/RecentActivity";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Mail, Menu } from "lucide-react";

export default function AdminPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch recent activity
  const { data: activity, isLoading: isActivityLoading } = useQuery({
    queryKey: ["/api/admin/activity"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-white dark:bg-dark-card shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Mail className="text-primary h-6 w-6 mr-2" />
            <span className="font-semibold text-xl">NewsletterAI Admin</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="relative">
              <Button
                className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center"
              >
                <span>{user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "A"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar 
          isVisible={!showMobileMenu || window.innerWidth >= 768} 
          onClose={() => setShowMobileMenu(false)}
          onLogout={() => logoutMutation.mutate()}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-light-bg dark:bg-dark-bg">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          {/* Stats Cards */}
          <StatsCards isLoading={isStatsLoading} stats={stats} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">New Users</h2>
              <div className="h-64 flex items-center justify-center">
                {/* Placeholder for chart */}
                <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <p>[User Growth Chart Visualization]</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue by Plan</h2>
              <div className="h-64 flex items-center justify-center">
                {/* Placeholder for chart */}
                <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p>[Revenue Distribution Chart]</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity isLoading={isActivityLoading} activity={activity} />
        </main>
      </div>
    </div>
  );
}
