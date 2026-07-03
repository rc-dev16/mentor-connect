import { useState } from "react";
import { cn } from "@/lib/utils";
import MentorTopbar from "@/mentor/components/MentorTopbar";
import MentorSidebar from "@/mentor/components/MentorSidebar";
import { AppDataProvider } from "@/data/providers/AppDataProvider";

interface MentorLayoutProps {
  children: React.ReactNode;
}

const MentorLayout = ({ children }: MentorLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppDataProvider>
    <div className="min-h-screen bg-background">
      <MentorTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MentorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className={cn(
        "pt-16 h-[calc(100vh-4rem)] transition-all duration-300 overflow-hidden",
        isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <div className="h-full p-6 max-w-7xl mx-auto overflow-auto">
          {children}
        </div>
      </main>
    </div>
    </AppDataProvider>
  );
};

export default MentorLayout;
