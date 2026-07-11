import { apiClient } from "@/data/api/client";
import type { DashboardSummary } from "@/data/types/dashboard.types";

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<DashboardSummary>("/dashboard/summary", "Failed to fetch dashboard summary"),
};
