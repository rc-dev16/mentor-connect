import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { registerClerkTokenGetter } from "@/auth/services/clerk-token";

/**
 * Wires Clerk's useAuth().getToken into the API layer (non-React code).
 */
export function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    registerClerkTokenGetter(async () => {
      if (!isLoaded || !isSignedIn) return null;

      try {
        return await getToken();
      } catch (err) {
        console.error("[ClerkAuthBridge] getToken failed:", err);
        throw err;
      }
    });

    return () => registerClerkTokenGetter(null);
  }, [getToken, isLoaded, isSignedIn]);

  return <>{children}</>;
}
