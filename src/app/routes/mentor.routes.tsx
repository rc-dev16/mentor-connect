import { Navigate, Route } from "react-router-dom";
import MentorDashboardPage from "@/features/dashboard/pages/MentorDashboardPage";
import {
  MentorMeetingsPage,
  MentorMenteesPage,
  MentorReports,
  MentorResourcesPage,
  MentorSessionRequestsPage,
  SettingsPage,
} from "@/app/routes/lazy-pages";
import { withAppLayout } from "@/app/routes/withAppLayout";

export const mentorRoutes = (
  <>
    <Route path="/mentor/dashboard" element={withAppLayout("mentor", <MentorDashboardPage />)} />
    <Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
    <Route path="/mentor/mentees" element={withAppLayout("mentor", <MentorMenteesPage />)} />
    <Route path="/mentor/meetings" element={withAppLayout("mentor", <MentorMeetingsPage />)} />
    <Route path="/mentor/session-requests" element={withAppLayout("mentor", <MentorSessionRequestsPage />)} />
    <Route path="/mentor/resources" element={withAppLayout("mentor", <MentorResourcesPage />)} />
    <Route path="/mentor/reports" element={withAppLayout("mentor", <MentorReports />)} />
    <Route path="/mentor/settings" element={withAppLayout("mentor", <SettingsPage />)} />
  </>
);
