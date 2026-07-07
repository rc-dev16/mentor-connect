import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/data/query-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { LoginRoute } from "@/auth/routes/LoginRoute";
import { menteeRoutes } from "@/app/routes/mentee.routes";
import { mentorRoutes } from "@/app/routes/mentor.routes";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login/*" element={<LoginRoute />} />
          {menteeRoutes}
          {mentorRoutes}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
