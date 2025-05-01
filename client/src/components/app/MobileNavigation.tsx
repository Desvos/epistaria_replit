import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Inbox, Star, Plus, FileText, Menu } from "lucide-react";

type MobileNavigationProps = {
  isVisible: boolean;
};

export default function MobileNavigation({ isVisible }: MobileNavigationProps) {
  const [location, navigate] = useLocation();

  if (!isVisible) return null;

  return (
    <div className="md:hidden bottom-0 fixed inset-x-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 z-10">
      <Button
        variant="ghost"
        size="icon"
        className={location === "/app" ? "text-primary" : "text-text-secondary-light dark:text-text-secondary-dark"}
        onClick={() => navigate("/app")}
      >
        <Inbox className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-text-secondary-light dark:text-text-secondary-dark"
      >
        <Star className="h-5 w-5" />
      </Button>
      
      <Button
        className="h-10 w-10 rounded-full bg-primary text-white shadow-md flex items-center justify-center"
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-text-secondary-light dark:text-text-secondary-dark"
      >
        <FileText className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-text-secondary-light dark:text-text-secondary-dark"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
