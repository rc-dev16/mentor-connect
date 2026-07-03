import { apiClient } from "@/data/api/client";

export const reportsApi = {
  getReports: () => apiClient.get("/reports", "Failed to fetch reports"),
};
