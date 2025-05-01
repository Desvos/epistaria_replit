import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Plus, 
  Inbox, 
  Star, 
  FileText, 
  Archive, 
  Settings, 
  LogOut,
  X
} from "lucide-react";

type AppSidebarProps = {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export default function AppSidebar({ isVisible, onClose, onLogout }: AppSidebarProps) {
  const [location, navigate] = useLocation();

  // Determine if we're on mobile based on the visibility prop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button className="w-full flex items-center justify-center" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          <span>Create Summary</span>
        </Button>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          <li>
            <Button
              variant="ghost"
              className={`w-full justify-start ${location === "/app" ? "bg-primary text-white dark:bg-primary dark:text-white" : ""}`}
              onClick={() => navigate("/app")}
            >
              <Inbox className="h-5 w-5 mr-2" />
              <span>Inbox</span>
              <span className="ml-auto bg-white dark:bg-white text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                24
              </span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Star className="h-5 w-5 mr-2" />
              <span>Starred</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <FileText className="h-5 w-5 mr-2" />
              <span>Summaries</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Archive className="h-5 w-5 mr-2" />
              <span>Archived</span>
            </Button>
          </li>
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-3 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
            Categories
          </h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-4"></span>
                <span>Tech</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-4"></span>
                <span>Business</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-4"></span>
                <span>Marketing</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-4"></span>
                <span>Finance</span>
              </Button>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <Settings className="h-5 w-5 mr-2" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    </>
  );

  // For mobile, use a Sheet component
  if (isMobile) {
    return (
      <Sheet open={isVisible} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-80">
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, use a fixed sidebar
  return (
    <aside className={`w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card h-full overflow-y-auto ${isVisible ? 'block' : 'hidden'}`}>
      {sidebarContent}
    </aside>
  );
}
