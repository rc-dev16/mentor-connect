import type { AuthSession } from "@/auth/types";
import { apiClient } from "@/data/api/client";

export const authApi = {
  getAuthSession: () => apiClient.get<AuthSession>("/auth/session", "Failed to load auth session"),

  completePasswordSetup: (password: string) =>
    apiClient.post("/auth/password-setup-complete", { password }, "Failed to complete password setup"),
};
