import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDownloadMeetingExport } from "@/data/hooks/useDownloads";
import { useMeetings, useMenteesList } from "@/data/hooks/useMeetings";
import { useMeetingMutations } from "@/data/hooks/mutations/useMeetingMutations";
import { CompleteMeetingDialog } from "@/features/meetings/components/CompleteMeetingDialog";
import { CreateMeetingDialog } from "@/features/meetings/components/CreateMeetingDialog";
import { EditMeetingDialog } from "@/features/meetings/components/EditMeetingDialog";
import { MeetingTable } from "@/features/meetings/components/MeetingTable";
import {
  mapMeeting,
  notesFormSchema,
  scheduleFormSchema,
  type MentorMeeting,
  type NotesFormValues,
  type ScheduleFormValues,
} from "@/features/meetings/lib/meeting-form.schema";

const MentorMeetingsPage = () => {
  const { toast } = useToast();
  const { data: meetingsData = [], isLoading: meetingsLoading, isError: meetingsError } = useMeetings();
  const { data: menteesList = [], isLoading: menteesLoading } = useMenteesList();
  const { createMeeting, updateMeeting, completeMeeting, deleteMeeting } = useMeetingMutations();
  const downloadMeetingExport = useDownloadMeetingExport();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MentorMeeting | null>(null);
  const [notesMeeting, setNotesMeeting] = useState<MentorMeeting | null>(null);
  const [downloadingMeetingId, setDownloadingMeetingId] = useState<string | null>(null);
  const [localCompletedOverrides, setLocalCompletedOverrides] = useState<Record<string, Partial<MentorMeeting>>>({});

  const upcomingMeetings = useMemo(
    () => (meetingsData as Record<string, unknown>[]).filter((meeting) => meeting.status === "scheduled").map(mapMeeting),
    [meetingsData]
  );

  const completedMeetings = useMemo(
    () =>
      (meetingsData as Record<string, unknown>[])
        .filter((meeting) => meeting.status === "completed")
        .map(mapMeeting)
        .map((meeting) => ({ ...meeting, ...localCompletedOverrides[meeting.id] })),
    [meetingsData, localCompletedOverrides]
  );

  const isLoading = meetingsLoading || menteesLoading;

  const createForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { time: "00:00", durationMinutes: 60 },
  });

  const editForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { time: "00:00", durationMinutes: 60 },
  });

  const notesForm = useForm<NotesFormValues>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: { comments: "", actionPoints: "", attendance: [] },
  });

  const handleCreate = async (data: ScheduleFormValues) => {
    try {
      await createMeeting.mutateAsync({
        title: data.topic,
        topic: data.topic,
        agenda: data.agenda,
        meetingDate: data.date,
        meetingTime: data.time,
        teamsLink: data.teamsLink,
        durationMinutes: data.durationMinutes,
      });
      toast({ title: "Success", description: "Meeting scheduled successfully" });
      setIsCreateOpen(false);
      createForm.reset({ time: "00:00", durationMinutes: 60 });
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to schedule meeting" });
    }
  };

  const handleEditClick = (meeting: MentorMeeting) => {
    setEditingMeeting(meeting);
    editForm.reset({
      date: meeting.date,
      time: meeting.time,
      topic: meeting.topic,
      agenda: meeting.agenda,
      teamsLink: meeting.teamsLink,
      durationMinutes: meeting.duration_minutes ?? 60,
    });
  };

  const handleEditSubmit = async (data: ScheduleFormValues) => {
    if (!editingMeeting) return;
    try {
      await updateMeeting.mutateAsync({
        id: editingMeeting.id,
        data: {
          title: data.topic,
          topic: data.topic,
          agenda: data.agenda,
          meetingDate: data.date,
          meetingTime: data.time,
          teamsLink: data.teamsLink,
          durationMinutes: data.durationMinutes,
        },
      });
      toast({ title: "Success", description: "Meeting updated successfully" });
      setEditingMeeting(null);
      editForm.reset({ time: "00:00", durationMinutes: 60 });
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update meeting" });
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await deleteMeeting.mutateAsync(meetingId);
      toast({ title: "Success", description: "Meeting cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel meeting" });
    }
  };

  const handleNotesSubmit = async (data: NotesFormValues) => {
    if (!notesMeeting) return;
    try {
      if (notesMeeting.status === "upcoming") {
        await completeMeeting.mutateAsync({
          id: notesMeeting.id,
          comments: data.comments,
          actionPoints: data.actionPoints,
          attendance: data.attendance,
        });
        toast({ title: "Success", description: "Meeting completed successfully" });
      } else {
        setLocalCompletedOverrides((previous) => ({
          ...previous,
          [notesMeeting.id]: {
            comments: data.comments,
            actionPoints: data.actionPoints,
            attendance: data.attendance,
          },
        }));
      }
      setNotesMeeting(null);
      notesForm.reset({ comments: "", actionPoints: "", attendance: [] });
    } catch (error) {
      console.error("Error saving meeting notes:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save meeting notes" });
    }
  };

  const handleViewMeeting = (meeting: MentorMeeting) => {
    setNotesMeeting(meeting);
    notesForm.reset({
      comments: meeting.comments || "",
      actionPoints: meeting.actionPoints || "",
      attendance: meeting.attendance || [],
    });
  };

  const handleDownloadMeeting = async (meeting: MentorMeeting) => {
    try {
      setDownloadingMeetingId(meeting.id);
      await downloadMeetingExport.mutateAsync({
        meetingId: meeting.id,
        meetingTitle: meeting.topic,
      });
      toast({
        title: "PDF Downloaded",
        description: "Meeting notes and attendance PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading meeting PDF:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download meeting PDF. Please try again.",
      });
    } finally {
      setDownloadingMeetingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (meetingsError) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Failed to load meetings data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">General Meetings</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="completed">Completed Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <MeetingTable
            variant="upcoming"
            meetings={upcomingMeetings}
            onMarkComplete={handleViewMeeting}
            onEdit={handleEditClick}
            onCancel={handleCancelMeeting}
          />
        </TabsContent>

        <TabsContent value="completed">
          <MeetingTable
            variant="completed"
            meetings={completedMeetings}
            downloadingMeetingId={downloadingMeetingId}
            onViewNotes={handleViewMeeting}
            onDownload={handleDownloadMeeting}
          />
        </TabsContent>
      </Tabs>

      <CreateMeetingDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) createForm.reset({ time: "00:00", durationMinutes: 60 });
        }}
        form={createForm}
        onSubmit={handleCreate}
        submitLabel="Schedule Meeting"
        title="Schedule New Meeting"
      />

      <EditMeetingDialog
        open={!!editingMeeting}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMeeting(null);
            editForm.reset({ time: "00:00", durationMinutes: 60 });
          }
        }}
        form={editForm}
        onSubmit={handleEditSubmit}
      />

      <CompleteMeetingDialog
        open={!!notesMeeting}
        onOpenChange={(open) => {
          if (!open) {
            setNotesMeeting(null);
            notesForm.reset({ comments: "", actionPoints: "", attendance: [] });
          }
        }}
        notesForm={notesForm}
        menteesList={menteesList as { id: string; name: string; registration_number: string }[]}
        meeting={notesMeeting}
        onSubmit={handleNotesSubmit}
      />
    </div>
  );
};

export default MentorMeetingsPage;
