import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/data/api/resources.api";
import { queryKeys } from "@/data/api/query-keys";

export function useResources() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.resources.all(userId || undefined),
    queryFn: () => resourcesApi.getResources(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
