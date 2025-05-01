import { Users, CreditCard, Sparkles, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatsCardsProps = {
  isLoading: boolean;
  stats?: {
    totalUsers: number;
    activeSubscriptions: number;
    aiSummaries: number;
    monthlyRevenue: number;
    userGrowth: number;
    subscriptionGrowth: number;
    summariesGrowth: number;
    revenueGrowth: number;
  };
};

export default function StatsCards({ isLoading, stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      growth: stats?.userGrowth || 0,
      icon: <Users className="h-5 w-5" />,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-600 dark:text-blue-200",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      growth: stats?.subscriptionGrowth || 0,
      icon: <CreditCard className="h-5 w-5" />,
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-200",
    },
    {
      title: "AI Summaries",
      value: stats?.aiSummaries || 0,
      growth: stats?.summariesGrowth || 0,
      icon: <Sparkles className="h-5 w-5" />,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-600 dark:text-purple-200",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyRevenue
        ? `$${stats.monthlyRevenue.toLocaleString()}`
        : "$0",
      growth: stats?.revenueGrowth || 0,
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      textColor: "text-yellow-600 dark:text-yellow-200",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-card rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-4" />
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <Skeleton className="mt-4 h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-dark-card rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full ${card.bgColor} ${card.textColor} mr-4`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {card.title}
              </p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
          <div
            className={`mt-4 flex items-center text-sm ${
              card.growth >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {card.growth >= 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            <span>
              {Math.abs(card.growth)}% from last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
