import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, Bell, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";
import type { ActivityItem } from "@/data/types/meetings.types";

const formatDateDMY = (isoDate: string | undefined) => {
  if (!isoDate) return "";
  const d = String(isoDate).slice(0, 10);
  const [y, m, d2] = d.split("-");
  return `${d2}-${m}-${y}`;
};

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useDashboardSummary();
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);

  const mentorName = summary?.profile?.name || "Mentor";
  const stats = summary?.stats || {
    totalMentees: 0,
    upcomingMeetings: 0,
    pendingRequests: 0,
    completedSessions: 0,
  };

  const upcoming = (summary?.upcomingMeetings || []).map((m) => ({
    id: m.id,
    date: typeof m.meeting_date === "string" ? m.meeting_date.slice(0, 10) : m.meeting_date,
    time: (m.meeting_time || "").slice(0, 5),
    topic: m.topic || m.title || "Meeting",
    teamsLink: m.teams_link,
  }));

  const notifications = (summary?.recentActivity || []).slice(0, 5);
  const allNotifications = summary?.recentActivity || [];

  const renderActivityBadge = (n: ActivityItem) => {
    const msg = n.message || "";
    const lower = msg.toLowerCase();
    let badge = "UPDATE";
    let badgeClass = "bg-muted text-foreground";
    let icon: React.ReactNode = <Bell className="h-4 w-4 text-primary" />;
    if (lower.includes("session request")) {
      badge = "REQUEST";
      badgeClass = "bg-blue-100 text-blue-700";
      icon = <Calendar className="h-4 w-4 text-blue-600" />;
    }
    if (lower.includes("approved")) {
      badge = "APPROVED";
      badgeClass = "bg-green-100 text-green-700";
      icon = <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (lower.includes("rejected") || lower.includes("cancelled")) {
      badge = "REJECTED";
      badgeClass = "bg-red-100 text-red-700";
      icon = <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (lower.includes("rescheduled")) {
      badge = "RESCHEDULED";
      badgeClass = "bg-amber-100 text-amber-700";
      icon = <Clock className="h-4 w-4 text-amber-600" />;
    }
    if (lower.includes("completed")) {
      badge = "COMPLETED";
      badgeClass = "bg-emerald-100 text-emerald-700";
      icon = <CheckCircle className="h-4 w-4 text-emerald-600" />;
    }
    if (lower.includes("scheduled:")) {
      badge = "SCHEDULED";
      badgeClass = "bg-violet-100 text-violet-700";
      icon = <Calendar className="h-4 w-4 text-violet-600" />;
    }
    return { badge, badgeClass, icon };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Mentor Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Welcome back, {isLoading ? "Loading..." : mentorName}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMentees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : upcoming.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No upcoming meetings</div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((meeting) => (
                  <div key={meeting.id} className="flex items-start justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">{meeting.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateDMY(meeting.date)} at {meeting.time}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => meeting.teamsLink && window.open(meeting.teamsLink, "_blank")}
                      disabled={!meeting.teamsLink}
                    >
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/mentor/meetings")}>
              View All Meetings
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const { badge, badgeClass, icon } = renderActivityBadge(n);
                  return (
                    <div key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                      <div className="mt-0.5">{icon}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider ${badgeClass}`}>
                            {badge}
                          </span>
                          <p className="text-sm leading-snug break-words">{n.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => setIsNotificationsDialogOpen(true)}>
              View All Notifications
            </Button>
          </CardContent>
        </Card>

        <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>All Notifications</DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : allNotifications.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
                {allNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="space-y-1">
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MentorDashboard;
