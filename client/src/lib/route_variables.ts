import {
  Home,
  Bell,
  Clock,
  Users,
  MessageSquare,
  Calendar,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  id: string;
  pages: string;
}

export const navItems: NavItem[] = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/",
    id: "dashboard",
    pages: "Home",
  },
  {
    icon: Bell,
    label: "Active Reminders",
    href: "/reminders",
    id: "reminders",
    pages: "Home, Reminders",
  },
  {
    icon: Clock,
    label: "Task Management",
    href: "/tasks",
    id: "tasks",
    pages: "Home, Tasks",
  },
  {
    icon: Users,
    label: "Team Members",
    href: "/team",
    id: "team",
    pages: "Home, Team",
  },
  {
    icon: MessageSquare,
    label: "Message Templates",
    href: "/templates",
    id: "templates",
    pages: "Home, Templates",
  },
  {
    icon: Calendar,
    label: "Schedule & Calendar",
    href: "/calendar",
    id: "calendar",
    pages: "Home, Calendar",
  },
  // {
  //   icon: User,
  //   label: "Profile",
  //   href: "/profile",
  //   id: "profile",
  //   pages: "Home, Profile",
  // },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    id: "settings",
    pages: "Home, Settings",
  },
];
