import type { UserType } from "./common";

export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  registration_number?: string;
  department?: string;
  phone?: string;
  cabin?: string;
  availability?: string;
  bio?: string;
  user_type?: UserType;
  created_at?: string;
  updated_at?: string;
};

export type UpdateProfileInput = {
  phone?: string;
  cabin?: string;
  availability?: string;
  bio?: string;
};

export type MentorInfo = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  cabin?: string;
  availability?: string;
};

export type Mentee = {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  department: string;
  phone: string | null;
  bio: string | null;
  mentorship_status: string;
  has_personal_info?: boolean;
};

export type MenteeListItem = {
  id: string;
  name: string;
  registration_number: string;
  department?: string;
};

export type DashboardStats = {
  totalMentees: number;
  upcomingMeetings: number;
  pendingRequests: number;
  completedSessions: number;
};
