import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsApi } from "@/data/api/meetings.api";
import { queryKeys } from "@/data/api/query-keys";
import type { CreateMeetingInput, UpdateMeetingInput } from "@/data/types/meetings.types";

export function useMeetingMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId || undefined) });
  };

  const createMeeting = useMutation({
    mutationFn: (data: CreateMeetingInput) => meetingsApi.createMeeting(data),
    onSuccess: invalidate,
  });

  const updateMeeting = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingInput }) =>
      meetingsApi.updateMeeting(id, data),
    onSuccess: invalidate,
  });

  const completeMeeting = useMutation({
    mutationFn: ({
      id,
      comments,
      actionPoints,
      attendance,
    }: {
      id: string;
      comments: string;
      actionPoints: string;
      attendance: string[];
    }) => meetingsApi.completeMeeting(id, comments, actionPoints, attendance),
    onSuccess: invalidate,
  });

  const deleteMeeting = useMutation({
    mutationFn: (id: string) => meetingsApi.deleteMeeting(id),
    onSuccess: invalidate,
  });

  return { createMeeting, updateMeeting, completeMeeting, deleteMeeting };
}
