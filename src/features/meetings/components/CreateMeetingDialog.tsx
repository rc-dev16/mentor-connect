import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDateDMY, type ScheduleFormValues } from "@/features/meetings/lib/meeting-form.schema";
import type { UseFormReturn } from "react-hook-form";

type CreateMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ScheduleFormValues>;
  onSubmit: (values: ScheduleFormValues) => void | Promise<void>;
  submitLabel: string;
  title: string;
};

export function CreateMeetingDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  submitLabel,
  title,
}: CreateMeetingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? formatDateDMY(field.value) : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onSelect={(date) => {
                          if (!date) {
                            field.onChange("");
                            return;
                          }
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          field.onChange(`${year}-${month}-${day}`);
                        }}
                        disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                        classNames={{ day_today: "bg-primary/10 text-primary" }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={15} max={480} step={15} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => {
                const initial = field.value || "00:00";
                const [initialHour, initialMinute] = initial.split(":");
                const hourStr = initialHour?.padStart(2, "0") || "00";
                const minuteStr = initialMinute?.padStart(2, "0") || "00";

                const setTime = (hour24: string, minute: string) => {
                  field.onChange(`${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
                };

                return (
                  <FormItem>
                    <FormLabel>Time (24-hour)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Select onValueChange={(value) => setTime(value, minuteStr)} defaultValue={hourStr}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")).map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select onValueChange={(value) => setTime(hourStr, value)} defaultValue={minuteStr}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["00", "15", "30", "45"].map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meeting topic" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agenda</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter meeting agenda" className="min-h-[100px]" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamsLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MS Teams Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter MS Teams meeting link" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
