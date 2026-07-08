import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { MenteeListItem, NotesFormValues } from "@/features/meetings/lib/meeting-form.schema";

type MeetingAttendanceSectionProps = {
  notesForm: UseFormReturn<NotesFormValues>;
  menteesList: MenteeListItem[];
};

export function MeetingAttendanceSection({
  notesForm,
  menteesList,
}: MeetingAttendanceSectionProps) {
  return (
    <FormField
      control={notesForm.control}
      name="attendance"
      render={() => (
        <FormItem>
          <FormLabel>Mark Attendance</FormLabel>
          <div className="mb-2">
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={
                    Array.isArray(notesForm.getValues("attendance")) &&
                    notesForm.getValues("attendance").length === menteesList.length &&
                    menteesList.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      notesForm.setValue(
                        "attendance",
                        menteesList.map((mentee) => mentee.id),
                        { shouldDirty: true, shouldTouch: true }
                      );
                    } else {
                      notesForm.setValue("attendance", [], { shouldDirty: true, shouldTouch: true });
                    }
                  }}
                />
              </FormControl>
              <span className="text-sm font-medium">Mark all present</span>
            </FormItem>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-auto pr-2">
            {menteesList.map((mentee) => (
              <FormField
                key={mentee.id}
                control={notesForm.control}
                name="attendance"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(mentee.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, mentee.id]);
                          } else {
                            field.onChange(currentValue.filter((value) => value !== mentee.id));
                          }
                        }}
                      />
                    </FormControl>
                    <span>
                      {mentee.name} ({mentee.registration_number})
                    </span>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </FormItem>
      )}
    />
  );
}
