import { apiClient } from "@/data/api/client";
import type {
  CompleteMeetingInput,
  CreateMeetingInput,
  Meeting,
  MeetingSummary,
  UpdateMeetingInput,
} from "@/data/types/meetings.types";
import type { MenteeListItem } from "@/data/types/users.types";
import type { ApiMessage } from "@shared/contracts/common";

export const meetingsApi = {
  getMeetings: (status?: string) => {
    const path = status ? `/meetings?status=${encodeURIComponent(status)}` : "/meetings";
    return apiClient.get<MeetingSummary[]>(path, "Failed to fetch meetings");
  },

  getMeeting: (id: string) => apiClient.get<Meeting>(`/meetings/${id}`, "Failed to fetch meeting"),

  createMeeting: (meetingData: CreateMeetingInput) =>
    apiClient.post<MeetingSummary>("/meetings", meetingData, "Failed to create meeting"),

  updateMeeting: (id: string, meetingData: UpdateMeetingInput) =>
    apiClient.put<MeetingSummary>(`/meetings/${id}`, meetingData, "Failed to update meeting"),

  completeMeeting: (id: string, comments: string, actionPoints: string, attendance: string[]) => {
    const body: CompleteMeetingInput = { comments, actionPoints, attendance };
    return apiClient.post<MeetingSummary>(
      `/meetings/${id}/complete`,
      body,
      "Failed to complete meeting"
    );
  },

  deleteMeeting: (id: string) =>
    apiClient.delete<ApiMessage>(`/meetings/${id}`, "Failed to delete meeting"),

  downloadMeetingPDF: (meetingId: string) =>
    apiClient.getBlob(`/meetings/${meetingId}/download`, "Failed to download meeting PDF"),

  getMenteesList: () =>
    apiClient.get<MenteeListItem[]>("/meetings/mentees/list", "Failed to fetch mentees list"),

  getMenteeMeetings: (status?: string) => {
    const path = status
      ? `/meetings/for-mentee?status=${encodeURIComponent(status)}`
      : "/meetings/for-mentee";
    return apiClient.get<MeetingSummary[]>(path, "Failed to fetch mentee meetings");
  },
};
