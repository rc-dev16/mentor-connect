import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/auth/hooks/useAuthSession";
import { useDashboardSummary } from "@/data/hooks/useDashboardSummary";
import { dashboardApi } from "@/data/api/dashboard.api";
import { meetingsApi } from "@/data/api/meetings.api";
import { notificationsApi } from "@/data/api/notifications.api";
import { sessionRequestsApi } from "@/data/api/session-requests.api";
import { resourcesApi } from "@/data/api/resources.api";
import { personalInfoApi } from "@/data/api/personal-info.api";
import { usersApi } from "@/data/api/users.api";
import { queryKeys } from "@/data/api/query-keys";

type AppDataProviderProps = {
  children: React.ReactNode;
};

export function AppDataProvider({ children }: AppDataProviderProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const { session } = useAuthSession(Boolean(isLoaded && isSignedIn), userId || undefined);

  useDashboardSummary(Boolean(session));

  useEffect(() => {
    if (!session || !userId) return;

    const role = session.role;

    const prefetch = async () => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.summary(userId),
        queryFn: () => dashboardApi.getSummary(),
      });

      if (role === "mentee") {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.meetings.mentee(userId, "scheduled"),
            queryFn: () => meetingsApi.getMenteeMeetings("scheduled"),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.meetings.mentee(userId, "completed"),
            queryFn: () => meetingsApi.getMenteeMeetings("completed"),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.notifications.all(userId),
            queryFn: () => notificationsApi.getNotifications(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.sessionRequests.all(userId),
            queryFn: () => sessionRequestsApi.getSessionRequests(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.resources.all(userId),
            queryFn: () => resourcesApi.getResources(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.personalInfo.own(userId),
            queryFn: () => personalInfoApi.getPersonalInfo(),
          }),
        ]);
      } else if (role === "mentor") {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.meetings.all(userId),
            queryFn: () => meetingsApi.getMeetings(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.meetings.menteesList(userId),
            queryFn: () => meetingsApi.getMenteesList(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.sessionRequests.all(userId),
            queryFn: () => sessionRequestsApi.getSessionRequests(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.resources.all(userId),
            queryFn: () => resourcesApi.getResources(),
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.users.mentees(userId),
            queryFn: () => usersApi.getMentees(),
          }),
        ]);
      }
    };

    void prefetch();
  }, [session, userId, queryClient]);

  return <>{children}</>;
}
