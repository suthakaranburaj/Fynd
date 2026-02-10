import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  Calendar,
  Zap,
  Plus,
  MoreVertical,
  Filter,
  RefreshCw,
  Mail,
  Sparkles,
  Target,
  UserPlus,
  FileText,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  Circle,
  BarChart3,
  Activity,
  Rocket,
  TargetIcon,
  Inbox,
  Eye,
  CalendarDays,
  Download,
  Upload,
  Settings,
  HelpCircle,
  UserCheck,
  Shield,
  Award,
  PieChart,
  BellRing,
  Timer,
  TimerOff,
  FolderOpen,
  CheckSquare,
  XCircle,
  PlayCircle,
  PauseCircle,
  RotateCw,
  Lightbulb,
  Brain,
  Smartphone,
  MailOpen,
  MousePointerClick,
  LineChart,
  Target as TargetLucide,
  ArrowRight,
  User,
  Mail as MailIcon,
  FolderKanban,
  Tag,
  Paperclip,
  Search,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  format,
  parseISO,
  differenceInDays,
  isToday,
  isTomorrow,
  startOfDay,
  endOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";

// Services
import { taskService } from "@/services/taskService";
import { companyMemberService } from "@/services/companyMemberService";
import { teamService } from "@/services/teamService";
import { notificationService } from "@/services/notificationService";
import { reminderService } from "@/services/reminderService";

// Types
import type { Task } from "@/types/task.types";
import type { CompanyMember } from "@/types/companyMember.ts";
import type { CompanyTeam } from "@/types/companyTeams.ts";
import type { MainNotification } from "@/types/notification";
import type { Reminder } from "@/types/reminder.types";

// Components
import { TaskStatusBadge, PriorityBadge } from "../components/TaskBadges";
import TaskFormModal from "../components/forms/TaskFormModal";
import SendReminderModal from "../components/forms/SendReminderModal";

// Framer Variants
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";

