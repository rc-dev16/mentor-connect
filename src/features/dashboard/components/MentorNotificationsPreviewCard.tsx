import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActivityItem } from "@/data/types/meetings.types";
import { renderActivityBadge } from "@/features/dashboard/lib/dashboard-presenters";

interface MentorNotificationsPreviewCardProps {
  notifications: ActivityItem[];
  allNotifications: ActivityItem[];
  isLoading?: boolean;
}

export const MentorNotificationsPreviewCard = ({
  notifications,
  allNotifications,
  isLoading = false,
}: MentorNotificationsPreviewCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const { badge, badgeClass, icon } = renderActivityBadge(n);
                return (
                  <div key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider ${badgeClass}`}
                        >
                          {badge}
                        </span>
                        <p className="text-sm leading-snug break-words">{n.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4" onClick={() => setIsDialogOpen(true)}>
            View All Notifications
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>All Notifications</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : allNotifications.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
              {allNotifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="space-y-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
