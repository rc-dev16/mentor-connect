export type CreateSessionRequestInput = {
  title: string;
  description: string;
  preferred_date?: string;
  preferred_time?: string;
  duration_minutes?: number;
};
