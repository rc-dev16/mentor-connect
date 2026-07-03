import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/data/api/notifications.api";
import { queryKeys } from "@/data/api/query-keys";

export function useNotifications() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.all(userId || undefined),
    queryFn: () => notificationsApi.getNotifications(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useUnreadNotificationsCount() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId || undefined),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
