import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/data/query-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import MenteeDashboard from "./mentee/pages/Dashboard";
import MenteeMeetings from "./mentee/pages/Meetings";
import MentorshipConnect from "./mentee/pages/MentorshipConnect";
import PersonalInfo from "./mentee/pages/PersonalInfo";
import Resources from "./mentee/pages/Resources";
import Notifications from "./mentee/pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MentorDashboard from "./mentor/pages/Dashboard";
import MentorMeetings from "./mentor/pages/Meetings";
import MentorSessionRequests from "./mentor/pages/SessionRequests";
import MentorResources from "./mentor/pages/Resources";
import MentorReports from "./mentor/pages/Reports";
import MentorMentees from "./mentor/pages/Mentees";
import { LoginRoute } from "@/auth/routes/LoginRoute";
import { ProtectedRoute } from "@/auth/routes/ProtectedRoute";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /login so Clerk can use a stable path */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login/*" element={<LoginRoute />} />

          {/* Protected Mentee Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <MenteeDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <MenteeMeetings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship-connect"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <MentorshipConnect />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-info"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <PersonalInfo />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <Resources />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <Notifications />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRole="mentee">
                <AppLayout role="mentee">
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mentor Routes */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Redirect /mentor to /mentor/dashboard */}
          <Route
            path="/mentor"
            element={<Navigate to="/mentor/dashboard" replace />}
          />
          <Route
            path="/mentor/mentees"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorMentees />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/meetings"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorMeetings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/session-requests"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorSessionRequests />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/resources"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorResources />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/reports"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <MentorReports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/settings"
            element={
              <ProtectedRoute allowedRole="mentor">
                <AppLayout role="mentor">
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
