import { Calendar, Target, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const upcomingMeetings = [
    { id: 1, mentee: "Alice Johnson", date: "2025-10-05", time: "10:00 AM", topic: "Career Planning" },
    { id: 2, mentee: "Bob Smith", date: "2025-10-06", time: "2:00 PM", topic: "Project Review" },
    { id: 3, mentee: "Carol White", date: "2025-10-08", time: "11:00 AM", topic: "Skill Development" },
  ];

  const recentActivities = [
    { id: 1, action: "Meeting completed with Alice Johnson", time: "2 hours ago" },
    { id: 2, action: "New goal set: Complete certification", time: "1 day ago" },
    { id: 3, action: "Report submitted for Q3", time: "2 days ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Mentees"
          value="12"
          icon={Users}
          description="Active mentorship relationships"
        />
        <DashboardCard
          title="Upcoming Meetings"
          value="5"
          icon={Calendar}
          description="Scheduled this week"
        />
        <DashboardCard
          title="Active Goals"
          value="18"
          icon={Target}
          description="In progress"
        />
        <DashboardCard
          title="Completion Rate"
          value="87%"
          icon={TrendingUp}
          description="+5% from last month"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{meeting.mentee}</p>
                    <p className="text-sm text-muted-foreground">{meeting.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {meeting.date} at {meeting.time}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Meetings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
