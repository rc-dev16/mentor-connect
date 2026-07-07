import { Navigate, Route } from "react-router-dom";
import MentorDashboard from "@/mentor/pages/Dashboard";
import MentorMentees from "@/mentor/pages/Mentees";
import MentorSessionRequests from "@/mentor/pages/SessionRequests";
import MentorReports from "@/mentor/pages/Reports";
import MentorMeetingsPage from "@/features/meetings/pages/MentorMeetingsPage";
import MentorResourcesPage from "@/features/resources/pages/MentorResourcesPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import { withAppLayout } from "@/app/routes/withAppLayout";

export const mentorRoutes = (
  <>
    <Route path="/mentor/dashboard" element={withAppLayout("mentor", <MentorDashboard />)} />
    <Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
    <Route path="/mentor/mentees" element={withAppLayout("mentor", <MentorMentees />)} />
    <Route path="/mentor/meetings" element={withAppLayout("mentor", <MentorMeetingsPage />)} />
    <Route path="/mentor/session-requests" element={withAppLayout("mentor", <MentorSessionRequests />)} />
    <Route path="/mentor/resources" element={withAppLayout("mentor", <MentorResourcesPage />)} />
    <Route path="/mentor/reports" element={withAppLayout("mentor", <MentorReports />)} />
    <Route path="/mentor/settings" element={withAppLayout("mentor", <SettingsPage />)} />
  </>
);
