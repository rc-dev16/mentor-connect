import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MeetingAttendanceSection } from "@/features/meetings/components/MeetingAttendanceSection";
import type {
  MenteeListItem,
  MentorMeeting,
  NotesFormValues,
} from "@/features/meetings/lib/meeting-form.schema";
import type { UseFormReturn } from "react-hook-form";

type CompleteMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notesForm: UseFormReturn<NotesFormValues>;
  menteesList: MenteeListItem[];
  meeting: MentorMeeting | null;
  onSubmit: (values: NotesFormValues) => void;
};

export function CompleteMeetingDialog({
  open,
  onOpenChange,
  notesForm,
  menteesList,
  meeting,
  onSubmit,
}: CompleteMeetingDialogProps) {
  const isUpcoming = meeting?.status === "upcoming";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            {isUpcoming ? "Complete Meeting - Add Notes & Attendance" : "Edit Meeting Notes & Attendance"}
          </DialogTitle>
        </DialogHeader>

        <Form {...notesForm}>
          <form onSubmit={notesForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={notesForm.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments / Questions for reflection</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter comments, key discussion points, and questions for reflection"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={notesForm.control}
              name="actionPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Points</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter action items, tasks, and follow-up activities"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <MeetingAttendanceSection notesForm={notesForm} menteesList={menteesList} />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isUpcoming ? "Complete Meeting" : "Update Notes & Attendance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
