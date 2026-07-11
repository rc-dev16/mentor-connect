import { apiClient } from "@/data/api/client";
import type {
  CreateSessionRequestInput,
  SessionRequest,
  SessionRequestStatus,
  UpdateSessionRequestStatusInput,
} from "@/data/types/session-requests.types";
import type { ApiMessage } from "@shared/contracts/common";

export const sessionRequestsApi = {
  getSessionRequests: (status?: string) => {
    const path = status
      ? `/session-requests?status=${encodeURIComponent(status)}`
      : "/session-requests";
    return apiClient.get<SessionRequest[]>(path, "Failed to fetch session requests");
  },

  createSessionRequest: (payload: CreateSessionRequestInput) =>
    apiClient.post<SessionRequest>("/session-requests", payload, "Failed to create session request"),

  updateStatus: (
    id: string,
    status: SessionRequestStatus,
    mentor_notes?: string
  ) => {
    const body: UpdateSessionRequestStatusInput = { status, mentor_notes };
    return apiClient.put<SessionRequest>(
      `/session-requests/${id}/status`,
      body,
      "Failed to update session request"
    );
  },

  deleteSessionRequest: (id: string) =>
    apiClient.delete<ApiMessage>(`/session-requests/${id}`, "Failed to cancel session request"),
};
