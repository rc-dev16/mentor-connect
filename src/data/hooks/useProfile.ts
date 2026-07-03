import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/data/api/users.api";
import { queryKeys } from "@/data/api/query-keys";
import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";

export function useProfile() {
  const { userId } = useAuth();
  const summary = useDashboardSummary();

  return useQuery({
    queryKey: queryKeys.users.profile(userId || undefined),
    queryFn: () => usersApi.getProfile(),
    enabled: !!userId,
    placeholderData: summary.data?.profile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyMentor() {
  const { userId } = useAuth();
  const summary = useDashboardSummary();

  return useQuery({
    queryKey: queryKeys.users.mentor(userId || undefined),
    queryFn: () => usersApi.getMyMentor(),
    enabled: !!userId,
    placeholderData: summary.data?.mentor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMentees() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.mentees(userId || undefined),
    queryFn: () => usersApi.getMentees(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