// Loading skeleton
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="flex flex-wrap gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border flex-1 min-w-[200px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 space-y-6">
            <div className="h-96 bg-muted rounded animate-pulse"></div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 h-64 bg-muted rounded animate-pulse"></div>
              <div className="flex-1 h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <div className="h-48 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend,
  description,
  loading = false,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  trend: "up" | "down" | "warning" | "neutral";
  description: string;
  loading?: boolean;
}) => {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    warning: "⚠",
    neutral: "➡",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex-1 min-w-[200px]"
    >
      <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden group h-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent via-white/5 to-transparent transform translate-x-16 -translate-y-16 rotate-45 group-hover:translate-x-20 transition-transform duration-500" />
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </CardTitle>
              <CardDescription className="text-xs mt-1 truncate">
                {description}
              </CardDescription>
            </div>
            <div
              className={`${color} p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0 ml-2`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-3xl font-bold text-foreground mb-1 truncate">
                {loading ? (
                  <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                ) : (
                  value
                )}
              </div>
              <div
                className={`text-sm font-medium ${trendColors[trend]} flex items-center gap-1 truncate`}
              >
                {loading ? (
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                ) : (
                  <>
                    {trendIcons[trend]} {change}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Task Progress Ring Component
const TaskProgressRing = ({
  value,
  color,
  label,
  sublabel,
}: {
  value: number;
  color: string;
  label: string;
  sublabel: string;
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="transform -rotate-90" width="100" height="100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-800"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member }: { member: CompanyMember }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-background group-hover:border-primary transition-colors">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(member.fullName || member.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">
              {member.fullName || member.email.split("@")[0]}
            </p>
            <Badge variant="default" className="text-xs bg-green-500">
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {member.role || "Team Member"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({
  label,
  icon: Icon,
  color,
  onClick,
  description,
}: {
  label: string;
  icon: any;
  color: string;
  onClick: () => void;
  description?: string;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:shadow-md transition-all ${color} group flex-1 min-w-[140px]`}
    >
      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm mb-3 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="font-medium text-white text-sm text-center">
        {label}
      </span>
      {description && (
        <span className="text-white/80 text-xs mt-1 text-center">
          {description}
        </span>
      )}
    </motion.button>
  );
};

// Recent Activity Item Component
const RecentActivityItem = ({ activity }: { activity: any }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return { icon: Plus, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "task_completed":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-500/10",
        };
      case "task_updated":
        return {
          icon: RefreshCw,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        };
      case "reminder_sent":
        return { icon: Bell, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "overdue":
        return {
          icon: AlertCircle,
          color: "text-red-500",
          bg: "bg-red-500/10",
        };
      default:
        return { icon: Activity, color: "text-gray-500", bg: "bg-gray-500/10" };
    }
  };

  const { icon: Icon, color, bg } = getActivityIcon(activity.type);

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div
          className={`p-2 rounded-full ${bg} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className="flex-1 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{activity.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {activity.description}
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {activity.time}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForReminder, setTaskForReminder] = useState<Task | null>(null);

  // Dashboard data states
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    activeTeams: 0,
    remindersSent: 0,
    dueToday: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [notifications, setNotifications] = useState<MainNotification[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format time ago utility
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    } catch (error) {
      return "Recently";
    }
  };

  // Calculate task metrics from backend data
  const calculateTaskMetrics = (tasks: Task[]) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => {
        try {
          const dueDate = parseISO(t.dueDate);
          return (
            t.status !== "completed" &&
            t.status !== "cancelled" &&
            dueDate < todayStart
          );
        } catch {
          return false;
        }
      }).length,
      dueToday: tasks.filter((t) => {
        try {
          const dueDate = parseISO(t.dueDate);
          return (
            dueDate >= todayStart &&
            dueDate <= todayEnd &&
            t.status !== "completed"
          );
        } catch {
          return false;
        }
      }).length,
      highPriority: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed",
      ).length,
    };
  };

  // Generate recent activities from backend data
  const generateRecentActivities = (
    tasks: Task[],
    notifications: MainNotification[],
  ) => {
    const activities: {
      type: string;
      title: string;
      description: string;
      time: string;
      taskId?: string;
      notificationId?: string;
    }[] = [];

    // Add task activities
    tasks.slice(0, 5).forEach((task) => {
      activities.push({
        type: "task_created",
        title: "Task Created",
        description: task.title,
        time: formatTimeAgo(task.createdAt),
        taskId: task.id,
      });

      if (task.status === "completed") {
        activities.push({
          type: "task_completed",
          title: "Task Completed",
          description: task.title,
          time: formatTimeAgo(task.updatedAt),
          taskId: task.id,
        });
      } else if (task.status === "overdue") {
        activities.push({
          type: "overdue",
          title: "Task Overdue",
          description: task.title,
          time: formatTimeAgo(task.dueDate),
          taskId: task.id,
        });
      }
    });

    // Add notification activities
    notifications.slice(0, 3).forEach((notification) => {
      activities.push({
        type: "reminder_sent",
        title:
          notification.notificationType === "alert"
            ? "Alert Sent"
            : "Notification Sent",
        description: notification.title,
        time: formatTimeAgo(notification.createdAt),
        notificationId: notification.id,
      });
    });

    // Sort by time (most recent first) and limit to 8
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [
        tasksResponse,
        membersResponse,
        teamsResponse,
        notificationsResponse,
      ] = await Promise.all([
        taskService.getTasks({
          limit: 50,
          page: 1,
          sortBy: "dueDate",
          sortOrder: "asc",
        }),
        companyMemberService.getCompanyMembers({
          limit: 50,
          page: 1,
          sortBy: "fullName",
          sortOrder: "asc",
        }),
        teamService.getTeams({
          limit: 50,
          page: 1,
          sortBy: "teamName",
          sortOrder: "asc",
        }),
        notificationService.getMainNotifications({
          limit: 10,
          page: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

      const tasksData = tasksResponse.data?.tasks || [];
      const membersData = membersResponse.members || [];
      const teamsData = teamsResponse.data?.teams || [];
      const notificationsData = notificationsResponse.data?.notifications || [];

      // Calculate stats from backend data
      const taskMetrics = calculateTaskMetrics(tasksData);

      setStats({
        totalTasks: taskMetrics.total,
        completedTasks: taskMetrics.completed,
        pendingTasks: taskMetrics.pending,
        overdueTasks: taskMetrics.overdue,
        inProgressTasks: taskMetrics.inProgress,
        teamMembers: membersData.length,
        activeTeams: teamsData.filter((t) => t.status === "active").length,
        remindersSent: 0, // Will be calculated if we have reminder data
        dueToday: taskMetrics.dueToday,
      });

      // Set data
      setTasks(tasksData.slice(0, 8));
      setMembers(membersData.slice(0, 6));
      setTeams(teamsData.slice(0, 4));
      setNotifications(notificationsData.slice(0, 5));

      // Generate recent activities from backend data
      const activities = generateRecentActivities(tasksData, notificationsData);
      setRecentActivities(activities);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data", {
        description: "Using cached data as fallback",
      });

      // Fallback to local storage data
      try {
        const localTasks = taskService.getTasksFromLocalStorage();
        const localMembers = companyMemberService.getMembersFromLocalStorage();
        const localTeams = teamService.getTeamsFromLocalStorage();
        const localNotifications =
          notificationService.getMainNotificationsFromLocalStorage();

        const taskMetrics = calculateTaskMetrics(localTasks);

        setStats({
          totalTasks: taskMetrics.total,
          completedTasks: taskMetrics.completed,
          pendingTasks: taskMetrics.pending,
          overdueTasks: taskMetrics.overdue,
          inProgressTasks: taskMetrics.inProgress,
          teamMembers: localMembers.length,
          activeTeams: localTeams.filter((t) => t.status === "active").length,
          remindersSent: 0,
          dueToday: taskMetrics.dueToday,
        });

        setTasks(localTasks.slice(0, 8));
        setMembers(localMembers.slice(0, 6));
        setTeams(localTeams.slice(0, 4));
        setNotifications(localNotifications.slice(0, 5));

        const activities = generateRecentActivities(
          localTasks,
          localNotifications,
        );
        setRecentActivities(activities);
      } catch (fallbackError) {
        console.error("Fallback data error:", fallbackError);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle task save
  const handleSaveTask = async (data: any, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        // Update existing task
        const updatedTask = await taskService.updateTask(id, data);
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        const newTask = await taskService.createTask(data);
        toast.success("Task created successfully!");
      }
      setIsTaskModalOpen(false);
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task", {
        description: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle send reminder
  const handleSendReminder = async (taskId: string, message: string) => {
    setIsSubmitting(true);
    try {
      const response = await reminderService.sendManualReminder({
        taskId,
        daysThreshold: 0,
        message,
      });
      toast.success("Reminder sent successfully!", {
        description: `Reminder sent to ${response.data.remindersSent} user(s)`,
      });
      setIsReminderModalOpen(false);
      setTaskForReminder(null);
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder", {
        description: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle send reminder from dashboard
  const handleSendReminderFromDashboard = (task: Task) => {
    setTaskForReminder(task);
    setIsReminderModalOpen(true);
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.info("Refreshing dashboard data...", {
      description: "Fetching latest updates",
    });
  };

  // Quick actions
  const quickActions = [
    {
      label: "Create Task",
      icon: Plus,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
      },
      description: "Add new task",
    },
    {
      label: "Send Reminder",
      icon: Bell,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      onClick: () => {
        if (tasks.length > 0) {
          setTaskForReminder(tasks[0]);
          setIsReminderModalOpen(true);
        } else {
          toast.info("No tasks available", {
            description: "Create a task first to send reminders",
          });
        }
      },
      description: "Send reminder",
    },
    {
      label: "View Calendar",
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      onClick: () => (window.location.href = "/calendar"),
      description: "Schedule view",
    },
    {
      label: "Manage Team",
      icon: Users,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      onClick: () => (window.location.href = "/company-teams"),
      description: "Team settings",
    },
  ];

  // Stats data from backend
  const statsData = useMemo(
    () => [
      {
        title: "Total Tasks",
        value: stats.totalTasks.toString(),
        change: `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% done`,
        icon: TargetIcon,
        color: "bg-gradient-to-br from-blue-500 to-blue-600",
        trend: (stats.totalTasks > 0 ? "up" : "neutral") as any,
        description: "All active tasks",
      },
      {
        title: "Completed",
        value: stats.completedTasks.toString(),
        change:
          stats.totalTasks > 0
            ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% rate`
            : "No tasks",
        icon: CheckCircle,
        color: "bg-gradient-to-br from-green-500 to-green-600",
        trend: (stats.completedTasks > 0 ? "up" : "neutral") as any,
        description: "Tasks completed",
      },
      {
        title: "Overdue",
        value: stats.overdueTasks.toString(),
        change: stats.overdueTasks > 0 ? "Needs attention" : "All good",
        icon: AlertTriangle,
        color: "bg-gradient-to-br from-red-500 to-red-600",
        trend: (stats.overdueTasks > 0 ? "warning" : "up") as any,
        description: "Requires attention",
      },
      {
        title: "Due Today",
        value: stats.dueToday.toString(),
        change: stats.dueToday > 3 ? "Busy day" : "Manageable",
        icon: CalendarDays,
        color: "bg-gradient-to-br from-amber-500 to-amber-600",
        trend: (stats.dueToday > 3 ? "warning" : "neutral") as any,
        description: "Tasks due today",
      },
    ],
    [stats],
  );

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    return stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;
  }, [stats]);

  // Calculate pending percentage
  const pendingPercentage = useMemo(() => {
    return stats.totalTasks > 0
      ? Math.round((stats.pendingTasks / stats.totalTasks) * 100)
      : 0;
  }, [stats]);

  // Calculate overdue percentage
  const overduePercentage = useMemo(() => {
    return stats.totalTasks > 0
      ? Math.round((stats.overdueTasks / stats.totalTasks) * 100)
      : 0;
  }, [stats]);

  // Calculate in progress percentage
  const inProgressPercentage = useMemo(() => {
    return stats.totalTasks > 0
      ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100)
      : 0;
  }, [stats]);

  if (isLoading && !refreshing) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
        <div className="max-w-9xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                    TaskChaser Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span className="truncate">
                      Intelligent task management with automated follow-ups
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Live Data
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} loading={isLoading} />
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            className="flex flex-col lg:flex-row gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Left Column - Tasks & Analytics */}
            <div className="lg:w-2/3 space-y-6">
              {/* Tasks Overview */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TargetIcon className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle>Task Overview</CardTitle>
                        <CardDescription>
                          Real-time task analytics and distribution
                        </CardDescription>
                      </div>
                    </div>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="flex w-full md:w-auto">
                        <TabsTrigger value="overview" className="flex-1">
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1">
                          Pending
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex-1">
                          Completed
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs>
                    <TabsContent value="overview" className="mt-0">
                      <div className="flex flex-wrap gap-6 mb-6">
                        <div className="flex-1 min-w-[150px]">
                          <TaskProgressRing
                            value={completionPercentage}
                            color="text-green-500"
                            label="Completed"
                            sublabel={`${stats.completedTasks} tasks`}
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <TaskProgressRing
                            value={pendingPercentage}
                            color="text-amber-500"
                            label="Pending"
                            sublabel={`${stats.pendingTasks} tasks`}
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <TaskProgressRing
                            value={overduePercentage}
                            color="text-red-500"
                            label="Overdue"
                            sublabel={`${stats.overdueTasks} tasks`}
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <TaskProgressRing
                            value={inProgressPercentage}
                            color="text-blue-500"
                            label="In Progress"
                            sublabel={`${stats.inProgressTasks} tasks`}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Recent Tasks</h3>
                          <Link to="/tasks">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                            >
                              View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">
                                  Task
                                </TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                  Priority
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tasks.length > 0 ? (
                                tasks.slice(0, 5).map((task) => (
                                  <TableRow
                                    key={task.id}
                                    className="hover:bg-muted/50"
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                        {task.status === "completed" ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : task.status === "overdue" ? (
                                          <AlertCircle className="w-4 h-4 text-red-500" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className="truncate max-w-[150px]">
                                          {task.title}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarFallback className="text-xs">
                                            {task.assignedTo?.fullName
                                              ?.split(" ")
                                              .map((n) => n[0])
                                              .join("") || "?"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate max-w-[100px]">
                                          {task.assignedTo?.fullName?.split(
                                            " ",
                                          )[0] || "Unassigned"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {formatDate(task.dueDate)}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <TaskStatusBadge status={task.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <PriorityBadge priority={task.priority} />
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    No tasks found. Create your first task!
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Quick Actions & Team Overview */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Quick Actions */}
                <Card className="border-border shadow-sm flex-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <CardTitle>Quick Actions</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Shortcuts
                      </Badge>
                    </div>
                    <CardDescription>
                      Common workflows and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {quickActions.map((action, index) => (
                        <QuickActionButton key={index} {...action} />
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">Tip of the Day</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Use the calendar view to better visualize your
                            team's workload and deadlines.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <CardTitle>Notifications</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notifications.length} New
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={notification.id || index}
                            className="p-3 rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  notification.notificationType === "alert"
                                    ? "bg-red-500/10 text-red-500"
                                    : notification.notificationType === "good"
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-blue-500/10 text-blue-500"
                                }`}
                              >
                                {notification.notificationType === "alert" ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : notification.notificationType === "good" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Bell className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-1">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.description || "No description"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {notifications.length > 0 && (
                    <CardFooter>
                      <Link to="/notifications" className="w-full">
                        <Button variant="outline" className="w-full">
                          View All Notifications
                        </Button>
                      </Link>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>

            {/* Right Column - Activity & Notifications */}
            <div className="lg:w-1/3 space-y-6">
              {/* Recent Activity */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </div>
                  <CardDescription>
                    System activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <RecentActivityItem key={index} activity={activity} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                {recentActivities.length > 0 && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={handleRefresh}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Load More Activity
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </motion.div>

          {/* Bottom Section - Upcoming Deadlines & Performance */}
          <motion.div
            className="flex flex-col lg:flex-row gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Upcoming Deadlines */}
            <Card className="border-border shadow-sm lg:w-2/3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <CardTitle>Upcoming Deadlines</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Next 7 Days
                  </Badge>
                </div>
                <CardDescription>
                  Tasks approaching their due dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks
                    .filter((task) => {
                      try {
                        const dueDate = parseISO(task.dueDate);
                        const daysUntilDue = differenceInDays(
                          dueDate,
                          new Date(),
                        );
                        return (
                          daysUntilDue >= 0 &&
                          daysUntilDue <= 7 &&
                          task.status !== "completed"
                        );
                      } catch {
                        return false;
                      }
                    })
                    .slice(0, 6)
                    .map((task, index) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded ${
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-green-500/10 text-green-500"
                            }`}
                          >
                            {task.priority === "high" ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due {formatDate(task.dueDate)}
                            </p>
                            {task.project && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <FolderKanban className="w-3 h-3 mr-1" />
                                {task.project}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <TaskStatusBadge status={task.status} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              handleSendReminderFromDashboard(task)
                            }
                            disabled={
                              task.status === "completed" ||
                              task.status === "cancelled"
                            }
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  {tasks.filter((task) => {
                    try {
                      const dueDate = parseISO(task.dueDate);
                      const daysUntilDue = differenceInDays(
                        dueDate,
                        new Date(),
                      );
                      return (
                        daysUntilDue >= 0 &&
                        daysUntilDue <= 7 &&
                        task.status !== "completed"
                      );
                    } catch {
                      return false;
                    }
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No upcoming deadlines in the next 7 days</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/calendar" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Calendar className="w-4 h-4" />
                    View Calendar
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-border shadow-sm lg:w-1/3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-green-500" />
                    <CardTitle>Performance Metrics</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Today
                  </Badge>
                </div>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Task Completion
                      </span>
                      <span className="text-sm font-bold">
                        {completionPercentage}%
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        On-time Delivery
                      </span>
                      <span className="text-sm font-bold">
                        {stats.totalTasks > 0
                          ? Math.round(
                              ((stats.totalTasks - stats.overdueTasks) /
                                stats.totalTasks) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        stats.totalTasks > 0
                          ? Math.round(
                              ((stats.totalTasks - stats.overdueTasks) /
                                stats.totalTasks) *
                                100,
                            )
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Team Productivity
                      </span>
                      <span className="text-sm font-bold">
                        {stats.teamMembers > 0
                          ? Math.round(
                              (stats.completedTasks / stats.teamMembers) * 10,
                            )
                          : 0}
                      </span>
                    </div>
                    <Progress
                      value={
                        stats.teamMembers > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (stats.completedTasks / stats.teamMembers) * 10,
                              ),
                            )
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-200/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Total Teams</p>
                      <p className="text-2xl font-bold">{stats.activeTeams}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Members</p>
                      <p className="text-2xl font-bold">{stats.teamMembers}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-border flex-1 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500/30" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-500/10 border border-border flex-1 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Tasks
                  </p>
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-green-500/30" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-border flex-1 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teams Active
                  </p>
                  <p className="text-2xl font-bold">{stats.activeTeams}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500/30" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-border flex-1 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Due Today
                  </p>
                  <p className="text-2xl font-bold">{stats.dueToday}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-amber-500/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Task Form Modal */}
      {isTaskModalOpen && (
        <TaskFormModal
          open={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          editingTask={editingTask}
          onSave={handleSaveTask}
          isSubmitting={isSubmitting}
          members={members}
          teams={teams}
        />
      )}

      {/* Send Reminder Modal */}
      {isReminderModalOpen && taskForReminder && (
        <SendReminderModal
          open={isReminderModalOpen}
          onOpenChange={setIsReminderModalOpen}
          task={taskForReminder}
          onSend={handleSendReminder}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
