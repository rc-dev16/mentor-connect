import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { sessionRequestsApi } from "@/data/api/session-requests.api";
import { queryKeys } from "@/data/api/query-keys";

export function useSessionRequests(status?: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.sessionRequests.all(userId || undefined, status),
    queryFn: () => sessionRequestsApi.getSessionRequests(status),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
