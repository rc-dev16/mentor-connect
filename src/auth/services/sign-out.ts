import { clearAllRoleCache } from "@/auth/hooks/useAuthSession";

type ClerkSignOut = (opts?: { redirectUrl?: string }) => Promise<unknown>;

export async function signOutWithClerk(signOut: ClerkSignOut, userId?: string) {
  clearAllRoleCache(userId);
  await signOut({ redirectUrl: "/login" });
}
