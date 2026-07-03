import { clearAllRoleCache } from "@/auth/hooks/useAuthSession";
import { queryClient } from "@/data/query-client";

type ClerkSignOut = (opts?: { redirectUrl?: string }) => Promise<unknown>;

export async function signOutWithClerk(signOut: ClerkSignOut, userId?: string) {
  clearAllRoleCache(userId);
  queryClient.clear();
  await signOut({ redirectUrl: "/login" });
}
