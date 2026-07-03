import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/auth/services/auth-api";
import { queryKeys } from "@/data/api/query-keys";
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
  const query = useQuery<AuthSession, Error>({
    queryKey: queryKeys.auth.session(userId),
    queryFn: async () => {
      const authSession = await authApi.getAuthSession();
      if (!isUserRole(authSession?.role)) {
        throw new Error("Your account does not have a valid Mentor-Connect role.");
      }
      if (userId) setCachedRole(userId, authSession.role);
      return authSession;
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const checkingSession = enabled && !!userId && query.isPending;

  const sessionError = query.isError
    ? query.error?.message || "Failed to load your profile."
    : null;

  if (query.isError && userId) {
    clearRoleCache(userId);
  }

  return {
    session: query.data ?? null,
    checkingSession,
    sessionError,
  };
}
