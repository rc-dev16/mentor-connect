import { apiClient, type JsonPayload } from "@/data/api/client";

export const meetingsApi = {
  getMeetings: (status?: string) => {
    const path = status ? `/meetings?status=${encodeURIComponent(status)}` : "/meetings";
    return apiClient.get(path, "Failed to fetch meetings");
  },

  getMeeting: (id: string) => apiClient.get(`/meetings/${id}`, "Failed to fetch meeting"),

  createMeeting: (meetingData: JsonPayload) =>
    apiClient.post("/meetings", meetingData, "Failed to create meeting"),

  updateMeeting: (id: string, meetingData: JsonPayload) =>
    apiClient.put(`/meetings/${id}`, meetingData, "Failed to update meeting"),

  completeMeeting: (id: string, comments: string, actionPoints: string, attendance: string[]) =>
    apiClient.post(
      `/meetings/${id}/complete`,
      { comments, actionPoints, attendance },
      "Failed to complete meeting"
    ),

  deleteMeeting: (id: string) => apiClient.delete(`/meetings/${id}`, "Failed to delete meeting"),

  downloadMeetingPDF: (meetingId: string) =>
    apiClient.getBlob(`/meetings/${meetingId}/download`, "Failed to download meeting PDF"),

  getMenteesList: () => apiClient.get("/meetings/mentees/list", "Failed to fetch mentees list"),

  getMenteeMeetings: (status?: string) => {
    const path = status
      ? `/meetings/for-mentee?status=${encodeURIComponent(status)}`
      : "/meetings/for-mentee";
    return apiClient.get(path, "Failed to fetch mentee meetings");
  },
};
