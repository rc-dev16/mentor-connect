import { AlertCircle, CheckCircle, FileText, Calendar, XCircle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  // This will be fetched from backend later
  const notifications = [
    { 
      id: 1, 
      type: "session_request",
      status: "pending",
      message: "Your mentorship session request for 'Career Guidance' is pending approval",
      time: "10 mins ago" 
    },
    { 
      id: 2, 
      type: "session_status",
      status: "accepted",
      message: "Mentor accepted your session request for 'Technical Discussion'",
      time: "2 hours ago",
      meetingTime: "Oct 5, 2025 at 2:00 PM"
    },
    { 
      id: 3, 
      type: "info_update",
      status: "reminder",
      message: "Please update your personal information before Oct 10",
      time: "1 day ago" 
    },
    { 
      id: 4, 
      type: "meeting_notes",
      status: "new",
      message: "Meeting notes available for 'Project Review Session'",
      time: "1 day ago",
      link: "/mentorship-connect"
    },
    { 
      id: 5, 
      type: "session_status",
      status: "rescheduled",
      message: "Your session 'Career Planning' has been rescheduled",
      time: "2 days ago",
      oldTime: "Oct 3, 2025 at 3:00 PM",
      newTime: "Oct 4, 2025 at 4:00 PM"
    },
    // Additional older notifications
    { 
      id: 6, 
      type: "session_status",
      status: "completed",
      message: "Session 'Code Review' completed",
      time: "5 days ago"
    },
    { 
      id: 7, 
      type: "meeting_notes",
      status: "new",
      message: "Meeting notes available for 'Career Development Session'",
      time: "1 week ago",
      link: "/mentorship-connect"
    }
  ];

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
      case "info_update":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "meeting_notes":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-2">View all your notifications and updates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-0"
              >
                {getNotificationIcon(notification)}
                <div className="flex-1 space-y-2">
                  <p className="text-base text-foreground">{notification.message}</p>
                  {notification.type === "session_status" && notification.status === "accepted" && (
                    <p className="text-sm text-green-600 font-medium">
                      Scheduled for {notification.meetingTime}
                    </p>
                  )}
                  {notification.type === "session_status" && notification.status === "rescheduled" && (
                    <div className="text-sm space-y-1">
                      <p className="text-red-500 line-through">{notification.oldTime}</p>
                      <p className="text-green-600">Rescheduled to: {notification.newTime}</p>
                    </div>
                  )}
                  {notification.type === "meeting_notes" && (
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-primary"
                      onClick={() => window.location.href = notification.link}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
