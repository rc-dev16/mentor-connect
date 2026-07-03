import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "@/data/api/resources.api";
import { queryKeys } from "@/data/api/query-keys";
import type { CreateResourceInput } from "@/data/types/resources.types";

export function useResourceMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (data: CreateResourceInput) => resourcesApi.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(userId || undefined) });
    },
  });
}
