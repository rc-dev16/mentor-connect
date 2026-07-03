export type MeetingSummary = {
  id: string;
  topic?: string;
  title?: string;
  meeting_date?: string;
  meeting_time?: string;
  teams_link?: string;
  status?: string;
  updated_at?: string;
};

export type ActivityItem = {
  id: string;
  type?: string;
  message: string;
  time?: string;
  ts?: string;
  status?: string;
  title?: string;
  is_read?: boolean;
  created_at?: string;
};
