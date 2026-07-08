import { CheckCircle, Download, Edit2, Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateDMY,
  type MentorMeeting,
} from "@/features/meetings/lib/meeting-form.schema";

type MeetingTableProps = {
  variant: "upcoming" | "completed";
  meetings: MentorMeeting[];
  downloadingMeetingId?: string | null;
  onMarkComplete?: (meeting: MentorMeeting) => void;
  onEdit?: (meeting: MentorMeeting) => void;
  onCancel?: (meetingId: string) => void;
  onViewNotes?: (meeting: MentorMeeting) => void;
  onDownload?: (meeting: MentorMeeting) => void;
};

export function MeetingTable({
  variant,
  meetings,
  downloadingMeetingId,
  onMarkComplete,
  onEdit,
  onCancel,
  onViewNotes,
  onDownload,
}: MeetingTableProps) {
  const isUpcoming = variant === "upcoming";

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {isUpcoming && <TableHead>Time</TableHead>}
            {isUpcoming && <TableHead>Duration</TableHead>}
            <TableHead>Topic</TableHead>
            {isUpcoming && <TableHead>Join Link</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isUpcoming ? 6 : 3}
                className="text-center text-gray-500 h-32"
              >
                {isUpcoming ? "No upcoming meetings scheduled" : "No completed meetings found"}
              </TableCell>
            </TableRow>
          ) : (
            meetings.map((meeting) => (
              <TableRow key={meeting.id}>
                <TableCell>{formatDateDMY(meeting.date)}</TableCell>
                {isUpcoming && <TableCell>{meeting.time}</TableCell>}
                {isUpcoming && <TableCell>{meeting.duration_minutes ?? 60} min</TableCell>}
                <TableCell>{meeting.topic}</TableCell>
                {isUpcoming && (
                  <TableCell>
                    <Button variant="link" className="p-0" asChild>
                      <a href={meeting.teamsLink} target="_blank" rel="noopener noreferrer">
                        <Link className="w-4 h-4" />
                        <span className="sr-only">Join meeting</span>
                      </a>
                    </Button>
                  </TableCell>
                )}
                <TableCell className="text-right space-x-2">
                  {isUpcoming ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarkComplete?.(meeting)}
                        title="Mark as Complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="sr-only">Mark as complete</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit?.(meeting)}>
                        <Edit2 className="w-4 h-4" />
                        <span className="sr-only">Edit meeting</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onCancel?.(meeting.id)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Cancel meeting</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onViewNotes?.(meeting)}>
                        View Notes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload?.(meeting)}
                        disabled={downloadingMeetingId === meeting.id}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {downloadingMeetingId === meeting.id ? "Downloading..." : "Download PDF"}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
