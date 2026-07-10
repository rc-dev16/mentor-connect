import { Route } from "react-router-dom";
import MenteeDashboardPage from "@/features/dashboard/pages/MenteeDashboardPage";
import {
  MenteeMeetingsPage,
  MenteeNotificationsPage,
  MenteeResourcesPage,
  MenteeSessionRequestsPage,
  PersonalInfoPage,
  SettingsPage,
} from "@/app/routes/lazy-pages";
import { withAppLayout } from "@/app/routes/withAppLayout";

export const menteeRoutes = (
  <>
    <Route path="/dashboard" element={withAppLayout("mentee", <MenteeDashboardPage />)} />
    <Route path="/meetings" element={withAppLayout("mentee", <MenteeMeetingsPage />)} />
    <Route path="/mentorship-connect" element={withAppLayout("mentee", <MenteeSessionRequestsPage />)} />
    <Route path="/personal-info" element={withAppLayout("mentee", <PersonalInfoPage />)} />
    <Route path="/resources" element={withAppLayout("mentee", <MenteeResourcesPage />)} />
    <Route path="/notifications" element={withAppLayout("mentee", <MenteeNotificationsPage />)} />
    <Route path="/settings" element={withAppLayout("mentee", <SettingsPage />)} />
  </>
);
