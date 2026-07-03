import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personalInfoApi } from "@/data/api/personal-info.api";
import { queryKeys } from "@/data/api/query-keys";
import type { JsonPayload } from "@/data/api/client";

export function usePersonalInfoMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (data: JsonPayload) => personalInfoApi.savePersonalInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalInfo.own(userId || undefined) });
    },
  });
}
