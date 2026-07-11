export type Report = {
  id: string;
  mentor_id: string;
  report_type: string;
  period_start?: string;
  period_end?: string;
  generated_at?: string;
  created_at?: string;
  title?: string;
  content?: string;
};
