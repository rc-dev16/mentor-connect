import { apiClient } from "@/data/api/client";
import type {
  MarkAllReadResponse,
  Notification,
  UnreadCountResponse,
} from "@/data/types/notifications.types";
import type { ApiMessage } from "@shared/contracts/common";

export const notificationsApi = {
  getNotifications: () =>
    apiClient.get<Notification[]>("/notifications", "Failed to fetch notifications"),

  getUnreadCount: () =>
    apiClient.get<UnreadCountResponse>(
      "/notifications/unread-count",
      "Failed to fetch unread count"
    ),

  markAsRead: (notificationId: string) =>
    apiClient.put<ApiMessage>(
      `/notifications/${notificationId}/read`,
      undefined,
      "Failed to mark notification as read"
    ),

  markAllAsRead: () =>
    apiClient.put<MarkAllReadResponse>(
      "/notifications/read-all",
      undefined,
      "Failed to mark all notifications as read"
    ),
};
