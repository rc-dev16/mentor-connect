import { useUser } from "@clerk/react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/auth/services/auth-api";
import { queryKeys } from "@/data/api/query-keys";
import { getClerkError } from "@/auth/hooks/useClerkSignIn";

export type PasswordFormMode = "setup" | "change";

export function usePasswordActions() {
  const { userId } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const invalidateSession = async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session(userId) });
  };

  const setupPassword = async (newPassword: string) => {
    if (!isLoaded || !isSignedIn) {
      throw new Error("No active Clerk session found.");
    }
    await authApi.completePasswordSetup(newPassword);
    await invalidateSession();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!isLoaded || !isSignedIn || !user) {
      throw new Error("No active Clerk session found.");
    }

    try {
      await user.updatePassword({ currentPassword, newPassword });
    } catch (error) {
      throw new Error(getClerkError(error, "Password update failed."));
    }
  };

  return {
    setupPassword,
    changePassword,
  };
}
