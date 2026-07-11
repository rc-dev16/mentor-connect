export type MeetingSummary = {
  id: string;
  topic?: string;
  title?: string;
  meeting_date?: string;
  meeting_time?: string;
  teams_link?: string;
  status?: string;
  duration_minutes?: number;
  group_id?: string;
  group_name?: string;
  mentor_id?: string;
  mentor_name?: string;
  updated_at?: string;
  created_at?: string;
};

export type MeetingAttendance = {
  mentee_id?: string;
  mentee_name?: string;
  registration_number?: string;
  attended?: boolean;
};

/** Full meeting row as returned by GET /meetings/:id (includes attendance). */
export type Meeting = MeetingSummary & {
  agenda?: string;
  comments?: string;
  action_points?: string;
  attendance?: MeetingAttendance[];
};

/** Create/update request body uses camelCase on purpose (current Express validators). */
export type CreateMeetingInput = {
  title?: string;
  topic?: string;
  agenda?: string;
  meetingDate: string;
  meetingTime: string;
  durationMinutes?: number;
  teamsLink?: string;
  groupId?: string;
};

export type UpdateMeetingInput = Partial<CreateMeetingInput>;

export type CompleteMeetingInput = {
  comments: string;
  actionPoints: string;
  attendance: string[];
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
