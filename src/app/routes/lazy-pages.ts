import { lazy } from "react";

// Secondary pages — loaded after initial shell paint
export const PersonalInfoPage = lazy(() => import("@/features/personal-info/pages/PersonalInfoPage"));
export const MenteeResourcesPage = lazy(() => import("@/features/resources/pages/MenteeResourcesPage"));
export const MenteeNotificationsPage = lazy(() => import("@/features/notifications/pages/MenteeNotificationsPage"));
export const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
export const MentorResourcesPage = lazy(() => import("@/features/resources/pages/MentorResourcesPage"));
export const MentorReports = lazy(() => import("@/mentor/pages/Reports"));
export const MentorSessionRequestsPage = lazy(
  () => import("@/features/session-requests/pages/MentorSessionRequestsPage")
);

// Heavier feature pages
export const MenteeMeetingsPage = lazy(() => import("@/features/meetings/pages/MenteeMeetingsPage"));
export const MenteeSessionRequestsPage = lazy(
  () => import("@/features/session-requests/pages/MenteeSessionRequestsPage")
);
export const MentorMeetingsPage = lazy(() => import("@/features/meetings/pages/MentorMeetingsPage"));
export const MentorMenteesPage = lazy(() => import("@/features/mentees/pages/MentorMenteesPage"));
