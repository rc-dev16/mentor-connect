import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ActivityItem } from "@/data/types/meetings.types";

export interface UpcomingMeetingView {
  id: string;
  topic: string;
  date: string;
  time: string;
  teamsLink?: string;
}

export interface DashboardNotificationView {
  id: string;
  type: string;
  status: string;
  title?: string;
  message?: string;
  time: string;
  created_at: string;
  is_read: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

export const formatDateDMY = (isoDate: string | undefined) => {
  if (!isoDate) return "";
  const d = String(isoDate).slice(0, 10);
  const [y, m, d2] = d.split("-");
  return `${d2}-${m}-${y}`;
};

export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export const mapUpcomingMeeting = (m: {
  id: string;
  topic?: string;
  title?: string;
  meeting_date?: string;
  meeting_time?: string;
  teams_link?: string;
}): UpcomingMeetingView => ({
  id: m.id,
  topic: m.topic || m.title || "Meeting",
  date: (m.meeting_date || "").slice(0, 10),
  time: (m.meeting_time || "").slice(0, 5),
  teamsLink: m.teams_link,
});

export const mapActivityToNotification = (item: ActivityItem): DashboardNotificationView => {
  const status = (item.status || "").toLowerCase();
  const type =
    item.type === "session_request" && status && status !== "pending"
      ? "session_status"
      : item.type || "notification";

  const timestamp = item.ts || item.created_at || item.time || "";
  const displayTime =
    timestamp && !Number.isNaN(Date.parse(timestamp)) ? formatTimeAgo(timestamp) : item.time || "";

  let scheduledDate: string | undefined;
  let scheduledTime: string | undefined;
  if (type === "session_status" && status === "approved" && item.time) {
    const parts = item.time.split(" ");
    scheduledDate = parts[0];
    scheduledTime = parts[1];
  }

  return {
    id: item.id,
    type,
    status,
    title: item.title,
    message: item.message,
    time: displayTime,
    created_at: timestamp,
    is_read: item.is_read ?? false,
    scheduledDate,
    scheduledTime,
  };
};

export const getNotificationIcon = (notification: DashboardNotificationView): ReactNode => {
  switch (notification.type) {
    case "session_request":
      return notification.status === "pending" ? (
        <AlertCircle className="h-5 w-5 text-yellow-500" />
      ) : (
        <CheckCircle className="h-5 w-5 text-green-500" />
      );
    case "session_status":
      return notification.status === "accepted" || notification.status === "approved" ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : notification.status === "rescheduled" ? (
        <Calendar className="h-5 w-5 text-blue-500" />
      ) : notification.status === "completed" ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      );
    case "resource_added":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "info_update":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "meeting_notes":
      return <FileText className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
};

export const renderActivityBadge = (n: ActivityItem) => {
  const msg = n.message || "";
  const lower = msg.toLowerCase();
  let badge = "UPDATE";
  let badgeClass = "bg-muted text-foreground";
  let icon: ReactNode = <Bell className="h-4 w-4 text-primary" />;
  if (lower.includes("session request")) {
    badge = "REQUEST";
    badgeClass = "bg-blue-100 text-blue-700";
    icon = <Calendar className="h-4 w-4 text-blue-600" />;
  }
  if (lower.includes("approved")) {
    badge = "APPROVED";
    badgeClass = "bg-green-100 text-green-700";
    icon = <CheckCircle className="h-4 w-4 text-green-600" />;
  }
  if (lower.includes("rejected") || lower.includes("cancelled")) {
    badge = "REJECTED";
    badgeClass = "bg-red-100 text-red-700";
    icon = <XCircle className="h-4 w-4 text-red-600" />;
  }
  if (lower.includes("rescheduled")) {
    badge = "RESCHEDULED";
    badgeClass = "bg-amber-100 text-amber-700";
    icon = <Clock className="h-4 w-4 text-amber-600" />;
  }
  if (lower.includes("completed")) {
    badge = "COMPLETED";
    badgeClass = "bg-emerald-100 text-emerald-700";
    icon = <CheckCircle className="h-4 w-4 text-emerald-600" />;
  }
  if (lower.includes("scheduled:")) {
    badge = "SCHEDULED";
    badgeClass = "bg-violet-100 text-violet-700";
    icon = <Calendar className="h-4 w-4 text-violet-600" />;
  }
  return { badge, badgeClass, icon };
};
