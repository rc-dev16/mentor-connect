import type { ActivityItem, MeetingSummary } from "./meetings";
import type { DashboardStats, MentorInfo, UserProfile } from "./users";

export type DashboardSummary = {
  profile: UserProfile;
  mentor?: MentorInfo | null;
  stats?: DashboardStats;
  upcomingMeetings: MeetingSummary[];
  recentActivity: ActivityItem[];
};
