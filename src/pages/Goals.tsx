import { Target, Plus, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Goals = () => {
  const goals = [
    {
      id: 1,
      mentee: "Alice Johnson",
      title: "Complete React Certification",
      progress: 75,
      status: "in-progress",
      deadline: "2025-10-15",
      notes: "Working on final project",
    },
    {
      id: 2,
      mentee: "Bob Smith",
      title: "Lead Team Project",
      progress: 60,
      status: "in-progress",
      deadline: "2025-10-30",
      notes: "Team assembled, planning phase complete",
    },
    {
      id: 3,
      mentee: "Carol White",
      title: "Improve Communication Skills",
      progress: 40,
      status: "in-progress",
      deadline: "2025-11-15",
      notes: "Attending weekly workshops",
    },
    {
      id: 4,
      mentee: "David Brown",
      title: "Learn Python",
      progress: 100,
      status: "completed",
      deadline: "2025-09-30",
      notes: "Completed all modules",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </Badge>;
    }
    return <Badge className="bg-primary text-primary-foreground gap-1">
      <Clock className="h-3 w-3" />
      In Progress
    </Badge>;
  };

  const stats = [
    { label: "Total Goals", value: "24", icon: Target },
    { label: "Completed", value: "18", icon: CheckCircle2 },
    { label: "In Progress", value: "6", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals & Progress</h1>
          <p className="text-muted-foreground mt-1">Track mentee goals and achievements</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">Mentee: {goal.mentee}</p>
                </div>
                {getStatusBadge(goal.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">{goal.deadline}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{goal.notes}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Edit Goal
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Goals;
