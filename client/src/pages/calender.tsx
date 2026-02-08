import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
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
  addDays,
} from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  tags?: string[];
  project?: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock data - In production, this would come from your API
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Design Review Meeting",
    description: "Review design mockups for new dashboard",
    dueDate: new Date().toISOString(),
    assignedTo: "john@example.com",
    assignedBy: "admin@example.com",
    status: "pending",
    priority: "high",
    tags: ["design", "meeting"],
    project: "Dashboard Redesign",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
  },
  {
    id: "2",
    title: "API Documentation",
    description: "Write API documentation for new endpoints",
    dueDate: addDays(new Date(), 1).toISOString(),
    assignedTo: "sarah@example.com",
    assignedBy: "tech-lead@example.com",
    status: "in-progress",
    priority: "medium",
    tags: ["backend", "documentation"],
    project: "API v2",
    createdAt: "2024-02-02",
    updatedAt: "2024-02-02",
  },
  {
    id: "3",
    title: "Bug Fix - Login Issue",
    description: "Fix authentication bug on mobile devices",
    dueDate: addDays(new Date(), 2).toISOString(),
    assignedTo: "mike@example.com",
    assignedBy: "qa@example.com",
    status: "completed",
    priority: "high",
    tags: ["bug", "frontend"],
    project: "Mobile App",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-03",
  },
  {
    id: "4",
    title: "Client Presentation",
    description: "Prepare slides for quarterly review",
    dueDate: addDays(new Date(), -1).toISOString(),
    assignedTo: "lisa@example.com",
    assignedBy: "ceo@example.com",
    status: "overdue",
    priority: "high",
    tags: ["client", "presentation"],
    project: "Business Development",
    createdAt: "2024-01-28",
    updatedAt: "2024-02-01",
  },
  {
    id: "5",
    title: "Database Optimization",
    description: "Optimize queries and add indexes",
    dueDate: addDays(new Date(), 5).toISOString(),
    assignedTo: "alex@example.com",
    assignedBy: "dba@example.com",
    status: "pending",
    priority: "medium",
    tags: ["database", "backend"],
    project: "Infrastructure",
    createdAt: "2024-02-03",
    updatedAt: "2024-02-03",
  },
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Sarah Smith", email: "sarah@example.com" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "4", name: "Lisa Wang", email: "lisa@example.com" },
  { id: "5", name: "Alex Brown", email: "alex@example.com" },
];

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

// Task status badge component
const TaskStatusBadge = ({ status }: { status: Task["status"] }) => {
  const variants = {
    pending: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      icon: Clock,
    },
    "in-progress": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-300",
      icon: Clock,
    },
    completed: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
      icon: CheckCircle,
    },
    overdue: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      icon: AlertCircle,
    },
  };

  const { bg, text, icon: Icon } = variants[status];

  return (
    <Badge variant="secondary" className={`${bg} ${text} gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
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
                {task.assignedTo.split("@")[0]}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {task.description}
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
              <PriorityIndicator priority={task.priority} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Due Date
              </h4>
              <p className="text-sm">
                {format(parseISO(task.dueDate), "PPP 'at' p")}
              </p>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Assigned To
              </h4>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{task.assignedTo}</p>
                  <p className="text-xs text-gray-500">Team Member</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Assigned By
              </h4>
              <p className="text-sm">{task.assignedBy}</p>
            </div>
            {task.project && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Project
                </h4>
                <Badge variant="outline">{task.project}</Badge>
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
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              // Trigger Boltic automation for follow-up
              toast.success("Follow-up reminder scheduled via Boltic");
            }}
          >
            Schedule Follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Create/Edit task form component
const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  initialData?: Partial<Task>;
  defaultDate?: Date;
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: defaultDate
      ? format(defaultDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    assignedTo: "",
    priority: "medium" as const,
    status: "pending" as const,
    ...initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update task details"
              : "Add a new task to the calendar"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.email}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<{
    status?: Task["status"];
    priority?: Task["priority"];
    assignedTo?: string;
  }>({});

  // Simulate loading tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In production, this would be an API call
        // const response = await fetch('/api/tasks');
        // const data = await response.json();
        // setTasks(data);

        // For demo, use mock data
        setTasks(MOCK_TASKS);
        setIsLoading(false);
        setIsRefreshing(false);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast.error("Failed to load tasks");
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadTasks();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTasks(MOCK_TASKS);
    setIsRefreshing(false);
    toast.success("Calendar refreshed");
  };

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.assignedTo && task.assignedTo !== filter.assignedTo)
        return false;
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

  const handleAddTask = (date: Date) => {
    setEditingTask({
      dueDate: format(date, "yyyy-MM-dd"),
    });
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task deleted successfully");
  };

  const handleSubmitTask = (taskData: Partial<Task>) => {
    if (editingTask?.id) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData, id: task.id }
            : task,
        ),
      );
      toast.success("Task updated successfully");
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || "Untitled Task",
        description: taskData.description,
        dueDate: taskData.dueDate || new Date().toISOString(),
        assignedTo: taskData.assignedTo || "",
        assignedBy: "me@example.com", // Current user
        status: taskData.status || "pending",
        priority: taskData.priority || "medium",
        tags: taskData.tags,
        project: taskData.project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      toast.success("Task created successfully");

      // Simulate Boltic automation trigger
      setTimeout(() => {
        toast.info("Boltic automation triggered: Task assignment email sent");
      }, 1000);
    }
    setEditingTask(undefined);
  };

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;
    const completed = tasks.filter((t) => t.status === "completed").length;

    return { total, pending, overdue, completed };
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
  if (isLoading) {
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
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats and filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
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
                  >
                    <SelectTrigger className="w-[160px]">
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Assigned To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {MOCK_TEAM_MEMBERS.map((member) => (
                        <SelectItem key={member.id} value={member.email}>
                          {member.name}
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.info("Exporting calendar data via Boltic...");
                      // Simulate Boltic automation for export
                      setTimeout(() => {
                        toast.success("Calendar exported successfully");
                      }, 2000);
                    }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.info("Syncing with Boltic workflows...");
                      // Simulate Boltic sync
                    }}
                  >
                    Sync
                  </Button>
                </div>
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

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
        defaultDate={
          editingTask?.dueDate ? parseISO(editingTask.dueDate) : undefined
        }
      />
    </div>
  );
}
