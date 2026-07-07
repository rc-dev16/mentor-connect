import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/auth/routes/ProtectedRoute";

export function withAppLayout(role: "mentee" | "mentor", page: ReactNode) {
  return (
    <ProtectedRoute allowedRole={role}>
      <AppLayout role={role}>{page}</AppLayout>
    </ProtectedRoute>
  );
}
