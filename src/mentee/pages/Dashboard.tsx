import { Clock, Bell, Mail, Phone, Building2, AlertCircle, CheckCircle, FileText, Calendar, XCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";
import type { ActivityItem } from "@/data/types/meetings.types";

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const mapActivityToNotification = (item: ActivityItem) => {
  const status = (item.status || "").toLowerCase();
  const type =
    item.type === "session_request" && status && status !== "pending"
      ? "session_status"
      : item.type || "notification";

  const timestamp = item.ts || item.created_at || item.time || "";
  const displayTime = timestamp && !Number.isNaN(Date.parse(timestamp))
    ? formatTimeAgo(timestamp)
    : item.time || "";

  let scheduledDate: string | undefined;
  let scheduledTime: string | undefined;
  if (type === "session_status" && status === "approved" && item.time) {
    const parts = item.time.split(" ");
    scheduledDate = parts[0];
    scheduledTime = parts[1];
  }

  return {
    id: item.id,
    type,
    status,
    title: item.title,
    message: item.message,
    time: displayTime,
    created_at: timestamp,
    is_read: item.is_read ?? false,
    scheduledDate,
    scheduledTime,
  };
};

const getNotificationIcon = (notification: ReturnType<typeof mapActivityToNotification>) => {
  switch (notification.type) {
    case "session_request":
      return notification.status === "pending" ?
        <AlertCircle className="h-5 w-5 text-yellow-500" /> :
        <CheckCircle className="h-5 w-5 text-green-500" />;
    case "session_status":
      return notification.status === "accepted" || notification.status === "approved" ?
        <CheckCircle className="h-5 w-5 text-green-500" /> :
        notification.status === "rescheduled" ?
        <Calendar className="h-5 w-5 text-blue-500" /> :
        notification.status === "completed" ?
        <CheckCircle className="h-5 w-5 text-green-500" /> :
        <XCircle className="h-5 w-5 text-red-500" />;
    case "resource_added":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "info_update":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "meeting_notes":
      return <FileText className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
};

const MenteeDashboard = () => {
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

  const upcomingMeetings = (summary?.upcomingMeetings || []).slice(0, 5).map((m) => ({
    id: m.id,
    topic: m.topic || m.title || "Meeting",
    date: (m.meeting_date || "").slice(0, 10),
    time: (m.meeting_time || "").slice(0, 5),
    teamsLink: m.teams_link,
  }));

  const recentNotifications = (summary?.recentActivity || []).map(mapActivityToNotification);

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Mentee Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome back, {loadingHeader ? "..." : (studentInfo.name || "Student")}!</p>
      </div>

      {/* Assigned Mentor Info */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Your Mentor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">{assignedMentor.name || "—"}</h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-base">{assignedMentor.email || "—"}</span>
            </div>
            {assignedMentor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-base">{assignedMentor.phone}</span>
              </div>
            )}
            {assignedMentor.cabin && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-base">Cabin: {assignedMentor.cabin}</span>
              </div>
            )}
            {assignedMentor.availability && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-base">Available: {assignedMentor.availability}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 flex-1 min-h-0">
        {/* Upcoming Meetings */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Clock className="h-6 w-6 text-primary" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 flex-1 overflow-auto">
              {upcomingMeetings.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  No upcoming meetings
                </div>
              ) : (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="space-y-2">
                      <p className="text-base font-medium text-foreground">{meeting.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.date.split("-").reverse().join("-")} at {meeting.time}
                      </p>
                    </div>
                    <Button size="default" variant="outline" className="px-6" disabled={!meeting.teamsLink} onClick={() => meeting.teamsLink && window.open(meeting.teamsLink, "_blank")}>
                      Join
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3">
              {recentNotifications.slice(0, 3).map((notification) => {

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${
                      !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {getNotificationIcon(notification)}
                    <div className="flex-1 min-w-0">
                      {notification.title && (
                        <p className="text-xs font-semibold text-foreground mb-1">{notification.title}</p>
                      )}
                      {notification.type === "session_status" && notification.status === "approved" && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                            <CheckCircle className="h-3 w-3" />
                            {notification.scheduledTime}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                            {notification.scheduledDate}
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground break-words">{notification.message}</p>
                      {notification.type === "resource_added" && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary"
                          onClick={() => window.location.href = "/resources"}
                        >
                          View Resources
                        </Button>
                      )}
                      {notification.type === "meeting_notes" && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary"
                          onClick={() => window.location.href = "/mentorship-connect"}
                        >
                          View Notes
                        </Button>
                      )}
                      {notification.type === "info_update" && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary"
                          onClick={() => window.location.href = "/personal-info"}
                        >
                          Update Now
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" variant="outline">
                  View All Notifications
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">All Notifications</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No notifications</p>
                      <p className="text-sm mt-2">You're all caught up!</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 pb-4 border-b border-border last:border-0 ${
                          !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg" : ""
                        }`}
                      >
                        {getNotificationIcon(notification)}
                        <div className="flex-1 space-y-2">
                          {notification.title && (
                            <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                          )}
                          <p className="text-base text-foreground">{notification.message}</p>
                          {notification.type === "session_status" && (notification.status === "accepted" || notification.status === "approved") && (
                            <p className="text-sm text-green-600 font-medium">
                              Scheduled for {notification.scheduledTime} on {notification.scheduledDate}
                            </p>
                          )}
                          {notification.type === "resource_added" && (
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-primary"
                              onClick={() => window.location.href = "/resources"}
                            >
                              View Resources
                            </Button>
                          )}
                          {notification.type === "meeting_notes" && (
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-primary"
                              onClick={() => window.location.href = "/mentorship-connect"}
                            >
                              View Notes
                            </Button>
                          )}
                          {notification.type === "info_update" && (
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-primary"
                              onClick={() => window.location.href = "/personal-info"}
                            >
                              Update Now
                            </Button>
                          )}
                          <p className="text-sm text-muted-foreground">{notification.time}</p>
                        </div>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenteeDashboard;
