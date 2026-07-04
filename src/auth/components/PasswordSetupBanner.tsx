import { Link } from "react-router-dom";
import { Pin } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useAuthSession } from "@/auth/hooks/useAuthSession";
import { cn } from "@/lib/utils";
import type { AppSettingsPath } from "@/components/layout/AppTopbar";

type PasswordSetupBannerProps = {
  settingsPath: AppSettingsPath;
};

export function PasswordSetupBanner({ settingsPath }: PasswordSetupBannerProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session, checkingSession } = useAuthSession(Boolean(isLoaded && isSignedIn), userId || undefined);

  if (!isLoaded || !isSignedIn || checkingSession || !session?.requiresPasswordSetup) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-16 right-0 z-40 border-b border-amber-200/80 bg-amber-50/95 px-4 py-2 text-xs text-amber-950",
        "left-0 transition-[left] duration-300 lg:left-[var(--app-sidebar-width,16rem)]"
      )}
      role="status"
    >
      <div className="flex items-center gap-2">
        <Pin className="h-3.5 w-3.5 shrink-0 text-amber-700 fill-amber-200/80" aria-hidden />
        <p className="leading-snug">
          Set a password in{" "}
          <Link to={settingsPath} className="font-medium underline underline-offset-2 hover:text-amber-900">
            Settings
          </Link>{" "}
          to sign in with email and password next time.
        </p>
      </div>
    </div>
  );
}

export function usePasswordSetupBannerVisible(): boolean {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session, checkingSession } = useAuthSession(Boolean(isLoaded && isSignedIn), userId || undefined);
  return Boolean(isLoaded && isSignedIn && !checkingSession && session?.requiresPasswordSetup);
}
