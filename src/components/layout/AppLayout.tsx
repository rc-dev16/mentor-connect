import { useState } from "react";
import { AppDataProvider } from "@/data/providers/AppDataProvider";
import { AppShell } from "@/components/layout/AppShell";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { menteeNavItems, mentorNavItems } from "@/components/layout/nav.config";
import type { AppSettingsPath } from "@/components/layout/AppTopbar";

export type AppLayoutProps = {
  role: "mentee" | "mentor";
  children: React.ReactNode;
};

const settingsPathByRole: Record<AppLayoutProps["role"], AppSettingsPath> = {
  mentee: "/settings",
  mentor: "/mentor/settings",
};

const navItemsByRole = {
  mentee: menteeNavItems,
  mentor: mentorNavItems,
} as const;

export function AppLayout({ role, children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppDataProvider>
      <AppShell
        settingsPath={settingsPathByRole[role]}
        isSidebarCollapsed={isSidebarCollapsed}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebar={
          <AppSidebar
            items={navItemsByRole[role]}
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
}
