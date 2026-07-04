import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PasswordSetupBanner, usePasswordSetupBannerVisible } from "@/auth/components/PasswordSetupBanner";
import { AppTopbar, type AppSettingsPath } from "@/components/layout/AppTopbar";

export type AppShellProps = {
  settingsPath: AppSettingsPath;
  sidebar: ReactNode;
  children: ReactNode;
  isSidebarCollapsed: boolean;
  onMenuClick: () => void;
};

export function AppShell({
  settingsPath,
  sidebar,
  children,
  isSidebarCollapsed,
  onMenuClick,
}: AppShellProps) {
  const showPasswordBanner = usePasswordSetupBannerVisible();

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          "--app-chrome-top": showPasswordBanner ? "6.75rem" : "4rem",
          "--app-sidebar-width": isSidebarCollapsed ? "5rem" : "16rem",
        } as CSSProperties
      }
    >
      <AppTopbar onMenuClick={onMenuClick} settingsPath={settingsPath} />
      <PasswordSetupBanner settingsPath={settingsPath} />
      {sidebar}

      <main
        className={cn(
          "pt-[var(--app-chrome-top)] h-[calc(100vh-var(--app-chrome-top))] transition-all duration-300 overflow-hidden",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <div className="h-full p-6 max-w-7xl mx-auto overflow-auto">{children}</div>
      </main>
    </div>
  );
}
