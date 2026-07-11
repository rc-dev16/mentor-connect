import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personalInfoApi } from "@/data/api/personal-info.api";
import { queryKeys } from "@/data/api/query-keys";
import type { SavePersonalInfoInput } from "@/data/types/personal-info.types";

export function usePersonalInfoMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (data: SavePersonalInfoInput) => personalInfoApi.savePersonalInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalInfo.own(userId || undefined) });
    },
  });
}
