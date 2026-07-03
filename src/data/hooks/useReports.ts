import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/data/api/reports.api";
import { queryKeys } from "@/data/api/query-keys";

export function useReports() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.reports.all(userId || undefined),
    queryFn: () => reportsApi.getReports(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
