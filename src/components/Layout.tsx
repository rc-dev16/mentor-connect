import { useState } from "react";
import Sidebar from "./Sidebar";
import { AppDataProvider } from "@/data/providers/AppDataProvider";
import { AppShell } from "@/components/layout/AppShell";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppDataProvider>
      <AppShell
        settingsPath="/settings"
        isSidebarCollapsed={isSidebarCollapsed}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebar={
          <Sidebar
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

export default Layout;
