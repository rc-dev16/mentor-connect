import { useAuth, useClerk } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { AuthStatus } from "@/auth/components/AuthStatus";
import { clearRoleCache, useAuthSession } from "@/auth/hooks/useAuthSession";
import { signOutWithClerk } from "@/auth/services/sign-out";
import Login from "@/pages/Login";

export function LoginRoute() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const { session, checkingSession, sessionError } = useAuthSession(Boolean(isLoaded && isSignedIn), userId || undefined);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isSignedIn) {
    clearRoleCache(userId || undefined);
    return <Login />;
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Setting up your session...</div>;
  }

  if (sessionError || !session) {
    const isProvisioningError = sessionError?.toLowerCase().includes("not provisioned");
    return (
      <AuthStatus
        title={isProvisioningError ? "Account not provisioned" : "Unable to complete sign in"}
        description={
          isProvisioningError
            ? "This email is not active in the Mentor-Connect database."
            : sessionError || "Mentor-Connect could not load your account role."
        }
        onSignOut={() => signOutWithClerk(signOut, userId || undefined)}
      />
    );
  }

  if (session.requiresPasswordSetup) {
    return <Navigate to="/setup-password" replace />;
  }

  const targetPath = session.role === "mentor" ? "/mentor/dashboard" : "/dashboard";
  return <Navigate to={targetPath} replace />;
}
