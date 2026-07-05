import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { meetingsApi } from "@/data/api/meetings.api";
import { queryKeys } from "@/data/api/query-keys";

export function useMeetings(status?: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.meetings.all(userId || undefined, status),
    queryFn: () => meetingsApi.getMeetings(status),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useMenteeMeetings(status?: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.meetings.mentee(userId || undefined, status),
    queryFn: () => meetingsApi.getMenteeMeetings(status),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useMenteesList() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.meetings.menteesList(userId || undefined),
    queryFn: () => meetingsApi.getMenteesList(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
