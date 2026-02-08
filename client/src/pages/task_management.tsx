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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
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
  Calendar,
  Tag,
  User,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CustomPagination } from "@/components/custom_ui/CustomPagination";

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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock data - In production, this would come from your API
const MOCK_TASKS: Task[] = Array.from({ length: 45 }, (_, i) => ({
  id: `task-${i + 1}`,
  title: `Task ${i + 1}`,
  description: `Description for task ${i + 1}`,
  dueDate: new Date(
    Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
  ).toISOString(),
  assignedTo: [
    "john@example.com",
    "sarah@example.com",
    "mike@example.com",
    "lisa@example.com",
    "alex@example.com",
  ][Math.floor(Math.random() * 5)],
  assignedBy: "admin@example.com",
  status: ["pending", "in-progress", "completed", "overdue"][
    Math.floor(Math.random() * 4)
  ] as Task["status"],
  priority: ["low", "medium", "high"][
    Math.floor(Math.random() * 3)
  ] as Task["priority"],
  tags: ["design", "development", "bug", "feature", "documentation"][
    Math.floor(Math.random() * 5)
  ]
    ? ["design"]
    : [],
  project: [
    "Dashboard Redesign",
    "API v2",
    "Mobile App",
    "Business Development",
    "Infrastructure",
  ][Math.floor(Math.random() * 5)],
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
  ).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Sarah Smith", email: "sarah@example.com" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "4", name: "Lisa Wang", email: "lisa@example.com" },
  { id: "5", name: "Alex Brown", email: "alex@example.com" },
];

// Constants
const ITEMS_PER_PAGE = 10;

// Skeleton loading component
const TaskManagementSkeleton = () => {
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
                className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Filters Skeleton */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <TableHead key={i}>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              ></div>
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

// Priority badge component
const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variants = {
    low: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
    },
    medium: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
    },
    high: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
    },
  };

  const { bg, text } = variants[priority];

  return (
    <Badge variant="secondary" className={`${bg} ${text}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
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
              <PriorityBadge priority={task.priority} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Due Date
              </h4>
              <p className="text-sm">{format(parseISO(task.dueDate), "PPP")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Created At
              </h4>
              <p className="text-sm">
                {format(parseISO(task.createdAt), "PPP")}
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
                  <User className="h-4 w-4" />
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
                  <Tag className="h-3 w-3 mr-1" />
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  initialData?: Partial<Task>;
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
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
              : "Add a new task to the system"}
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

          {formData.project && (
            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
              />
            </div>
          )}

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

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: "asc" | "desc";
  } | null>(null);

  // Filters
  const [filters, setFilters] = useState<{
    status?: Task["status"];
    priority?: Task["priority"];
    assignedTo?: string;
  }>({});

  // Simulate loading tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

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
    toast.success("Tasks refreshed");
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query) ||
          task.project?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter((task) => task.priority === filters.priority);
    }

    // Apply assignedTo filter
    if (filters.assignedTo) {
      result = result.filter((task) => task.assignedTo === filters.assignedTo);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number | string[] | undefined = a[sortConfig.key];
        let bValue: string | number | string[] | undefined = b[sortConfig.key];

        // Handle dates
        if (
          sortConfig.key === "dueDate" ||
          sortConfig.key === "createdAt" ||
          sortConfig.key === "updatedAt"
        ) {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [tasks, searchQuery, filters, sortConfig]);

  // Paginate tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTasks.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredAndSortedTasks, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / ITEMS_PER_PAGE);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => t.status === "overdue").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;

    return { total, pending, overdue, completed, inProgress };
  }, [tasks]);

  // Task handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
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
      setTasks([newTask, ...tasks]);
      toast.success("Task created successfully");

      // Simulate Boltic automation trigger
      setTimeout(() => {
        toast.info("Boltic automation triggered: Task assignment email sent");
      }, 1000);
    }
    setEditingTask(undefined);
  };

  const handleSort = (key: keyof Task) => {
    setSortConfig((current) => {
      if (current && current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        key,
        direction: "asc",
      };
    });
  };

  const handleExportTasks = () => {
    toast.info("Exporting tasks via Boltic...");
    // Simulate Boltic automation for export
    setTimeout(() => {
      toast.success("Tasks exported successfully");
    }, 2000);
  };

  const handleImportTasks = () => {
    toast.info("Importing tasks via Boltic...");
    // Simulate Boltic automation for import
    setTimeout(() => {
      toast.success("Tasks imported successfully");
    }, 2000);
  };

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
    return <TaskManagementSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Task Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track all your tasks in one place
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
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
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
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks by title, description, assignee, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status:
                          value === "all"
                            ? undefined
                            : (value as Task["status"]),
                      }))
                    }
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select
                    value={filters.priority || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority:
                          value === "all"
                            ? undefined
                            : (value as Task["priority"]),
                      }))
                    }
                  >
                    <SelectTrigger id="priority-filter">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignee-filter">Assignee</Label>
                  <Select
                    value={filters.assignedTo || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        assignedTo: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger id="assignee-filter">
                      <SelectValue placeholder="All Assignees" />
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

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({})}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Table */}
        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription>
                    Showing {paginatedTasks.length} of{" "}
                    {filteredAndSortedTasks.length} tasks
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select
                    value={sortConfig?.key || "dueDate"}
                    onValueChange={(value) => handleSort(value as keyof Task)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="createdAt">Created At</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("title")}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Title
                          {sortConfig?.key === "title" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("assignedTo")}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Assigned To
                          {sortConfig?.key === "assignedTo" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("dueDate")}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Due Date
                          {sortConfig?.key === "dueDate" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No tasks found. Try adjusting your filters or create a
                          new task.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          onClick={() => handleTaskClick(task)}
                        >
                          <TableCell>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <span>{task.assignedTo.split("@")[0]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {format(parseISO(task.dueDate), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TaskStatusBadge status={task.status} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={task.priority} />
                          </TableCell>
                          <TableCell>
                            {task.project ? (
                              <Badge variant="outline">{task.project}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants}>
            <div className="flex justify-center">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </motion.div>
        )}
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
      />
    </div>
  );
}
