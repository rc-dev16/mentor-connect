import { useMutation } from "@tanstack/react-query";
import { meetingsApi } from "@/data/api/meetings.api";

type MeetingReportRow = Record<string, string>;

type MenteeLite = {
  id: string;
  name: string;
  registration_number: string;
};

type MeetingLite = {
  id: string;
  meeting_date: string;
  status: string;
};

export function useGenerateGroupReport() {
  return useMutation({
    mutationFn: async ({
      meetings,
      mentees,
    }: {
      meetings: MeetingLite[];
      mentees: MenteeLite[];
    }): Promise<MeetingReportRow[]> => {
      const details = await Promise.all(meetings.map((meeting) => meetingsApi.getMeeting(meeting.id)));

      const menteeMap: Record<
        string,
        { name: string; reg: string; attended: number; total: number; personal: number }
      > = {};

      mentees.forEach((mentee) => {
        menteeMap[mentee.id] = {
          name: mentee.name,
          reg: mentee.registration_number,
          attended: 0,
          total: details.length,
          personal: 0,
        };
      });

      details.forEach((detail: { attendance?: { attended?: boolean; mentee_id: string }[] }) => {
        const isPersonal = Array.isArray(detail.attendance) && detail.attendance.length === 1;
        const presentIds = new Set(
          (detail.attendance || []).filter((item) => item.attended).map((item) => item.mentee_id)
        );

        presentIds.forEach((menteeId) => {
          if (!menteeMap[menteeId]) return;
          menteeMap[menteeId].attended += 1;
          if (isPersonal) menteeMap[menteeId].personal += 1;
        });
      });

      return Object.values(menteeMap).map((value) => ({
        "Mentee Name": value.name,
        "Reg. No.": value.reg,
        "Gen. Meetings Attended": `${Math.max(value.attended - value.personal, 0)} / ${Math.max(
          value.total - value.personal,
          0
        )}`,
        "Personal Sessions": `${value.personal}`,
        "Total Meetings": `${value.attended} / ${value.total}`,
        "Attendance %": value.total ? `${Math.round((value.attended / value.total) * 100)}%` : "-",
      }));
    },
  });
}
