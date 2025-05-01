import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [, navigate] = useLocation();

  return (
    <div className="py-12 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Declutter Your Inbox with AI-Powered Newsletter Management
            </h1>
            <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark">
              Receive all your newsletters in one dedicated place. Read, organize, and get AI summaries to stay on top of what matters.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="rounded-md shadow-sm"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="ml-4 rounded-md"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Pricing
              </Button>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <div className="rounded-lg shadow-lg overflow-hidden">
              <svg
                className="w-full h-auto"
                viewBox="0 0 800 600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="800" height="600" fill="#f0f2f5" />
                <rect x="50" y="50" width="700" height="60" rx="4" fill="#ffffff" />
                <rect x="70" y="70" width="200" height="20" rx="2" fill="#1890ff" fillOpacity="0.2" />
                <rect x="300" y="70" width="200" height="20" rx="2" fill="#d9d9d9" />
                <rect x="600" y="70" width="80" height="20" rx="2" fill="#d9d9d9" />
                
                <rect x="50" y="130" width="400" height="420" rx="4" fill="#ffffff" />
                <rect x="70" y="150" width="360" height="30" rx="2" fill="#f5f5f5" />
                <rect x="80" y="158" width="20" height="15" rx="2" fill="#1890ff" />
                <rect x="110" y="158" width="150" height="15" rx="2" fill="#262626" fillOpacity="0.7" />
                <rect x="350" y="158" width="60" height="15" rx="2" fill="#8c8c8c" />
                
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <g key={`email-${i}`} transform={`translate(0, ${i * 50})`}>
                    <rect x="70" y="200" width="360" height="40" rx="2" fill="#ffffff" />
                    <rect x="80" y="210" width="20" height="15" rx="2" fill={i < 3 ? "#1890ff" : "#bfbfbf"} />
                    <rect x="110" y="208" width="220" height="12" rx="2" fill={i < 3 ? "#262626" : "#8c8c8c"} />
                    <rect x="110" y="225" width="180" height="8" rx="2" fill="#bfbfbf" />
                    <rect x="350" y="210" width="60" height="12" rx="2" fill="#8c8c8c" />
                  </g>
                ))}
                
                <rect x="470" y="130" width="280" height="420" rx="4" fill="#ffffff" />
                <rect x="490" y="150" width="240" height="30" rx="2" fill="#1890ff" fillOpacity="0.1" />
                <rect x="500" y="158" width="180" height="15" rx="2" fill="#262626" />
                <rect x="500" y="190" width="240" height="10" rx="2" fill="#8c8c8c" />
                <rect x="500" y="210" width="240" height="80" rx="2" fill="#f5f5f5" />
                <rect x="500" y="300" width="240" height="10" rx="2" fill="#8c8c8c" />
                <rect x="500" y="320" width="240" height="80" rx="2" fill="#f5f5f5" />
                <rect x="500" y="410" width="140" height="30" rx="4" fill="#722ed1" />
                <rect x="520" y="418" width="100" height="15" rx="2" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
