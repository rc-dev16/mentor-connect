import { getClerkSessionToken } from "@/auth/services/clerk-token";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export type JsonPayload = Record<string, unknown>;

async function parseApiError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = await response.json();
    if (data?.message) message = data.message;
  } catch {
    // Response body is optional; keep the fallback message.
  }
  throw new Error(message);
}

async function getAuthHeaders(useJson = true): Promise<Record<string, string>> {
  const token = await getClerkSessionToken();
  if (!token) {
    throw new Error("Missing Clerk session token. Please sign in again.");
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (useJson) headers["Content-Type"] = "application/json";
  return headers;
}

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown; useJson?: boolean; fallbackError?: string } = {}
): Promise<T> {
  const { json, useJson = true, fallbackError = "Request failed", ...fetchInit } = init;
  const headers = await getAuthHeaders(useJson && !(fetchInit.body instanceof FormData));

  const response = await fetch(resolveUrl(path), {
    ...fetchInit,
    headers: { ...headers, ...(fetchInit.headers as Record<string, string> | undefined) },
    body: json !== undefined ? JSON.stringify(json) : fetchInit.body,
  });

  if (!response.ok) {
    await parseApiError(response, fallbackError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}

export const apiClient = {
  get<T>(path: string, fallbackError?: string) {
    return request<T>(path, { method: "GET", fallbackError });
  },

  post<T>(path: string, json?: unknown, fallbackError?: string) {
    return request<T>(path, { method: "POST", json, fallbackError });
  },

  put<T>(path: string, json?: unknown, fallbackError?: string) {
    return request<T>(path, { method: "PUT", json, fallbackError });
  },

  delete<T>(path: string, fallbackError?: string) {
    return request<T>(path, { method: "DELETE", fallbackError });
  },

  async getBlob(path: string, fallbackError = "Download failed"): Promise<Blob> {
    const headers = await getAuthHeaders(false);
    const response = await fetch(resolveUrl(path), { method: "GET", headers });
    if (!response.ok) {
      await parseApiError(response, fallbackError);
    }
    return response.blob();
  },

  async getBlobFromUrl(fileUrl: string, fallbackError = "Download failed"): Promise<Blob> {
    const baseUrl = API_BASE_URL.replace("/api", "");
    const url = fileUrl.startsWith("http") ? fileUrl : `${baseUrl}${fileUrl}`;
    const headers = await getAuthHeaders(false);
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      await parseApiError(response, fallbackError);
    }
    return response.blob();
  },

  async postFormData<T>(path: string, formData: FormData, fallbackError = "Request failed"): Promise<T> {
    const headers = await getAuthHeaders(false);
    const response = await fetch(resolveUrl(path), {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      await parseApiError(response, fallbackError);
    }
    return response.json() as Promise<T>;
  },
};
