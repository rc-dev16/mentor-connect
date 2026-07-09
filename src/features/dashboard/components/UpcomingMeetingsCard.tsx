import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateDMY, type UpcomingMeetingView } from "@/features/dashboard/lib/dashboard-presenters";

interface UpcomingMeetingsCardProps {
  meetings: UpcomingMeetingView[];
  isLoading?: boolean;
  titleClassName?: string;
  iconSize?: "sm" | "lg";
  joinButtonVariant?: "outline" | "default";
  joinButtonSize?: "default" | "sm";
  footerAction?: {
    label: string;
    onClick: () => void;
  };
}

export const UpcomingMeetingsCard = ({
  meetings,
  isLoading = false,
  titleClassName = "flex items-center gap-2",
  iconSize = "sm",
  joinButtonVariant = "default",
  joinButtonSize = "sm",
  footerAction,
}: UpcomingMeetingsCardProps) => {
  const Icon = iconSize === "lg" ? Clock : Calendar;
  const iconClass = iconSize === "lg" ? "h-6 w-6 text-primary" : "h-5 w-5 text-primary";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className={titleClassName}>
          <Icon className={iconClass} />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className={iconSize === "lg" ? "flex-1 overflow-hidden flex flex-col" : undefined}>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
        ) : meetings.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
            No upcoming meetings
          </div>
        ) : (
          <div className={`space-y-4 ${iconSize === "lg" ? "flex-1 overflow-auto" : ""}`}>
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`flex items-start justify-between p-3 rounded-lg ${
                  iconSize === "lg" ? "bg-muted/50 hover:bg-muted transition-colors" : "border"
                }`}
              >
                <div className={iconSize === "lg" ? "space-y-2" : "space-y-1"}>
                  <p className={iconSize === "lg" ? "text-base font-medium text-foreground" : "font-medium"}>
                    {meeting.topic}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateDMY(meeting.date)} at {meeting.time}
                  </p>
                </div>
                <Button
                  size={joinButtonSize}
                  variant={joinButtonVariant}
                  className={joinButtonSize === "default" ? "px-6" : undefined}
                  disabled={!meeting.teamsLink}
                  onClick={() => meeting.teamsLink && window.open(meeting.teamsLink, "_blank")}
                >
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
        {footerAction && (
          <Button variant="outline" className="w-full mt-4" onClick={footerAction.onClick}>
            {footerAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
