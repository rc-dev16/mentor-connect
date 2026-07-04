import { useState } from "react";
import MentorSidebar from "@/mentor/components/MentorSidebar";
import { AppDataProvider } from "@/data/providers/AppDataProvider";
import { AppShell } from "@/components/layout/AppShell";

interface MentorLayoutProps {
  children: React.ReactNode;
}

const MentorLayout = ({ children }: MentorLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppDataProvider>
      <AppShell
        settingsPath="/mentor/settings"
        isSidebarCollapsed={isSidebarCollapsed}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebar={
          <MentorSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        }
      >
        {children}
      </AppShell>
    </AppDataProvider>
  );
};

export default MentorLayout;
