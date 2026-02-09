import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  // Clock,
  Users,
  AlertCircle,
  // CheckCircle,
  Edit,
  Trash2,
  Loader2,
  FolderKanban,
  Tag,
  MessageSquare,
  Paperclip,
  User,
  // X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { taskService } from "@/services/taskService";
import { companyMemberService } from "@/services/companyMemberService";
import { teamService } from "@/services/teamService";
import type { Task } from "@/types/task.types";
import type { CompanyMember } from "@/types/companyMember.ts";
import type { CompanyTeam } from "@/types/companyTeams.ts";
import { TaskStatusBadge, PriorityBadge } from "../components/TaskBadges";
import TaskFormModal from "../components/forms/TaskFormModal";

// Types
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

// Skeleton loading component
const CalendarSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Stats and filters skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Calendar header skeleton */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border-b p-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Day headers skeleton */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 flex items-center justify-center">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Calendar days skeleton */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={i}
                className="min-h-32 border border-gray-100 dark:border-gray-700 p-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: Task["priority"] }) => {
  const colors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${colors[priority]}`} />
      <span className="text-xs text-gray-500 capitalize">{priority}</span>
    </div>
  );
};

// Day cell component
const DayCell = ({
  day,
  onTaskClick,
  onAddTask,
}: {
  day: CalendarDay;
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
}) => {
  return (
    <div
      className={cn(
        "min-h-32 border border-gray-100 dark:border-gray-700 p-2 relative group",
        !day.isCurrentMonth && "bg-gray-50 dark:bg-gray-900/50",
        day.isToday && "bg-blue-50 dark:bg-blue-900/20",
      )}
    >
      {/* Day header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
              day.isToday
                ? "bg-blue-600 text-white"
                : day.isCurrentMonth
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-500",
            )}
          >
            {format(day.date, "d")}
          </span>
          {day.tasks.length > 0 && (
            <span className="text-xs text-gray-500">
              {day.tasks.length} task{day.tasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onAddTask(day.date)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks list */}
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {day.tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onTaskClick(task)}
            className={cn(
              "p-2 rounded-md cursor-pointer transition-all border-l-4",
              "hover:shadow-sm hover:bg-white dark:hover:bg-gray-800",
              task.priority === "high" &&
                "border-l-red-500 bg-red-50/50 dark:bg-red-900/10",
              task.priority === "medium" &&
                "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10",
              task.priority === "low" &&
                "border-l-green-500 bg-green-50/50 dark:bg-green-900/10",
            )}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <PriorityIndicator priority={task.priority} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TaskStatusBadge status={task.status} />
              <span className="text-xs text-gray-500 truncate">
                {task.assignedTo?.fullName?.split(" ")[0] || "Unassigned"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Task detail modal component
const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) => {
  if (!task) return null;

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {task.description || "No description"}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Task Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
              <TaskStatusBadge status={task.status} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Priority
              </h4>
              <PriorityBadge priority={task.priority} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Due Date
              </h4>
              <p className="text-sm">{formatDateShort(task.dueDate)}</p>
            </div>
            {task.project && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Project
                </h4>
                <Badge variant="outline" className="gap-1">
                  <FolderKanban className="h-3 w-3" />
                  {task.project}
                </Badge>
              </div>
            )}
          </div>

          {/* Assignment Details */}
          <div className="space-y-4">
            {task.assignedTo ? (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Assigned To
                </h4>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {task.assignedTo.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.assignedTo.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : task.team ? (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Assigned To Team
                </h4>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{task.team.teamName}</p>
                    <p className="text-xs text-gray-500">Team Assignment</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Assigned To
                </h4>
                <p className="text-sm text-gray-500">Unassigned</p>
              </div>
            )}
            {task.createdAt && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Created At
                </h4>
                <p className="text-sm">{formatDateTime(task.createdAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Attachments and Comments */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {task.attachments.length} attachment
                {task.attachments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {task.comments.length} comment
                {task.comments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              toast.success("Follow-up reminder scheduled");
            }}
          >
            Schedule Follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<{
    status?: Task["status"];
    priority?: Task["priority"];
    assignedTo?: string;
    team?: string;
  }>({});

  // Task Form Modal state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch members and teams
  const fetchFormData = async () => {
    try {
      // Fetch members
      const membersResponse = await companyMemberService.getCompanyMembers({
        limit: 100,
        page: 1,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      setMembers(membersResponse.members);

      // Fetch teams
      const teamsResponse = await teamService.getTeams({
        limit: 100,
        page: 1,
        sortBy: "teamName",
        sortOrder: "asc",
      });
      setTeams(teamsResponse.data.teams);
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Failed to load form data");
    }
  };

  // Fetch tasks for the calendar
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Calculate month start and end dates
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const response = await taskService.getTasks({
        dueDateFrom: monthStart.toISOString(),
        dueDateTo: monthEnd.toISOString(),
        status: filter.status,
        priority: filter.priority,
        assignedTo: filter.assignedTo,
        team: filter.team,
        limit: 100, // Get all tasks for the month
        page: 1,
      });

      setTasks(response.data.tasks);

      // Save to local storage as backup
      taskService.saveTasksToLocalStorage(response.data.tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);

      // Fallback to local storage if API fails
      const localTasks = taskService.getTasksFromLocalStorage();
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const filteredLocalTasks = localTasks.filter((task: Task) => {
        const taskDate = parseISO(task.dueDate);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      setTasks(filteredLocalTasks);

      toast.error("Failed to fetch tasks from server", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
    fetchFormData();
  }, [currentDate, filter]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    await fetchFormData();
    toast.success("Calendar refreshed");
  };

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.assignedTo && task.assignedTo?.id !== filter.assignedTo)
        return false;
      if (filter.team && task.team?.id !== filter.team) return false;
      return true;
    });
  }, [tasks, filter]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((date) => {
      const dayTasks = filteredTasks.filter((task) =>
        isSameDay(parseISO(task.dueDate), date),
      );

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        tasks: dayTasks,
      };
    });
  }, [currentDate, filteredTasks]);

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Task handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setIsSubmitting(true);
      await taskService.deleteTask(id);

      // Remove task from local state
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Task (for TaskFormModal)
  const handleSaveTask = async (data: any, id?: string) => {
    setIsSubmitting(true);

    try {
      if (id) {
        // Update existing task
        const updatedTask = await taskService.updateTask(id, data);

        // Update task in local state
        setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        const newTask = await taskService.createTask(data);

        // Add task to local state
        setTasks([newTask, ...tasks]);
        toast.success("Task created successfully!");
      }

      setIsTaskFormOpen(false);

      // Refresh tasks list to get updated data
      await fetchTasks();
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

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;

    return { total, pending, overdue, completed, inProgress };
  }, [tasks]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Show skeleton while loading
  if (isLoading && tasks.length === 0) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-9xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon className="h-8 w-8" />
                Task Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage all your tasks in a calendar interface
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="flex items-center gap-2"
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsTaskFormOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats and filters */}
          <Card className="mb-6">
            <CardContent className="">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                    <span className="text-sm font-medium">
                      Total: {taskStats.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">
                      Pending: {taskStats.pending}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">
                      In Progress: {taskStats.inProgress}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">
                      Overdue: {taskStats.overdue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">
                      Completed: {taskStats.completed}
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={filter.status || "all"}
                    onValueChange={(value) =>
                      setFilter((prev) => ({
                        ...prev,
                        status:
                          value === "all"
                            ? undefined
                            : (value as Task["status"]),
                      }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.priority || "all"}
                    onValueChange={(value) =>
                      setFilter((prev) => ({
                        ...prev,
                        priority:
                          value === "all"
                            ? undefined
                            : (value as Task["priority"]),
                      }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.assignedTo || "all"}
                    onValueChange={(value) =>
                      setFilter((prev) => ({
                        ...prev,
                        assignedTo: value === "all" ? undefined : value,
                      }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Assigned To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="h-12 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <DayCell
                    key={index}
                    day={day}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legend */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
      />

      {/* Task Form Modal */}
      {isTaskFormOpen && (
        <TaskFormModal
          open={isTaskFormOpen}
          onOpenChange={setIsTaskFormOpen}
          editingTask={editingTask}
          onSave={handleSaveTask}
          isSubmitting={isSubmitting}
          members={members}
          teams={teams}
        />
      )}
    </div>
  );
}
