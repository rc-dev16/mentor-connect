import { useNavigate } from "react-router-dom";
import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";
import { MentorNotificationsPreviewCard } from "@/features/dashboard/components/MentorNotificationsPreviewCard";
import { StatsCardGrid } from "@/features/dashboard/components/StatsCardGrid";
import { UpcomingMeetingsCard } from "@/features/dashboard/components/UpcomingMeetingsCard";
import { mapUpcomingMeeting } from "@/features/dashboard/lib/dashboard-presenters";

const MentorDashboardPage = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useDashboardSummary();

  const mentorName = summary?.profile?.name || "Mentor";
  const stats = summary?.stats || {
    totalMentees: 0,
    upcomingMeetings: 0,
    pendingRequests: 0,
    completedSessions: 0,
  };

  const upcoming = (summary?.upcomingMeetings || []).map(mapUpcomingMeeting);
  const notifications = (summary?.recentActivity || []).slice(0, 5);
  const allNotifications = summary?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Mentor Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Welcome back, {isLoading ? "Loading..." : mentorName}!
        </p>
      </div>

      <StatsCardGrid stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingMeetingsCard
          meetings={upcoming}
          isLoading={isLoading}
          footerAction={{
            label: "View All Meetings",
            onClick: () => navigate("/mentor/meetings"),
          }}
        />
        <MentorNotificationsPreviewCard
          notifications={notifications}
          allNotifications={allNotifications}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MentorDashboardPage;
