import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Filter,
  Search,
  X,
  Calendar,
  Plus,
  Clock,
  User,
  Edit,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CustomPagination } from "@/components/custom_ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parse, isValid, parseISO } from "date-fns";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "../components/FramerVariants";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { useDebounce } from "@/utils/debounce";
import TaskFormModal from "../components/forms/TaskFormModal";
import { type Task, type TeamMember } from "../types/task.types";
import { TaskStatusBadge, PriorityBadge } from "../components/TaskBadges";

// Mock data
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

// Main Task Management Component
export default function TaskManagement() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    title: "",
    assignedTo: "all" as string | "all",
    status: "all" as "all" | Task["status"],
    priority: "all" as "all" | Task["priority"],
    project: "",
    dueDate: undefined as Date | undefined,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Local state for immediate input values (before debounce)
  const [searchInput, setSearchInput] = useState<string>("");
  const [titleInput, setTitleInput] = useState<string>("");
  const [projectInput, setProjectInput] = useState<string>("");
  const [dueDateInput, setDueDateInput] = useState<string>("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: "asc" | "desc";
  } | null>(null);

  // Create debounced filter functions
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 300);

  const debouncedSetTitle = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, title: value }));
  }, 300);

  const debouncedSetProject = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, project: value }));
  }, 300);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleTitleChange = (value: string) => {
    setTitleInput(value);
    debouncedSetTitle(value);
  };

  const handleProjectChange = (value: string) => {
    setProjectInput(value);
    debouncedSetProject(value);
  };

  // Handle due date input change
  const handleDueDateInputChange = (value: string) => {
    setDueDateInput(value);
    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      setFilters((prev) => ({ ...prev, dueDate: parsedDate }));
    } else if (value === "") {
      setFilters((prev) => ({ ...prev, dueDate: undefined }));
    }
  };

  // Handle calendar selection for due date
  const handleDueDateSelect = (date: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dueDate: date }));
    if (date) {
      setDueDateInput(format(date, "dd/MM/yyyy"));
    } else {
      setDueDateInput("");
    }
  };

  // Format date for display
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

  // Format date for short display
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

  // Fetch tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredTasks = [...MOCK_TASKS];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower) ||
            task.project?.toLowerCase().includes(searchLower) ||
            task.assignedTo.toLowerCase().includes(searchLower),
        );
      }

      if (filters.title) {
        filteredTasks = filteredTasks.filter((task) =>
          task.title.toLowerCase().includes(filters.title.toLowerCase()),
        );
      }

      if (filters.project) {
        filteredTasks = filteredTasks.filter((task) =>
          task.project?.toLowerCase().includes(filters.project.toLowerCase()),
        );
      }

      if (filters.assignedTo !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.assignedTo === filters.assignedTo,
        );
      }

      if (filters.status !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === filters.status,
        );
      }

      if (filters.priority !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === filters.priority,
        );
      }

      if (filters.dueDate) {
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = parseISO(task.dueDate);
          return (
            taskDate.getDate() === filters.dueDate?.getDate() &&
            taskDate.getMonth() === filters.dueDate?.getMonth() &&
            taskDate.getFullYear() === filters.dueDate?.getFullYear()
          );
        });
      }

      // Apply sorting
      if (sortConfig) {
        filteredTasks.sort((a, b) => {
          let aValue: any = a[sortConfig.key];
          let bValue: any = b[sortConfig.key];

          // Handle dates
          if (
            sortConfig.key === "dueDate" ||
            sortConfig.key === "createdAt" ||
            sortConfig.key === "updatedAt"
          ) {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      // Pagination calculations
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

      setTasks(paginatedTasks);
      setTotalItems(filteredTasks.length);
      setTotalPages(Math.ceil(filteredTasks.length / itemsPerPage));
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks", {
        description: "Please try again later",
      });
      setTasks([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.search,
    filters.title,
    filters.project,
    filters.assignedTo,
    filters.status,
    filters.priority,
    filters.dueDate,
    itemsPerPage,
  ]);

  // Handle filter changes for non-text fields
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      title: "",
      assignedTo: "all",
      status: "all",
      priority: "all",
      project: "",
      dueDate: undefined,
    });
    setSearchInput("");
    setTitleInput("");
    setProjectInput("");
    setDueDateInput("");
    setSortConfig(null);
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "assignedTo" ||
        filterName === "status" ||
        filterName === "priority"
          ? "all"
          : filterName === "dueDate"
            ? undefined
            : "",
    }));

    // Clear corresponding input state
    switch (filterName) {
      case "search":
        setSearchInput("");
        break;
      case "title":
        setTitleInput("");
        break;
      case "project":
        setProjectInput("");
        break;
      case "dueDate":
        setDueDateInput("");
        break;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort
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

  // Calculate start and end index for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle Add Task
  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Handle Edit Task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Handle Delete Task
  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteOpen(true);
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      try {
        // In a real app, call API here
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
        toast.success("Task deleted successfully!");
      } catch (error: any) {
        toast.error("Failed to delete task", {
          description: "Please try again",
        });
      } finally {
        setTaskToDelete(null);
        setDeleteOpen(false);
      }
    }
  };

  // Handle Save Task
  const handleSaveTask = async (data: any, id?: string) => {
    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (id) {
        // Update existing task
        const updatedTask: Task = {
          id,
          ...data,
          dueDate: data.dueDate
            ? data.dueDate.toISOString()
            : new Date().toISOString(),
          assignedBy: "admin@example.com",
          createdAt: editingTask?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
        toast.success("Task updated successfully!");
      } else {
        // Add new task
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...data,
          dueDate: data.dueDate
            ? data.dueDate.toISOString()
            : new Date().toISOString(),
          assignedBy: "admin@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTasks([newTask, ...tasks]);
        toast.success("Task created successfully!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task", {
        description: "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchTasks();
    toast.info("Refreshing task data...");
  };

  // Active filters count
  const activeFiltersCount =
    Object.entries(filters).filter(
      ([key, value]) =>
        value &&
        value !== "all" &&
        !(value instanceof Date) &&
        key !== "search",
    ).length + (filters.dueDate ? 1 : 0);

  return (
    <>
      <motion.div
        className="min-h-screen bg-background p-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex flex-col gap-6 mb-6 w-full"
            variants={headerVariants}
          >
            <div className="flex justify-between gap-4">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-heading">
                  Task Management
                </h1>
                <motion.p
                  className="text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Manage and track all your tasks in one place
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.div
                className="relative w-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Search className="absolute left-3 top-6 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks by title, description, assignee, or project..."
                  className="pl-10 py-6 text-base"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => {
                      setSearchInput("");
                      handleFilterChange("search", "");
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="flex flex-wrap items-center gap-3">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </motion.div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleAddTask}
                    className="gap-2 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div className="mb-2" variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="">
                <div className="flex flex-col gap-4">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Filters</h3>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount} active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 text-muted-foreground"
                          disabled={isLoading}
                        >
                          Clear all
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-8"
                        disabled={isLoading}
                      >
                        {showFilters ? "Hide" : "Show"} Filters
                      </Button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                          {/* Title Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="title"
                              className="text-sm font-medium"
                            >
                              Title
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="title"
                                placeholder="Enter task title"
                                value={titleInput}
                                onChange={(e) =>
                                  handleTitleChange(e.target.value)
                                }
                                className="flex-1"
                              />
                              {titleInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setTitleInput("");
                                    clearFilter("title");
                                  }}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Project Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="project"
                              className="text-sm font-medium"
                            >
                              Project
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="project"
                                placeholder="Enter project name"
                                value={projectInput}
                                onChange={(e) =>
                                  handleProjectChange(e.target.value)
                                }
                                className="flex-1"
                              />
                              {projectInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setProjectInput("");
                                    clearFilter("project");
                                  }}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Assignee Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="assignedTo"
                              className="text-sm font-medium"
                            >
                              Assignee
                            </Label>
                            <Select
                              value={filters.assignedTo}
                              onValueChange={(value) =>
                                handleFilterChange("assignedTo", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="assignedTo">
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Assignees
                                </SelectItem>
                                {MOCK_TEAM_MEMBERS.map((member) => (
                                  <SelectItem
                                    key={member.id}
                                    value={member.email}
                                  >
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Status Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="status"
                              className="text-sm font-medium"
                            >
                              Status
                            </Label>
                            <Select
                              value={filters.status}
                              onValueChange={(value) =>
                                handleFilterChange("status", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Priority Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="priority"
                              className="text-sm font-medium"
                            >
                              Priority
                            </Label>
                            <Select
                              value={filters.priority}
                              onValueChange={(value) =>
                                handleFilterChange("priority", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Priority
                                </SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Due Date */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Due Date
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  value={dueDateInput}
                                  onChange={(e) =>
                                    handleDueDateInputChange(e.target.value)
                                  }
                                  placeholder="dd/mm/yyyy or select"
                                  className="pr-10"
                                />
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                                    >
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="end"
                                  >
                                    <CalendarComponent
                                      mode="single"
                                      selected={filters.dueDate}
                                      onSelect={handleDueDateSelect}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              {dueDateInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setDueDateInput("");
                                    clearFilter("dueDate");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="flex justify-between items-center mb-4"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {totalItems} tasks
              {activeFiltersCount > 0 && " (filtered)"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Items per page:
                </div>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Tasks Table */}
          <motion.div variants={itemVariants}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          <div className="flex items-center gap-1">
                            Title
                            {sortConfig?.key === "title" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="font-semibold">
                          Assigned Members
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("priority")}
                        >
                          <div className="flex items-center gap-1">
                            Priority
                            {sortConfig?.key === "priority" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("dueDate")}
                        >
                          <div className="flex items-center gap-1">
                            Due Date
                            {sortConfig?.key === "dueDate" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Created & Updated
                            {sortConfig?.key === "createdAt" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.tr
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell
                              colSpan={8}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">
                                  Loading tasks...
                                </p>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ) : tasks.length === 0 ? (
                          <motion.tr
                            key="no-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <motion.div
                                className="flex flex-col items-center justify-center"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <p>No tasks found matching your filters.</p>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="link"
                                    onClick={clearFilters}
                                    className="mt-2"
                                  >
                                    Clear all filters
                                  </Button>
                                </motion.div>
                              </motion.div>
                            </TableCell>
                          </motion.tr>
                        ) : (
                          tasks.map((task, index) => (
                            <motion.tr
                              key={task.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              variants={rowVariants}
                              className="group border-1"
                              layout
                              transition={{
                                layout: { duration: 0.3 },
                              }}
                            >
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{task.title}</p>
                                    {task.project && (
                                      <p className="text-xs text-muted-foreground">
                                        {task.project}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer max-w-xs">
                                <div className="line-clamp-2 text-sm">
                                  {task.description || "No description"}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {MOCK_TEAM_MEMBERS.find(
                                      (m) => m.email === task.assignedTo,
                                    )?.name || task.assignedTo}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <PriorityBadge priority={task.priority} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatDateShort(task.dueDate)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <TaskStatusBadge status={task.status} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium text-green-400">
                                      Created:
                                    </span>
                                    <p className="text-xs text-muted-foreground ml-1">
                                      {formatDateTime(task.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium text-orange-400">
                                      Updated:
                                    </span>
                                    <p className="text-xs text-muted-foreground ml-1">
                                      {formatDateTime(task.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTask(task)}
                                    className="h-8 w-8 hover:bg-blue-100"
                                    disabled={isLoading}
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDeleteTask(task)}
                                    className="h-8 w-8 hover:bg-red-100"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom Pagination */}
          {!isLoading && tasks.length > 0 && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Task Form Modal */}
      <TaskFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingTask={editingTask}
        onSave={handleSaveTask}
        isSubmitting={isSubmitting}
        teamMembers={MOCK_TEAM_MEMBERS}
      />

      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Task"
        subText={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        nextButtonText="Delete"
        cancelButtonText="Cancel"
        onNext={handleDeleteTask}
        variant="destructive"
        showCancel={true}
        className="sm:max-w-[425px]"
      />
    </>
  );
}
