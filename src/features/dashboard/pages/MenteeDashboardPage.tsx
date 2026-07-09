import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";
import { AssignedMentorCard } from "@/features/dashboard/components/AssignedMentorCard";
import { MenteeNotificationsPreviewCard } from "@/features/dashboard/components/MenteeNotificationsPreviewCard";
import { UpcomingMeetingsCard } from "@/features/dashboard/components/UpcomingMeetingsCard";
import {
  mapActivityToNotification,
  mapUpcomingMeeting,
} from "@/features/dashboard/lib/dashboard-presenters";

const MenteeDashboardPage = () => {
  const { data: summary, isLoading: loadingHeader } = useDashboardSummary();

  const studentInfo = summary?.profile || { name: "", email: "" };
  const assignedMentor = summary?.mentor
    ? {
        name: summary.mentor.name || "",
        email: summary.mentor.email || "",
        phone: summary.mentor.phone || "",
        cabin: summary.mentor.cabin || "",
        availability: summary.mentor.availability || "",
      }
    : { name: "", email: "", phone: "", cabin: "", availability: "" };

  const upcomingMeetings = (summary?.upcomingMeetings || []).slice(0, 5).map(mapUpcomingMeeting);
  const recentNotifications = (summary?.recentActivity || []).map(mapActivityToNotification);

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Mentee Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Welcome back, {loadingHeader ? "..." : studentInfo.name || "Student"}!
        </p>
      </div>

      <AssignedMentorCard mentor={assignedMentor} />

      <div className="grid gap-6 md:grid-cols-2 flex-1 min-h-0">
        <UpcomingMeetingsCard
          meetings={upcomingMeetings}
          titleClassName="flex items-center gap-3 text-xl"
          iconSize="lg"
          joinButtonVariant="outline"
          joinButtonSize="default"
        />
        <MenteeNotificationsPreviewCard notifications={recentNotifications} />
      </div>
    </div>
  );
};

export default MenteeDashboardPage;
