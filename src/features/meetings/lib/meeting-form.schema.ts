import * as z from "zod";

export const scheduleFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  topic: z.string().min(1, "Topic is required"),
  agenda: z.string().min(1, "Agenda is required"),
  teamsLink: z.string().url("Please enter a valid MS Teams link"),
  durationMinutes: z.coerce.number().int().min(15, "Minimum 15 minutes").max(480, "Maximum 480 minutes"),
});

export const notesFormSchema = z.object({
  comments: z.string().min(1, "Comments/Questions for reflection are required"),
  actionPoints: z.string().min(1, "Action points are required"),
  attendance: z.array(z.string()).min(1, "Please mark attendance"),
});

export type MentorMeeting = {
  id: string;
  date: string;
  time: string;
  topic: string;
  agenda: string;
  teamsLink: string;
  comments?: string;
  actionPoints?: string;
  attendance?: string[];
  duration_minutes?: number;
  status: "upcoming" | "completed";
};

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
export type NotesFormValues = z.infer<typeof notesFormSchema>;

export type MenteeListItem = {
  id: string;
  name: string;
  registration_number: string;
};

export const mapMeeting = (meeting: Record<string, unknown>): MentorMeeting => ({
  id: String(meeting.id),
  date:
    typeof meeting.meeting_date === "string" ? meeting.meeting_date.slice(0, 10) : String(meeting.meeting_date || ""),
  time: String(meeting.meeting_time || "").slice(0, 5),
  topic: String(meeting.topic || meeting.title || ""),
  agenda: String(meeting.agenda || ""),
  teamsLink: String(meeting.teams_link || ""),
  comments: typeof meeting.comments === "string" ? meeting.comments : undefined,
  actionPoints: typeof meeting.action_points === "string" ? meeting.action_points : undefined,
  attendance: Array.isArray(meeting.attendance) ? (meeting.attendance as string[]) : undefined,
  status: meeting.status === "completed" ? "completed" : "upcoming",
  duration_minutes: typeof meeting.duration_minutes === "number" ? meeting.duration_minutes : undefined,
});

export function formatDateDMY(isoDate: string | undefined) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}-${month}-${year}`;
}
