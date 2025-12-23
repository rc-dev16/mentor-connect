import { useEffect, useState } from "react";
import { Calendar, Clock, Video, FileText, CheckCircle, XCircle, List, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import apiService from "@/services/api";

const MenteeMeetings = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await (apiService as any).getMenteeMeetings('scheduled');
        const mapped = Array.isArray(data) ? data.map((m: any) => ({
          id: m.id,
          date: (m.meeting_date || '').slice(0, 10),
          time: (m.meeting_time || '').slice(0, 5),
          topic: m.topic || m.title || 'Meeting',
          status: 'Scheduled',
          teamsLink: m.teams_link,
        })) : [];
        setUpcomingMeetings(mapped);
      } catch (e) {
        setUpcomingMeetings([]);
      }
    };
    load();
  }, []);

  const [attendedMeetings, setAttendedMeetings] = useState<any[]>([]);
  const [missedMeetings, setMissedMeetings] = useState<any[]>([]);

  useEffect(() => {
    const loadAttendedMeetings = async () => {
      try {
        const data = await (apiService as any).getMenteeMeetings('completed');
        const mapped = Array.isArray(data) ? data.map((m: any) => ({
          id: m.id,
          date: (m.meeting_date || '').slice(0, 10),
          time: (m.meeting_time || '').slice(0, 5),
          topic: m.topic || m.title || 'Meeting',
          status: 'Attended',
          notes: m.comments || '',
          actionPoints: m.action_points || '',
          feedback: m.comments || '',
          actionItems: m.action_points ? [m.action_points] : [],
          duration: m.duration_minutes ? `${m.duration_minutes} minutes` : '60 minutes'
        })) : [];
        setAttendedMeetings(mapped);
      } catch (e) {
        setAttendedMeetings([]);
      }
    };
    loadAttendedMeetings();
  }, []);

  // Missed meetings this semester - for now empty, could be implemented later
  // const missedMeetings: any[] = [];

  const form = useForm({
    defaultValues: {
      topic: "",
      preferredTime: "",
      comments: ""
    }
  });

  const onSubmit = (data: any) => {
    // TODO: Send meeting request to mentor
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
        <p className="text-muted-foreground mt-1">View your scheduled and completed meetings.</p>
      </div>

      {/* Upcoming Meetings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>{meeting.time}</TableCell>
                  <TableCell>{meeting.topic}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{meeting.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-2" asChild>
                      <a href={meeting.teamsLink} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" />
                        Join
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Meetings History Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Attended Meetings This Semester */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Meetings Attended
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table className="[&_td]:py-2 [&_th]:py-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(attendedMeetings || []).map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="whitespace-nowrap">
                      <div>{meeting.date}</div>
                      <div className="text-sm text-muted-foreground">{meeting.time}</div>
                    </TableCell>
                    <TableCell>{meeting.topic}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            View Notes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Meeting Details - {meeting.topic}</DialogTitle>
                            <DialogDescription>
                              {meeting.date} at {meeting.time} ({meeting.duration})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Meeting Notes</h4>
                              <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Mentor Feedback</h4>
                              <p className="text-sm text-muted-foreground">{meeting.feedback}</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Action Items</h4>
                              <ul className="space-y-1">
                                {meeting.actionItems && Array.isArray(meeting.actionItems) ? meeting.actionItems.map((item, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                                    <span>{item}</span>
                                  </li>
                                )) : (
                                  <li className="text-sm text-muted-foreground">No action items</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Missed Meetings This Semester */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Meetings Missed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table className="[&_td]:py-2 [&_th]:py-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(missedMeetings || []).map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="whitespace-nowrap">
                      <div>{meeting.date}</div>
                      <div className="text-sm text-muted-foreground">{meeting.time}</div>
                    </TableCell>
                    <TableCell>{meeting.topic}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            View Notes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Missed Meeting Details - {meeting.topic}</DialogTitle>
                            <DialogDescription>
                              Originally scheduled for {meeting.date} at {meeting.time}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <h4 className="font-medium mb-2">Meeting Notes:</h4>
                              <p className="text-sm text-muted-foreground">{meeting.notes || 'No notes available'}</p>
                            </div>
                            {meeting.actionPoints && (
                              <div>
                                <h4 className="font-medium mb-2">Action Points:</h4>
                                <p className="text-sm text-muted-foreground">{meeting.actionPoints}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenteeMeetings;
