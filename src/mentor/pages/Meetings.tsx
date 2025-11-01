import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Edit2, Link, Plus, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { apiService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

const scheduleFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  topic: z.string().min(1, "Topic is required"),
  agenda: z.string().min(1, "Agenda is required"),
  teamsLink: z.string().url("Please enter a valid MS Teams link"),
  durationMinutes: z.coerce.number().int().min(15, "Minimum 15 minutes").max(480, "Maximum 480 minutes"),
})

const notesFormSchema = z.object({
  comments: z.string().min(1, "Comments/Questions for reflection are required"),
  actionPoints: z.string().min(1, "Action points are required"),
  attendance: z.array(z.string()).min(1, "Please mark attendance"),
})

interface Meeting {
  id: string
  date: string
  time: string
  topic: string
  agenda: string
  teamsLink: string
  comments?: string
  actionPoints?: string
  attendance?: string[]
  duration_minutes?: number
  status: 'upcoming' | 'completed'
}

const MeetingsPage = () => {
  const { toast } = useToast()
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [completedMeetings, setCompletedMeetings] = useState<Meeting[]>([])
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [menteesList, setMenteesList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const mapMeeting = (m: any): Meeting => ({
    id: m.id,
    date: typeof m.meeting_date === 'string' ? m.meeting_date.slice(0, 10) : m.meeting_date,
    time: (m.meeting_time || '').slice(0, 5),
    topic: m.topic || m.title,
    agenda: m.agenda,
    teamsLink: m.teams_link,
    comments: m.comments,
    actionPoints: m.action_points,
    attendance: m.attendance,
    status: m.status === 'completed' ? 'completed' : 'upcoming',
    duration_minutes: m.duration_minutes,
  })

  const formatDateDMY = (isoDate: string | undefined) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.slice(0, 10).split("-");
    return `${d}-${m}-${y}`;
  }
  
  const notesForm = useForm<z.infer<typeof notesFormSchema>>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: {
      comments: "",
      actionPoints: "",
      attendance: [],
    },
  })

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      time: "00:00",
      durationMinutes: 60,
    },
  })

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load meetings
        const meetings = await apiService.getMeetings()
        const upcoming = meetings
          .filter((m: any) => m.status === 'scheduled')
          .map(mapMeeting)
        const completed = meetings
          .filter((m: any) => m.status === 'completed')
          .map(mapMeeting)
        
        setUpcomingMeetings(upcoming)
        setCompletedMeetings(completed)
        
        // Load mentees list
        const mentees = await apiService.getMenteesList()
        setMenteesList(mentees)
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load meetings data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const onSubmit = async (data: z.infer<typeof scheduleFormSchema>) => {
    try {
      const meetingData = {
        title: data.topic,
        topic: data.topic,
        agenda: data.agenda,
        meetingDate: data.date,
        meetingTime: data.time,
        teamsLink: data.teamsLink,
        durationMinutes: data.durationMinutes,
      }

      if (editingMeeting) {
        // Update existing meeting
        await apiService.updateMeeting(editingMeeting.id, meetingData)
        setEditingMeeting(null)
        toast({
          title: "Success",
          description: "Meeting updated successfully",
        })
      } else {
        // Create new meeting
        await apiService.createMeeting(meetingData)
        toast({
          title: "Success",
          description: "Meeting scheduled successfully",
        })
      }

      // Reload data
      const meetings = await apiService.getMeetings()
      const upcoming = meetings
        .filter((m: any) => m.status === 'scheduled')
        .map(mapMeeting)
      const completed = meetings
        .filter((m: any) => m.status === 'completed')
        .map(mapMeeting)
      
      setUpcomingMeetings(upcoming)
      setCompletedMeetings(completed)

      setIsScheduleModalOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule meeting",
      })
    }
  }

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    form.reset({
      date: meeting.date,
      time: meeting.time,
      topic: meeting.topic,
      agenda: meeting.agenda,
      teamsLink: meeting.teamsLink,
      durationMinutes: meeting.duration_minutes ?? 60,
    })
    setIsScheduleModalOpen(true)
  }

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await apiService.deleteMeeting(meetingId)
      setUpcomingMeetings(meetings => meetings.filter(m => m.id !== meetingId))
      toast({
        title: "Success",
        description: "Meeting cancelled successfully",
      })
    } catch (error) {
      console.error("Error cancelling meeting:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel meeting",
      })
    }
  }

  const handleViewMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    // Pre-populate form with existing data
    notesForm.reset({
      comments: meeting.comments || "",
      actionPoints: meeting.actionPoints || "",
      attendance: meeting.attendance || [],
    })
    setIsNotesModalOpen(true)
  }

  const handleMarkComplete = (meeting: Meeting) => {
    // Open the notes modal to add notes and attendance
    setEditingMeeting(meeting)
    setIsNotesModalOpen(true)
  }

  const handleCompleteMeeting = async (meeting: Meeting, comments: string, actionPoints: string, attendance: string[]) => {
    try {
      await apiService.completeMeeting(meeting.id, comments, actionPoints, attendance)
      
      // Reload data
      const meetings = await apiService.getMeetings()
      const upcoming = meetings
        .filter((m: any) => m.status === 'scheduled')
        .map(mapMeeting)
      const completed = meetings
        .filter((m: any) => m.status === 'completed')
        .map(mapMeeting)
      
      setUpcomingMeetings(upcoming)
      setCompletedMeetings(completed)
      
      toast({
        title: "Success",
        description: "Meeting completed successfully",
      })
    } catch (error) {
      console.error("Error completing meeting:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete meeting",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading meetings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">General Meetings</h1>
        <Button onClick={() => setIsScheduleModalOpen(true)}>
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
          <Card className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Join Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 h-32">
                      No upcoming meetings scheduled
                    </TableCell>
                  </TableRow>
                ) : (
                  upcomingMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>{formatDateDMY(meeting.date)}</TableCell>
                      <TableCell>{meeting.time}</TableCell>
                      <TableCell>{meeting.duration_minutes ?? 60} min</TableCell>
                      <TableCell>{meeting.topic}</TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0" asChild>
                          <a href={meeting.teamsLink} target="_blank" rel="noopener noreferrer">
                            <Link className="w-4 h-4" />
                            <span className="sr-only">Join meeting</span>
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkComplete(meeting)}
                          title="Mark as Complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="sr-only">Mark as complete</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMeeting(meeting)}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Edit meeting</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelMeeting(meeting.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Cancel meeting</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 h-32">
                      No completed meetings found
                    </TableCell>
                  </TableRow>
                ) : (
                  completedMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>{formatDateDMY(meeting.date)}</TableCell>
                      <TableCell>{meeting.topic}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewMeeting(meeting)}>
                          View Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Meeting Modal */}
      <Dialog 
        open={isScheduleModalOpen} 
        onOpenChange={(open) => {
          setIsScheduleModalOpen(open)
          if (!open) {
            form.reset()
            setEditingMeeting(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
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
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, "0");
                            const d = String(date.getDate()).padStart(2, "0");
                            field.onChange(`${y}-${m}-${d}`);
                          }}
                          disabled={{ before: new Date(new Date().setHours(0,0,0,0)) }}
                          classNames={{
                            day_today: "bg-primary/10 text-primary",
                          }}
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
                  const [initH, initM] = initial.split(":");
                  const hourStr = initH?.padStart(2, "0") || "00";
                  const minuteStr = initM?.padStart(2, "0") || "00";

                  const setTime = (h24: string, m: string) => {
                    const hh = String(h24).padStart(2, "0");
                    const mm = String(m).padStart(2, "0");
                    field.onChange(`${hh}:${mm}`);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Time (24-hour)</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <Select onValueChange={(val) => setTime(val, minuteStr)} defaultValue={hourStr}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => setTime(hourStr, val)} defaultValue={minuteStr}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
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
                      <Textarea 
                        placeholder="Enter meeting agenda"
                        className="min-h-[100px]"
                        {...field}
                      />
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

              {/* Mentee group removed per requirements */}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit">{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notes & Attendance Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-[760px] md:max-w-[900px] lg:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting?.status === 'upcoming' 
                ? 'Complete Meeting - Add Notes & Attendance' 
                : 'Edit Meeting Notes & Attendance'
              }
            </DialogTitle>
          </DialogHeader>
          
          <Form {...notesForm}>
            <form onSubmit={notesForm.handleSubmit((data) => {
              if (editingMeeting) {
                if (editingMeeting.status === 'upcoming') {
                  // Completing an upcoming meeting
                  handleCompleteMeeting(editingMeeting, data.comments, data.actionPoints, data.attendance)
                } else {
                  // Updating an existing completed meeting
                  setCompletedMeetings(meetings =>
                    meetings.map(m => 
                      m.id === editingMeeting.id 
                        ? { ...m, comments: data.comments, actionPoints: data.actionPoints, attendance: data.attendance }
                        : m
                    )
                  )
                }
                setIsNotesModalOpen(false)
                notesForm.reset()
              }
            })} className="space-y-4">
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

              <FormField
                control={notesForm.control}
                name="attendance"
                render={() => (
                  <FormItem>
                    <FormLabel>Mark Attendance</FormLabel>
                    {/* Mark all present toggle */}
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
                                const allIds = menteesList.map((m: any) => m.id)
                                notesForm.setValue("attendance", allIds, { shouldDirty: true, shouldTouch: true })
                              } else {
                                notesForm.setValue("attendance", [], { shouldDirty: true, shouldTouch: true })
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
                                      const currentValue = field.value || []
                                      if (checked) {
                                        field.onChange([...currentValue, mentee.id])
                                      } else {
                                        field.onChange(currentValue.filter((value) => value !== mentee.id))
                                      }
                                    }}
                                  />
                                </FormControl>
                                <span>{mentee.name} ({mentee.registration_number})</span>
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMeeting?.status === 'upcoming' 
                    ? 'Complete Meeting' 
                    : 'Update Notes & Attendance'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MeetingsPage
