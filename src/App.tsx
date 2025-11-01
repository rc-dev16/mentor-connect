import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import MentorLayout from "./mentor/components/MentorLayout";
import Login from "./pages/Login";
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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'mentor' | 'mentee' }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const userInfo = localStorage.getItem("userInfo");
  const userType = localStorage.getItem("userType");

  console.log('[ProtectedRoute] path', pathname, { userType, hasUserInfo: !!userInfo });

  if (!userInfo || !userType) {
    console.warn('[ProtectedRoute] redirect -> /login');
    return <Navigate to="/login" />;
  }

  if (userType !== allowedRole) {
    console.warn('[ProtectedRoute] blocked route. required', allowedRole, 'got', userType);
    return allowedRole === 'mentor' ? <Navigate to="/" /> : <Navigate to="/mentor/dashboard" />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Mentee Routes */}
          <Route
            path="/"
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
