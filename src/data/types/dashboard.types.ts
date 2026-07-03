import type { ActivityItem, MeetingSummary } from "@/data/types/meetings.types";
import type { DashboardStats, MentorInfo, UserProfile } from "@/data/types/users.types";

export type DashboardSummary = {
  profile: UserProfile;
  mentor?: MentorInfo | null;
  stats?: DashboardStats;
  upcomingMeetings: MeetingSummary[];
  recentActivity: ActivityItem[];
};
