import { apiClient } from "@/data/api/client";

export const notificationsApi = {
  getNotifications: () => apiClient.get("/notifications", "Failed to fetch notifications"),

  getUnreadCount: () => apiClient.get("/notifications/unread-count", "Failed to fetch unread count"),

  markAsRead: (notificationId: string) =>
    apiClient.put(`/notifications/${notificationId}/read`, undefined, "Failed to mark notification as read"),

  markAllAsRead: () =>
    apiClient.put("/notifications/read-all", undefined, "Failed to mark all notifications as read"),
};
