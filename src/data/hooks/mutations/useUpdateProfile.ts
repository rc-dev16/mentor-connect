import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/data/api/users.api";
import { queryKeys } from "@/data/api/query-keys";
import type { UpdateProfileInput } from "@/data/types/users.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId || undefined) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId || undefined) });
    },
  });
}
