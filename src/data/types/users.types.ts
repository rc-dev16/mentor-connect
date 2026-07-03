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
  user_type?: string;
};

export type UpdateProfileInput = {
  phone?: string;
  cabin?: string;
  availability?: string;
  bio?: string;
};

export type MentorInfo = {
  name?: string;
  email?: string;
  phone?: string;
  cabin?: string;
  availability?: string;
};

export type DashboardStats = {
  totalMentees: number;
  upcomingMeetings: number;
  pendingRequests: number;
  completedSessions: number;
};
