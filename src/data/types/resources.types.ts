export type Resource = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  resource_type?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  created_at: string;
};

export type CreateResourceInput = {
  title: string;
  description?: string;
  url?: string;
  file?: File;
  is_public?: boolean;
};
