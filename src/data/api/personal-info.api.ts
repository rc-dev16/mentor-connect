import { apiClient } from "@/data/api/client";
import type {
  MenteeProfile,
  PersonalInfoResponse,
  SavePersonalInfoInput,
} from "@/data/types/personal-info.types";
import type { ApiMessage } from "@shared/contracts/common";

export const personalInfoApi = {
  getPersonalInfo: () =>
    apiClient.get<PersonalInfoResponse>("/personal-info", "Failed to fetch personal information"),

  savePersonalInfo: (data: SavePersonalInfoInput) =>
    apiClient.post<ApiMessage>("/personal-info", data, "Failed to save personal information"),

  getMenteeProfile: (menteeId: string) =>
    apiClient.get<MenteeProfile>(
      `/personal-info/mentee/${menteeId}`,
      "Failed to fetch mentee profile"
    ),

  downloadMenteesPersonalInfo: () =>
    apiClient.getBlob("/personal-info/mentees/export", "Failed to download mentees data"),

  downloadMenteePersonalInfoPDF: (menteeId: string) =>
    apiClient.getBlob(`/personal-info/mentee/${menteeId}/pdf`, "Failed to download PDF"),
};
