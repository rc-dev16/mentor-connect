import { useAuth, useClerk } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { AuthStatus } from "@/auth/components/AuthStatus";
import { clearRoleCache, useAuthSession } from "@/auth/hooks/useAuthSession";
import { signOutWithClerk } from "@/auth/services/sign-out";
import type { UserRole } from "@/auth/types";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRole: UserRole;
};

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const { session, checkingSession, sessionError } = useAuthSession(Boolean(isLoaded && isSignedIn), userId || undefined);

  if (!isLoaded || checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (!isSignedIn) {
    clearRoleCache(userId || undefined);
    return <Navigate to="/login" replace />;
  }

  if (sessionError || !session) {
    const isProvisioningError = sessionError?.toLowerCase().includes("not provisioned");
    return (
      <AuthStatus
        title={isProvisioningError ? "Account not provisioned" : "Unable to verify access"}
        description={
          isProvisioningError
            ? "This signed-in email is not active in the Mentor-Connect database."
            : sessionError || "Mentor-Connect could not load your account role."
        }
        onSignOut={() => signOutWithClerk(signOut, userId || undefined)}
      />
    );
  }

  if (session.role !== allowedRole) {
    return allowedRole === "mentor"
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/mentor/dashboard" replace />;
  }

  return <>{children}</>;
}
