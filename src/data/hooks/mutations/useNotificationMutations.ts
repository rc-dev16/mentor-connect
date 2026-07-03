import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/data/api/notifications.api";
import { queryKeys } from "@/data/api/query-keys";

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId || undefined) });
  };

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: invalidate,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: invalidate,
  });

  return { markAsRead, markAllAsRead };
}
