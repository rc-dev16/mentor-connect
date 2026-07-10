import { Suspense, type ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/auth/routes/ProtectedRoute";
import { PageLoadingFallback } from "@/app/routes/PageLoadingFallback";

export function withAppLayout(role: "mentee" | "mentor", page: ReactNode) {
  return (
    <ProtectedRoute allowedRole={role}>
      <AppLayout role={role}>
        <Suspense fallback={<PageLoadingFallback />}>{page}</Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}
