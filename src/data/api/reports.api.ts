import { apiClient } from "@/data/api/client";
import type { Report } from "@/data/types/reports.types";

export const reportsApi = {
  getReports: () => apiClient.get<Report[]>("/reports", "Failed to fetch reports"),
};
