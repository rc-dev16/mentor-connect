import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionRequestsApi } from "@/data/api/session-requests.api";
import { queryKeys } from "@/data/api/query-keys";
import type { SessionRequestStatus } from "@/data/types/session-requests.types";
import type { CreateSessionRequestInput } from "@/data/types/session-requests.types";

export function useSessionRequestMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["sessionRequests"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId || undefined) });
  };

  const createSessionRequest = useMutation({
    mutationFn: (payload: CreateSessionRequestInput) => sessionRequestsApi.createSessionRequest(payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
      mentor_notes,
    }: {
      id: string;
      status: SessionRequestStatus;
      mentor_notes?: string;
    }) => sessionRequestsApi.updateStatus(id, status, mentor_notes),
    onSuccess: invalidate,
  });

  const deleteSessionRequest = useMutation({
    mutationFn: (id: string) => sessionRequestsApi.deleteSessionRequest(id),
    onSuccess: invalidate,
  });

  return { createSessionRequest, updateStatus, deleteSessionRequest };
}
