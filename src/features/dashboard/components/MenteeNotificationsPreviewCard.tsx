import { Bell, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getNotificationIcon,
  type DashboardNotificationView,
} from "@/features/dashboard/lib/dashboard-presenters";

interface MenteeNotificationsPreviewCardProps {
  notifications: DashboardNotificationView[];
}

const NotificationActions = ({ notification }: { notification: DashboardNotificationView }) => {
  if (notification.type === "resource_added") {
    return (
      <Button
        variant="link"
        className="h-auto p-0 text-primary"
        onClick={() => (window.location.href = "/resources")}
      >
        View Resources
      </Button>
    );
  }
  if (notification.type === "meeting_notes") {
    return (
      <Button
        variant="link"
        className="h-auto p-0 text-primary"
        onClick={() => (window.location.href = "/mentorship-connect")}
      >
        View Notes
      </Button>
    );
  }
  if (notification.type === "info_update") {
    return (
      <Button
        variant="link"
        className="h-auto p-0 text-primary"
        onClick={() => (window.location.href = "/personal-info")}
      >
        Update Now
      </Button>
    );
  }
  return null;
};

const NotificationItem = ({
  notification,
  compact = false,
}: {
  notification: DashboardNotificationView;
  compact?: boolean;
}) => (
  <div
    className={`flex items-start gap-3 ${
      compact
        ? `p-3 rounded-lg border hover:bg-accent/50 transition-colors ${
            !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
          }`
        : `pb-4 border-b border-border last:border-0 ${
            !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg" : ""
          }`
    }`}
  >
    {getNotificationIcon(notification)}
    <div className="flex-1 min-w-0 space-y-2">
      {notification.title && (
        <p className={compact ? "text-xs font-semibold text-foreground mb-1" : "text-sm font-semibold text-foreground"}>
          {notification.title}
        </p>
      )}
      {notification.type === "session_status" && notification.status === "approved" && compact && (
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
      <p className={compact ? "text-sm font-medium text-foreground break-words" : "text-base text-foreground"}>
        {notification.message}
      </p>
      {notification.type === "session_status" &&
        (notification.status === "accepted" || notification.status === "approved") &&
        !compact && (
          <p className="text-sm text-green-600 font-medium">
            Scheduled for {notification.scheduledTime} on {notification.scheduledDate}
          </p>
        )}
      <NotificationActions notification={notification} />
      <p className={compact ? "text-xs text-muted-foreground mt-1" : "text-sm text-muted-foreground"}>
        {notification.time}
      </p>
    </div>
    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
  </div>
);

export const MenteeNotificationsPreviewCard = ({ notifications }: MenteeNotificationsPreviewCardProps) => (
  <Card className="flex flex-col h-full">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-3 text-xl">
        <Bell className="h-6 w-6 text-primary" />
        Notifications
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid gap-3">
        {notifications.slice(0, 3).map((notification) => (
          <NotificationItem key={notification.id} notification={notification} compact />
        ))}
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
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-2">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
);
