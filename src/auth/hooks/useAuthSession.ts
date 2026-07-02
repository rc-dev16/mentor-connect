import { useEffect, useState } from "react";
import { authApi } from "@/auth/services/auth-api";
import type { AuthSession, UserRole } from "@/auth/types";
import { isUserRole } from "@/auth/types";

const roleCacheKey = (userId: string) => `userType:${userId}`;

export function clearRoleCache(userId?: string) {
  sessionStorage.removeItem("userType");
  if (userId) sessionStorage.removeItem(roleCacheKey(userId));
}

export function clearAllRoleCache(userId?: string) {
  clearRoleCache(userId);
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith("userType:"))
    .forEach((key) => sessionStorage.removeItem(key));
}

function setCachedRole(userId: string, role: UserRole) {
  sessionStorage.setItem(roleCacheKey(userId), role);
  sessionStorage.removeItem("userType");
}

export function useAuthSession(enabled: boolean, userId?: string) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(enabled);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      setSession(null);
      setSessionError(null);
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    const fetchSession = async () => {
      try {
        setCheckingSession(true);
        setSessionError(null);
        const authSession = await authApi.getAuthSession();
        if (!isUserRole(authSession?.role)) {
          throw new Error("Your account does not have a valid Mentor-Connect role.");
        }
        if (cancelled) return;
        setSession(authSession);
        setCachedRole(userId, authSession.role);
      } catch (error) {
        if (cancelled) return;
        const msg = error instanceof Error ? error.message : "Failed to load your profile.";
        console.error("[auth] failed to load backend profile:", msg);
        clearRoleCache(userId);
        setSession(null);
        setSessionError(msg);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  return { session, checkingSession, sessionError };
}
