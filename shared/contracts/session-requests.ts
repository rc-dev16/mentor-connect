import type { SessionRequestStatus } from "./common";

export type { SessionRequestStatus };

export type CreateSessionRequestInput = {
  title: string;
  description: string;
  preferred_date?: string;
  preferred_time?: string;
  duration_minutes?: number;
};

export type UpdateSessionRequestStatusInput = {
  status: SessionRequestStatus;
  mentor_notes?: string;
};

/** Wire shape from GET /session-requests (title/description, not topic/comments). */
export type SessionRequest = {
  id: string;
  title: string;
  description?: string;
  preferred_date: string;
  preferred_time: string;
  duration_minutes?: number;
  status: SessionRequestStatus;
  mentor_notes?: string | null;
  created_at: string;
  updated_at?: string;
  mentor_id?: string;
  mentor_name?: string;
  mentee_id: string;
  mentee_name: string;
  mentee_reg: string;
};
