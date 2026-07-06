import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export const menteeNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Meetings", path: "/meetings" },
  { icon: Users, label: "Mentorship Connect", path: "/mentorship-connect" },
  { icon: UserCircle, label: "Personal Info", path: "/personal-info" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const mentorNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/mentor/dashboard" },
  { icon: Users, label: "My Mentees", path: "/mentor/mentees" },
  { icon: Calendar, label: "Meetings", path: "/mentor/meetings" },
  { icon: MessageSquare, label: "Session Requests", path: "/mentor/session-requests" },
  { icon: BookOpen, label: "Resources", path: "/mentor/resources" },
  { icon: FileText, label: "Reports", path: "/mentor/reports" },
  { icon: Settings, label: "Settings", path: "/mentor/settings" },
];
