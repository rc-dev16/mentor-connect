import { useEffect, useState } from "react";
import { Clock, Bell, Mail, Phone, Building2, AlertCircle, CheckCircle, FileText, Calendar, XCircle, Info, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import apiService from "@/services/api";

const getNotificationIcon = (notification: any) => {
  switch (notification.type) {
    case "session_request":
      return notification.status === "pending" ? 
        <AlertCircle className="h-5 w-5 text-yellow-500" /> :
        <CheckCircle className="h-5 w-5 text-green-500" />;
    case "session_status":
      return notification.status === "accepted" ?
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
  const [studentInfo, setStudentInfo] = useState<any>({ name: "", email: "" });
  const [assignedMentor, setAssignedMentor] = useState<any>({ 
    name: "", 
    email: "", 
    phone: "", 
    cabin: "", 
    availability: "" 
  });
  const [loadingHeader, setLoadingHeader] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const [profile, mentor] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getMyMentor().catch(() => null),
        ]);
        setStudentInfo(profile || {});
        if (mentor) {
          setAssignedMentor({
            name: mentor.name || "",
            email: mentor.email || "",
            phone: mentor.phone || "",
            cabin: mentor.cabin || "",
            availability: mentor.availability || ""
          });
        }
      } catch (e) {
        // fallback to blanks
      } finally {
        setLoadingHeader(false);
      }
    };
    load();
  }, []);

  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await apiService.getMenteeMeetings('scheduled');
        const mapped = Array.isArray(data) ? data.slice(0, 5).map((m: any) => ({
          id: m.id,
          topic: m.topic || m.title || 'Meeting',
          date: (m.meeting_date || '').slice(0, 10),
          time: (m.meeting_time || '').slice(0, 5),
          teamsLink: m.teams_link,
        })) : [];
        setUpcomingMeetings(mapped);
      } catch (e) {
        setUpcomingMeetings([]);
      }
    };
    loadMeetings();
  }, []);

  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch notifications from the notifications API
        const notifications = await apiService.getNotifications().catch(() => []);
        
        const formatTimeAgo = (dateString: string) => {
          const date = new Date(dateString);
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

          if (diffInSeconds < 60) return 'Just now';
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
          if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
          return date.toLocaleDateString();
        };

        // Also fetch session requests for backward compatibility
        const requests = await apiService.getSessionRequests().catch(() => []);
        const toDateOnly = (v: any) => {
          if (!v) return '';
          const s = typeof v === 'string' ? v : new Date(v).toISOString();
          return s.slice(0, 10); // YYYY-MM-DD
        };
        const formatDMY = (yyyyMmDd: string) => {
          if (!yyyyMmDd) return '';
          const [y, m, d] = yyyyMmDd.split('-');
          return `${d}-${m}-${y}`;
        };
        const formatHM = (hhmm?: string) => (hhmm ? hhmm.slice(0, 5) : '');

        // Map notifications from API
        const notificationItems = Array.isArray(notifications) ? notifications.map((n: any) => {
            return {
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              time: formatTimeAgo(n.created_at),
              created_at: n.created_at,
              is_read: n.is_read,
              related_entity_type: n.related_entity_type,
              related_entity_id: n.related_entity_id
            };
          }) : [];

        // Map session requests (for backward compatibility)
        const requestItems = Array.isArray(requests) ? requests.map((r: any) => {
            const status = (r.status || '').toLowerCase();
            const type = status === 'pending' ? 'session_request' : 'session_status';
            const dateOnly = toDateOnly(r.preferred_date);
            const message = status === 'pending'
              ? `Your mentorship session request for '${r.title}' is pending approval`
              : status === 'approved'
                ? `Your session request accepted by mentor`
                : `Your mentorship session request '${r.title}' was rejected`;
            const time = formatTimeAgo(r.updated_at || r.created_at);
            return { 
              id: `request-${r.id}`, 
              type, 
              status, 
              title: 'Session Request',
              message, 
              time, 
              created_at: r.updated_at || r.created_at,
              updated_at: r.updated_at,
              scheduledDate: formatDMY(dateOnly), 
              scheduledTime: formatHM(r.preferred_time),
              is_read: false
            };
          }) : [];

        // Combine notifications and session requests
        const allItems = [...notificationItems, ...requestItems]
          .sort((a: any, b: any) => {
            // Sort unread first, then by date (most recent first)
            if (a.is_read !== b.is_read) {
              return a.is_read ? 1 : -1;
            }
            // Sort by date
            const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
            const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 10);

        setRecentNotifications(allItems);
      } catch (e) {
        console.error('Error loading notifications:', e);
        setRecentNotifications([]);
      }
    };
    load();
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Mentee Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Welcome back, {loadingHeader ? '...' : (studentInfo.name || 'Student')}!</p>
      </div>

      {/* Assigned Mentor Info */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Your Mentor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">{assignedMentor.name || '—'}</h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-base">{assignedMentor.email || '—'}</span>
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
                        {meeting.date.split('-').reverse().join('-')} at {meeting.time}
                      </p>
                    </div>
                    <Button size="default" variant="outline" className="px-6" disabled={!meeting.teamsLink} onClick={() => meeting.teamsLink && window.open(meeting.teamsLink, '_blank')}>
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
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
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
                      {notification.type === "session_status" && notification.status === "rescheduled" && (
                        <div className="text-sm space-y-1">
                          <p className="text-red-500 line-through">{notification.oldTime}</p>
                          <p className="text-green-600">Rescheduled to: {notification.newTime}</p>
                        </div>
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
                          onClick={() => window.location.href = notification.link || "/mentorship-connect"}
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
                          !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg' : ''
                        }`}
                      >
                        {getNotificationIcon(notification)}
                        <div className="flex-1 space-y-2">
                          {notification.title && (
                            <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                          )}
                          <p className="text-base text-foreground">{notification.message}</p>
                          {notification.type === "session_status" && notification.status === "accepted" && (
                            <p className="text-sm text-green-600 font-medium">
                              Scheduled for {notification.scheduledTime} on {notification.scheduledDate}
                            </p>
                          )}
                          {notification.type === "session_status" && notification.status === "rescheduled" && (
                            <div className="text-sm space-y-1">
                              <p className="text-red-500 line-through">{notification.oldTime}</p>
                              <p className="text-green-600">Rescheduled to: {notification.newTime}</p>
                            </div>
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
                              onClick={() => window.location.href = notification.link || "/mentorship-connect"}
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
