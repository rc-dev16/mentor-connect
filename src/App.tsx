import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import MentorLayout from "./mentor/components/MentorLayout";
import MenteeDashboard from "./mentee/pages/Dashboard";
import MenteeMeetings from "./mentee/pages/Meetings";
import MentorshipConnect from "./mentee/pages/MentorshipConnect";
import PersonalInfo from "./mentee/pages/PersonalInfo";
import Resources from "./mentee/pages/Resources";
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
import { SetupPasswordRoute } from "@/auth/routes/SetupPasswordRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /login so Clerk can use a stable path */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login/*" element={<LoginRoute />} />
          <Route path="/setup-password" element={<SetupPasswordRoute />} />
          
          {/* Protected Mentee Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MenteeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MenteeMeetings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship-connect"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MentorshipConnect />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-info"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <PersonalInfo />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <Resources />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mentor Routes */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <MentorDashboard />
                </MentorLayout>
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
                <MentorLayout>
                  <MentorMentees />
                </MentorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/meetings"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <MentorMeetings />
                </MentorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/session-requests"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <MentorSessionRequests />
                </MentorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/resources"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <MentorResources />
                </MentorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/reports"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <MentorReports />
                </MentorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/settings"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorLayout>
                  <Settings />
                </MentorLayout>
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
