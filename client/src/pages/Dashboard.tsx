import React, { useState, useEffect } from "react";
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
  // Download,
  RefreshCw,
  Mail,
  Sparkles,
  Target,
  UserPlus,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
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
import { motion } from "framer-motion";
import { toast } from "sonner";

// Services
import { taskService } from "@/services/taskService";
import { companyMemberService } from "@/services/companyMemberService";
import { teamService } from "@/services/teamService";
import { notificationService } from "@/services/notificationService";

// Types
import type { Task } from "@/types/task.types";
// import type { CompanyMember } from "@/types/companyMember.ts";
import type { CompanyTeam } from "@/types/companyTeams.ts";
import type { MainNotification } from "@/types/notification";

// Loading skeleton
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="border border-gray-200 dark:border-gray-700"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Table Skeleton */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Preview Skeleton */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Quick Actions Skeleton */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Templates Skeleton */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    high: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300",
    medium:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[priority as keyof typeof variants]} font-medium`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

// Status Badge Component
const TaskStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    completed:
      "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300",
    "in-progress":
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
    pending:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
    overdue:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300",
    cancelled:
      "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300",
  };

  const labels = {
    completed: "Completed",
    "in-progress": "In Progress",
    pending: "Pending",
    overdue: "Overdue",
    cancelled: "Cancelled",
  };

  return (
    <Badge
      className={`${variants[status as keyof typeof variants]} font-medium`}
    >
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    assignedByYou: 0,
    dueToday: 0,
    teamMembers: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  // const [teamMembers, setTeamMembers] = useState<CompanyMember[]>([]);
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [notifications, setNotifications] = useState<MainNotification[]>([]);
  const [upcomingCalendar, setUpcomingCalendar] = useState<any[]>([]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get tasks for calendar preview (next 7 days)
  const getUpcomingTasks = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const response = await taskService.getTasks({
        dueDateFrom: today.toISOString(),
        dueDateTo: nextWeek.toISOString(),
        limit: 20,
        sortBy: "dueDate",
        sortOrder: "asc",
      });

      // Group tasks by due date
      const groupedTasks: { [key: string]: Task[] } = {};
      response.data.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate).toDateString();
        if (!groupedTasks[dueDate]) {
          groupedTasks[dueDate] = [];
        }
        groupedTasks[dueDate].push(task);
      });

      // Convert to calendar format
      const calendarData = Object.entries(groupedTasks).map(([date, tasks]) => {
        const taskDate = new Date(date);
        const now = new Date();
        const diffDays = Math.floor(
          (taskDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        let dateLabel = "";
        if (diffDays === 0) dateLabel = "Today";
        else if (diffDays === 1) dateLabel = "Tomorrow";
        else
          dateLabel = taskDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

        let type: "busy" | "medium" | "light" = "light";
        if (tasks.length >= 4) type = "busy";
        else if (tasks.length >= 2) type = "medium";

        return {
          date: dateLabel,
          tasks: tasks.length,
          type,
          items: tasks.slice(0, 3).map((task) => task.title),
        };
      });

      setUpcomingCalendar(calendarData.slice(0, 4));
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    }
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
          limit: 100,
          page: 1,
          sortBy: "dueDate",
          sortOrder: "asc",
        }),
        companyMemberService.getCompanyMembers({
          limit: 100,
          page: 1,
          sortBy: "fullName",
          sortOrder: "asc",
        }),
        teamService.getTeams({
          limit: 100,
          page: 1,
          sortBy: "teamName",
          sortOrder: "asc",
        }),
        notificationService.getMainNotifications({
          limit: 5,
          page: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

      const tasks = tasksResponse.data.tasks;
      const members = membersResponse.members;
      const teamsData = teamsResponse.data.teams;
      const notificationsData = notificationsResponse.status
        ? notificationsResponse.data.notifications
        : [];

      // Calculate stats
      const today = getTodayDate();
      const todayTasks = tasks.filter((task: Task) => {
        const dueDate = new Date(task.dueDate).toISOString().split("T")[0];
        return dueDate === today;
      });

      const pendingTasks = tasks.filter(
        (task: Task) => task.status === "pending",
      );
      const completedTasks = tasks.filter(
        (task: Task) => task.status === "completed",
      );
      const overdueTasks = tasks.filter(
        (task: Task) => task.status === "overdue",
      );

      // For demo purposes, let's assume 23 tasks are assigned by the current user
      // In a real app, you would filter by current user ID
      const assignedByYou = 23; // Mock data for now

      setStats({
        totalTasks: tasks.length,
        assignedByYou,
        dueToday: todayTasks.length,
        teamMembers: members.length,
        pendingTasks: pendingTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
      });

      // Get tasks for the table (mix of assigned to and by current user)
      const myTasksData = tasks.slice(0, 4).map((task) => ({
        ...task,
        assignedByUser: members[Math.floor(Math.random() * members.length)], // Mock assigned by
      }));

      setMyTasks(myTasksData);
      // setTeamMembers(members);
      setTeams(teamsData);
      setNotifications(notificationsData);

      // Get upcoming tasks for calendar
      await getUpcomingTasks();
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data", {
        description: "Using cached data as fallback",
      });

      // Fallback to local storage
      const localTasks = taskService.getTasksFromLocalStorage();
      const localMembers = companyMemberService.getMembersFromLocalStorage();
      const localTeams = teamService.getTeamsFromLocalStorage();

      setStats({
        totalTasks: localTasks.length,
        assignedByYou: 23,
        dueToday: 8,
        teamMembers: localMembers.length,
        pendingTasks: localTasks.filter((t: any) => t.status === "pending")
          .length,
        completedTasks: localTasks.filter((t: any) => t.status === "completed")
          .length,
        overdueTasks: localTasks.filter((t: any) => t.status === "overdue")
          .length,
      });

      setMyTasks(localTasks.slice(0, 4));
      // setTeamMembers(localMembers.slice(0, 10));
      setTeams(localTeams.slice(0, 5));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
    toast.info("Refreshing dashboard data...");
  };

  // Stats data
  const statsData = [
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      change: `${Math.floor((stats.totalTasks / 100) * 12)}%`,
      icon: Clock,
      color: "bg-blue-500",
      trend: "up",
      description: "All tasks in the system",
    },
    {
      title: "Assigned by You",
      value: stats.assignedByYou.toString(),
      change: "+5",
      icon: Users,
      color: "bg-purple-500",
      trend: "up",
      description: "Tasks you assigned",
    },
    {
      title: "Due Today",
      value: stats.dueToday.toString(),
      change: stats.dueToday > 3 ? "Urgent" : "On Track",
      icon: AlertTriangle,
      color: stats.dueToday > 3 ? "bg-amber-500" : "bg-green-500",
      trend: stats.dueToday > 3 ? "warning" : "up",
      description: "Tasks due today",
    },
    {
      title: "Team Members",
      value: stats.teamMembers.toString(),
      change: "+2",
      icon: UserPlus,
      color: "bg-green-500",
      trend: "up",
      description: "Active team members",
    },
  ];

  // AI Templates (static for now)
  const aiTemplates = [
    {
      name: "Follow-up Reminder",
      usage: 24,
      lastUsed: "Today",
      aiGenerated: true,
    },
    {
      name: "Urgent Deadline",
      usage: 12,
      lastUsed: "Yesterday",
      aiGenerated: true,
    },
    {
      name: "Weekly Check-in",
      usage: 8,
      lastUsed: "3 days ago",
      aiGenerated: true,
    },
    {
      name: "Task Completion",
      usage: 15,
      lastUsed: "Today",
      aiGenerated: false,
    },
  ];

  // Boltic Status (static for now)
  const bolticStatus = {
    emailWorkflow: { status: "active", sentToday: 18, successRate: "98%" },
    reminderWorkflow: { status: "active", triggered: 23, successRate: "95%" },
    escalationWorkflow: { status: "paused", triggered: 0, successRate: "100%" },
  };

  // Quick Actions
  const quickActions = [
    {
      label: "Create Task",
      icon: Plus,
      href: "/tasks/create",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      label: "Add Team Member",
      icon: UserPlus,
      href: "/team/add",
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      label: "View Calendar",
      icon: Calendar,
      href: "/calendar",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      label: "AI Template",
      icon: Sparkles,
      href: "/templates/ai",
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              TaskChaser Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage tasks, teams, and automated follow-ups in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link to="/tasks/create">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        stat.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : stat.trend === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change}{" "}
                      {stat.trend === "up"
                        ? "↗"
                        : stat.trend === "warning"
                          ? "⚠"
                          : "↘"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.title === "Total Tasks" && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stats.completedTasks} completed
                      </span>
                    )}
                    {stat.title === "Assigned by You" && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {stats.pendingTasks} pending
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Task Stats Progress */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">{stats.completedTasks}</span>
                </div>
                <Progress
                  value={(stats.completedTasks / stats.totalTasks) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending</span>
                  <span className="font-medium">{stats.pendingTasks}</span>
                </div>
                <Progress
                  value={(stats.pendingTasks / stats.totalTasks) * 100}
                  className="h-2 bg-yellow-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overdue</span>
                  <span className="font-medium">{stats.overdueTasks}</span>
                </div>
                <Progress
                  value={(stats.overdueTasks / stats.totalTasks) * 100}
                  className="h-2 bg-red-100"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Active Teams</span>
                  </div>
                  <span className="font-bold">{teams.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Team Members</span>
                  </div>
                  <span className="font-bold">{stats.teamMembers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Avg. Tasks per Team</span>
                  </div>
                  <span className="font-bold">
                    {teams.length > 0
                      ? Math.round(stats.totalTasks / teams.length)
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-2">
                    <div
                      className={`mt-1 ${
                        notification.notificationType === "alert"
                          ? "text-red-500"
                          : notification.notificationType === "good"
                            ? "text-green-500"
                            : "text-blue-500"
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
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/notifications" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Left Column - Tasks & Calendar Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tasks & Assigned Tasks */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Tasks & Assigned Tasks</CardTitle>
                    <CardDescription>
                      Tasks assigned to you and by you
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Link to="/tasks">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {task.status === "completed" && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {task.status === "in-progress" && (
                              <Clock className="w-4 h-4 text-blue-500" />
                            )}
                            {task.status === "pending" && (
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="truncate max-w-[200px]">
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
                                  .map((n: string) => n[0])
                                  .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {task.assignedTo?.fullName || "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(task.dueDate)}
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={task.priority} />
                        </TableCell>
                        <TableCell>
                          <TaskStatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={`/tasks/edit/${task.id}`}>
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {myTasks.length} of {stats.totalTasks} tasks
                </div>
                <Link to="/tasks/create">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Task
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Calendar Preview */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle>Calendar Preview</CardTitle>
                      <CardDescription>
                        Upcoming tasks in calendar view
                      </CardDescription>
                    </div>
                  </div>
                  <Link to="/calendar">
                    <Button variant="outline" size="sm">
                      Open Calendar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {upcomingCalendar.map((day, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        day.type === "busy"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : day.type === "medium"
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                            : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {day.date}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {day.tasks} task{day.tasks !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <Badge variant="outline">{day.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        {day.items.map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, itemIndex: React.Key | null | undefined) => (
                          <div
                            key={itemIndex}
                            className="text-sm p-2 bg-white/50 dark:bg-gray-800/50 rounded line-clamp-1"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          className="flex-col h-auto py-4 gap-2 w-full"
                        >
                          <div className={`p-2 rounded-full ${action.color}`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{action.label}</span>
                        </Button>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Templates */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle>Message Templates</CardTitle>
                      <CardDescription>AI-generated templates</CardDescription>
                    </div>
                  </div>
                  <Link to="/templates">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiTemplates.map((template, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${
                            template.aiGenerated
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {template.aiGenerated ? (
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Used {template.usage} times
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {template.aiGenerated ? "AI" : "Custom"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/templates/ai" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate AI Template
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Boltic Automation Status */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-500" />
                  <div>
                    <CardTitle>Boltic Automation</CardTitle>
                    <CardDescription>
                      Email & reminder workflows
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email Workflow */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Email Workflow</span>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {bolticStatus.emailWorkflow.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Emails Sent Today
                        </span>
                        <span className="font-medium">
                          {bolticStatus.emailWorkflow.sentToday}
                        </span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate: {bolticStatus.emailWorkflow.successRate}
                    </div>
                  </div>

                  <Separator />

                  {/* Reminder Workflow */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Reminder Workflow</span>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {bolticStatus.reminderWorkflow.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Reminders Today
                        </span>
                        <span className="font-medium">
                          {bolticStatus.reminderWorkflow.triggered}
                        </span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate: {bolticStatus.reminderWorkflow.successRate}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/automations" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Zap className="w-4 h-4" />
                    Manage Automations
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
