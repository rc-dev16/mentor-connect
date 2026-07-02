import { getClerkSessionToken } from "@/auth/services/clerk-token";
import type { AuthSession } from "@/auth/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

async function parseApiError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = await response.json();
    if (data?.message) message = data.message;
  } catch {
    // Response body is optional; keep the fallback message.
  }
  throw new Error(message);
}

async function getAuthHeaders() {
  const token = await getClerkSessionToken();
  if (!token) {
    throw new Error("Missing Clerk session token. Please sign in again.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const authApi = {
  async getAuthSession(): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      await parseApiError(response, "Failed to load auth session");
    }

    return response.json();
  },

  async completePasswordSetup(password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/password-setup-complete`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      await parseApiError(response, "Failed to complete password setup");
    }

    return response.json();
  },
};
