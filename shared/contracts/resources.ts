export type Resource = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  resource_type?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  is_public?: boolean;
  created_at: string;
};

/** JSON/FormData fields shared with the API (file is attached only on the client). */
export type CreateResourceRequest = {
  title: string;
  description?: string;
  url?: string;
  is_public?: boolean;
};

export type CreateResourceResponse = {
  message: string;
  resource: Resource;
};
