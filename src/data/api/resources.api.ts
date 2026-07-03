import { apiClient } from "@/data/api/client";
import type { CreateResourceInput } from "@/data/types/resources.types";

export const resourcesApi = {
  getResources: () => apiClient.get("/resources", "Failed to fetch resources"),

  createResource: (data: CreateResourceInput) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.url) formData.append("url", data.url);
    if (data.file) formData.append("file", data.file);
    if (data.is_public !== undefined) formData.append("is_public", String(data.is_public));
    if (data.file) formData.append("resource_type", "file");
    else if (data.url) formData.append("resource_type", "link");

    return apiClient.postFormData("/resources", formData, "Failed to create resource");
  },

  downloadResourceFile: (fileUrl: string) =>
    apiClient.getBlobFromUrl(fileUrl, "Failed to download file"),
};
