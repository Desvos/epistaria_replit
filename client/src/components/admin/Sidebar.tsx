import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart, 
  Settings, 
  LogOut,
  X
} from "lucide-react";

type AdminSidebarProps = {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export default function AdminSidebar({ isVisible, onClose, onLogout }: AdminSidebarProps) {
  const [location, navigate] = useLocation();
  
  // Determine if we're on mobile based on the visibility prop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const sidebarContent = (
    <nav className="p-4 space-y-1">
      <Button
        variant="ghost"
        className={`w-full justify-start ${
          location === "/admin" ? "bg-primary text-white" : ""
        }`}
        onClick={() => navigate("/admin")}
      >
        <LayoutDashboard className="h-5 w-5 mr-2" />
        <span>Dashboard</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
      >
        <Users className="h-5 w-5 mr-2" />
        <span>Users</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
      >
        <CreditCard className="h-5 w-5 mr-2" />
        <span>Subscriptions</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
      >
        <BarChart className="h-5 w-5 mr-2" />
        <span>Analytics</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
      >
        <Settings className="h-5 w-5 mr-2" />
        <span>Settings</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start mt-8"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>Logout</span>
      </Button>
    </nav>
  );

  // For mobile, use a Sheet component
  if (isMobile) {
    return (
      <Sheet open={isVisible} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-72">
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
    <aside className={`w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 h-full ${isVisible ? 'block' : 'hidden'}`}>
      {sidebarContent}
    </aside>
  );
}
