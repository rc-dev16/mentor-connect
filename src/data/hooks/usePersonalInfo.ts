import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { personalInfoApi } from "@/data/api/personal-info.api";
import { queryKeys } from "@/data/api/query-keys";

export function usePersonalInfo() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.personalInfo.own(userId || undefined),
    queryFn: () => personalInfoApi.getPersonalInfo(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useMenteeProfile(menteeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.personalInfo.mentee(menteeId || ""),
    queryFn: () => personalInfoApi.getMenteeProfile(menteeId!),
    enabled: !!menteeId,
  });
}
