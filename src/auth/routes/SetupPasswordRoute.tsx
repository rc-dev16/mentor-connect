import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import SetupPassword from "@/pages/SetupPassword";

export function SetupPasswordRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <SetupPassword />;
}
