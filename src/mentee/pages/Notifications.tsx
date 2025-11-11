import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, FileText, Bell, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read"
      });
    }
  };

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

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case "session_request":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "session_status":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'resource_added') {
      navigate('/resources');
    } else if (notification.type === 'meeting_notes') {
      navigate('/mentorship-connect');
    } else if (notification.type === 'info_update') {
      navigate('/personal-info');
    } else if (notification.type === 'session_status') {
      navigate('/mentorship-connect');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-2">View all your notifications and updates</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Notifications</span>
            {unreadCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm mt-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 pb-4 border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getNotificationIcon(notification)}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                        <p className="text-base text-foreground break-words">{notification.message}</p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </div>
                    {notification.type === "resource_added" && (
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/resources');
                        }}
                      >
                        View Resources
                      </Button>
                    )}
                    {notification.type === "meeting_notes" && (
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/mentorship-connect');
                        }}
                      >
                        View Notes
                      </Button>
                    )}
                    {notification.type === "info_update" && (
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/personal-info');
                        }}
                      >
                        Update Now
                      </Button>
                    )}
                    <p className="text-sm text-muted-foreground">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
