import { Route } from "react-router-dom";
import MenteeDashboard from "@/mentee/pages/Dashboard";
import MentorshipConnect from "@/mentee/pages/MentorshipConnect";
import PersonalInfo from "@/mentee/pages/PersonalInfo";
import MenteeMeetingsPage from "@/features/meetings/pages/MenteeMeetingsPage";
import MenteeResourcesPage from "@/features/resources/pages/MenteeResourcesPage";
import MenteeNotificationsPage from "@/features/notifications/pages/MenteeNotificationsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import { withAppLayout } from "@/app/routes/withAppLayout";

export const menteeRoutes = (
  <>
    <Route path="/dashboard" element={withAppLayout("mentee", <MenteeDashboard />)} />
    <Route path="/meetings" element={withAppLayout("mentee", <MenteeMeetingsPage />)} />
    <Route path="/mentorship-connect" element={withAppLayout("mentee", <MentorshipConnect />)} />
    <Route path="/personal-info" element={withAppLayout("mentee", <PersonalInfo />)} />
    <Route path="/resources" element={withAppLayout("mentee", <MenteeResourcesPage />)} />
    <Route path="/notifications" element={withAppLayout("mentee", <MenteeNotificationsPage />)} />
    <Route path="/settings" element={withAppLayout("mentee", <SettingsPage />)} />
  </>
);
