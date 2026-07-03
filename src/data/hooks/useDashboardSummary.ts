import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/data/api/dashboard.api";
import { queryKeys } from "@/data/api/query-keys";

export function useDashboardSummary(enabled = true) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.summary(userId || undefined),
    queryFn: () => dashboardApi.getSummary(),
    enabled: enabled && !!userId,
    staleTime: 60 * 1000,
  });
}
