import { CreateMeetingDialog } from "@/features/meetings/components/CreateMeetingDialog";
import type { ScheduleFormValues } from "@/features/meetings/lib/meeting-form.schema";
import type { UseFormReturn } from "react-hook-form";

type EditMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ScheduleFormValues>;
  onSubmit: (values: ScheduleFormValues) => void | Promise<void>;
};

export function EditMeetingDialog(props: EditMeetingDialogProps) {
  return (
    <CreateMeetingDialog
      {...props}
      title="Edit Meeting"
      submitLabel="Edit Meeting"
    />
  );
}
