import { apiClient } from "@/data/api/client";
import type { CreateSessionRequestInput } from "@/data/types/session-requests.types";

export const sessionRequestsApi = {
  getSessionRequests: (status?: string) => {
    const path = status
      ? `/session-requests?status=${encodeURIComponent(status)}`
      : "/session-requests";
    return apiClient.get(path, "Failed to fetch session requests");
  },

  createSessionRequest: (payload: CreateSessionRequestInput) =>
    apiClient.post("/session-requests", payload, "Failed to create session request"),

  updateStatus: (
    id: string,
    status: "pending" | "approved" | "rejected",
    mentor_notes?: string
  ) =>
    apiClient.put(
      `/session-requests/${id}/status`,
      { status, mentor_notes },
      "Failed to update session request"
    ),

  deleteSessionRequest: (id: string) =>
    apiClient.delete(`/session-requests/${id}`, "Failed to cancel session request"),
};
