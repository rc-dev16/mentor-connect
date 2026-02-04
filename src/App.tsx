import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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
import { apiService } from "./services/api";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'mentor' | 'mentee' }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userType, setUserType] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    // Seed with any cached role to avoid flicker
    const cachedRole = sessionStorage.getItem("userType");
    if (cachedRole && !userType) {
      setUserType(cachedRole);
    }
  }, [userType]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!isLoaded || !isSignedIn) {
        setCheckingRole(false);
        return;
      }

      const clerkRole = (user?.publicMetadata as any)?.userType || (user?.unsafeMetadata as any)?.role;
      if (clerkRole) {
        setUserType(clerkRole);
        sessionStorage.setItem("userType", clerkRole);
        setCheckingRole(false);
        return;
      }

      try {
        setCheckingRole(true);
        const profile = await apiService.getUserProfile();
        if (profile?.user_type) {
          setUserType(profile.user_type);
          sessionStorage.setItem("userType", profile.user_type);
        }
      } catch (error) {
        console.error("[ProtectedRoute] failed to load role", error);
      } finally {
        setCheckingRole(false);
      }
    };

    fetchRole();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (userType && userType !== allowedRole) {
    return allowedRole === 'mentor'
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/mentor/dashboard" replace />;
  }

  return <>{children}</>;
};

const LoginRoute = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }
  if (isSignedIn) {
    const clerkRole =
      (user?.publicMetadata as any)?.userType ||
      (user?.unsafeMetadata as any)?.role;
    const cachedRole = sessionStorage.getItem("userType");
    const role = (clerkRole as string) || cachedRole || "mentee";
    const targetPath = role === "mentor" ? "/mentor/dashboard" : "/dashboard";
    return <Navigate to={targetPath} replace />;
  }
  return <Login />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public login as main landing page */}
          <Route path="/" element={<LoginRoute />} />
          <Route path="/login/*" element={<LoginRoute />} />
          
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
