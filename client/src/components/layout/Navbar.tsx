import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Underline } from "lucide-react";

type NavbarProps = {
  isLanding?: boolean;
};

export default function Navbar({ isLanding = false }: NavbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  return (
    <nav className="bg-white dark:bg-dark-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Underline className="text-primary h-6 w-6 mr-2" />
              <span className="font-semibold text-xl">NewsletterAI</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-light-hover dark:hover:bg-dark-hover"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user ? (
              <Button
                className="ml-4"
                onClick={() => navigate("/app")}
              >
                Go to App
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="ml-4"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button
                  className="ml-2"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
