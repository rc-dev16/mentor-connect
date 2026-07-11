import { apiClient } from "@/data/api/client";
import type { Mentee, MentorInfo, UpdateProfileInput, UserProfile } from "@/data/types/users.types";

export const usersApi = {
  getProfile: () => apiClient.get<UserProfile>("/users/profile", "Failed to fetch user profile"),

  updateProfile: (data: UpdateProfileInput) =>
    apiClient.put<UserProfile>("/users/profile", data, "Failed to update profile"),

  getMyMentor: () => apiClient.get<MentorInfo>("/users/my-mentor", "Failed to fetch mentor"),

  getMentees: () => apiClient.get<Mentee[]>("/users/mentees", "Failed to fetch mentees"),
};
