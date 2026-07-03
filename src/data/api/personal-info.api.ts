import { apiClient, type JsonPayload } from "@/data/api/client";

export const personalInfoApi = {
  getPersonalInfo: () => apiClient.get("/personal-info", "Failed to fetch personal information"),

  savePersonalInfo: (data: JsonPayload) =>
    apiClient.post("/personal-info", data, "Failed to save personal information"),

  getMenteeProfile: (menteeId: string) =>
    apiClient.get(`/personal-info/mentee/${menteeId}`, "Failed to fetch mentee profile"),

  downloadMenteesPersonalInfo: () =>
    apiClient.getBlob("/personal-info/mentees/export", "Failed to download mentees data"),

  downloadMenteePersonalInfoPDF: (menteeId: string) =>
    apiClient.getBlob(
      `/personal-info/mentee/${menteeId}/pdf`,
      "Failed to download PDF"
    ),
};
