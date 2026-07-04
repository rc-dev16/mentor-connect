import { User, Menu, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutWithClerk } from "@/auth/services/sign-out";
import { useProfile } from "@/data/hooks/useProfile";

export type AppSettingsPath = "/settings" | "/mentor/settings";

export type AppTopbarProps = {
  onMenuClick: () => void;
  settingsPath: AppSettingsPath;
};

export function AppTopbar({ onMenuClick, settingsPath }: AppTopbarProps) {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.name || (isLoading ? "Loading..." : "User");
  const displayEmail = profile?.email || "";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 shadow-sm">
      <div className="flex items-center h-full px-4 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex shrink-0 items-center">
            <img
              src="/logo.png"
              alt="Mentor-Connect logo"
              className="h-14 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling;
                if (fallback instanceof HTMLElement) fallback.style.display = "flex";
              }}
            />
            <div
              className="hidden h-14 w-14 items-center justify-center rounded-lg bg-primary"
              aria-hidden
            >
              <span className="text-base font-bold text-primary-foreground">MC</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <h1
            className="text-2xl font-black text-primary whitespace-nowrap uppercase tracking-wide"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Mentor-Connect
          </h1>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 w-auto max-w-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary opacity-100" />
                </div>
                <div className="hidden sm:block text-left flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-72">{displayEmail}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => navigate(settingsPath)} className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOutWithClerk(signOut, userId || undefined)}
                className="gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
