import { Calendar, Clock, Video, Plus } from "lucide-react";
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

const Meetings = () => {
  const meetings = [
    {
      id: 1,
      mentee: "Alice Johnson",
      date: "2025-10-05",
      time: "10:00 AM",
      duration: "1 hour",
      topic: "Career Planning",
      status: "scheduled",
    },
    {
      id: 2,
      mentee: "Bob Smith",
      date: "2025-10-06",
      time: "2:00 PM",
      duration: "45 mins",
      topic: "Project Review",
      status: "scheduled",
    },
    {
      id: 3,
      mentee: "Carol White",
      date: "2025-10-08",
      time: "11:00 AM",
      duration: "1 hour",
      topic: "Skill Development",
      status: "scheduled",
    },
    {
      id: 4,
      mentee: "David Brown",
      date: "2025-10-01",
      time: "3:00 PM",
      duration: "1 hour",
      topic: "Performance Review",
      status: "completed",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    return <Badge className="bg-primary text-primary-foreground">Scheduled</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-1">Manage your mentoring sessions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52 min</div>
            <p className="text-xs text-muted-foreground">Per meeting</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.mentee}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>{meeting.time}</TableCell>
                  <TableCell>{meeting.duration}</TableCell>
                  <TableCell>{meeting.topic}</TableCell>
                  <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                  <TableCell className="text-right">
                    {meeting.status === "scheduled" ? (
                      <Button size="sm" variant="outline">
                        Join
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost">
                        View Notes
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meetings;
