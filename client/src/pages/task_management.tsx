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
  Users,
  MessageSquare,
  Paperclip,
  Tag,
  FolderKanban,
  Bell,
  AlertCircle,
  // CheckCircle,
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
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parse, isValid, parseISO } from "date-fns";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { useDebounce } from "@/utils/debounce";
import TaskFormModal from "../components/forms/TaskFormModal";
import SendReminderModal from "../components/forms/SendReminderModal";
import { TaskStatusBadge, PriorityBadge } from "../components/TaskBadges";
import { taskService } from "@/services/taskService";
import { reminderService } from "@/services/reminderService";
import { companyMemberService } from "@/services/companyMemberService";
import { teamService } from "@/services/teamService";
import { type Task, type TaskFilters } from "@/types/task.types";
import type { CompanyMember } from "@/types/companyMember.ts";
import type { CompanyTeam } from "@/types/companyTeams.ts";

// Loading skeleton component
const TaskManagementSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-8xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between gap-4">
            <div>
              <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Filter Section Skeleton */}
        <div className="mb-4">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cell) => (
                      <TableCell key={cell}>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Task Management Component
export default function TaskManagement() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    statuses: ["pending", "in-progress", "completed", "overdue", "cancelled"],
    priorities: ["low", "medium", "high"],
    assignedToUsers: [] as any[],
    assignedByUsers: [] as any[],
    teams: [] as any[],
  });

  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForReminder, setTaskForReminder] = useState<Task | null>(null);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    title: "",
    status: "all",
    priority: "all",
    project: "",
    assignedTo: "all",
    assignedBy: "all",
    team: "all",
    dueDateFrom: "",
    dueDateTo: "",
    page: 1,
    limit: 10,
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Local state for immediate input values
  const [searchInput, setSearchInput] = useState<string>("");
  const [titleInput, setTitleInput] = useState<string>("");
  const [projectInput, setProjectInput] = useState<string>("");
  const [dueDateFromInput, setDueDateFromInput] = useState<string>("");
  const [dueDateToInput, setDueDateToInput] = useState<string>("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: "asc" | "desc";
  } | null>({ key: "dueDate", direction: "asc" });

  // Create debounced filter functions
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  }, 300);

  const debouncedSetTitle = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, title: value, page: 1 }));
  }, 300);

  const debouncedSetProject = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, project: value, page: 1 }));
  }, 300);

  // Handle input changes with debounce
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

  // Handle date input changes
  const handleDateChange = (
    field: "dueDateFrom" | "dueDateTo",
    value: string,
  ) => {
    if (field === "dueDateFrom") {
      setDueDateFromInput(value);
    } else {
      setDueDateToInput(value);
    }

    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      setFilters((prev) => ({
        ...prev,
        [field]: parsedDate.toISOString(),
        page: 1,
      }));
    } else if (value === "") {
      setFilters((prev) => ({
        ...prev,
        [field]: undefined,
        page: 1,
      }));
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

  // Calculate days until due date
  const getDaysUntilDue = (dueDate: string) => {
    try {
      const due = parseISO(dueDate);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Fetch members and teams for form
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
      toast.error("Failed to load form data", {
        description: "Using cached data",
      });
    }
  };

  // Fetch tasks from backend
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTasks({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig?.key || "dueDate",
        sortOrder: sortConfig?.direction || "asc",
      });

      setTasks(response.data.tasks);
      setTotalItems(response.data.pagination.totalItems);
      setTotalPages(response.data.pagination.totalPages);

      // Update filter options
      setFilterOptions({
        statuses: response.data.filterOptions.statuses || [],
        priorities: response.data.filterOptions.priorities || [],
        assignedToUsers: response.data.filterOptions.assignedToUsers || [],
        assignedByUsers: response.data.filterOptions.assignedByUsers || [],
        teams: response.data.filterOptions.teams || [],
      });

      // Save to local storage as backup
      taskService.saveTasksToLocalStorage(response.data.tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);

      // Fallback to local storage if API fails
      const localTasks = taskService.getTasksFromLocalStorage();
      setTasks(localTasks.slice(0, itemsPerPage));
      setTotalItems(localTasks.length);
      setTotalPages(Math.ceil(localTasks.length / itemsPerPage));

      toast.error("Failed to fetch tasks from server", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
    fetchFormData();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [
    filters.search,
    filters.title,
    filters.project,
    filters.status,
    filters.priority,
    filters.assignedTo,
    filters.assignedBy,
    filters.team,
    filters.dueDateFrom,
    filters.dueDateTo,
  ]);

  // Handle filter changes for non-text fields
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      title: "",
      status: "all",
      priority: "all",
      project: "",
      assignedTo: "all",
      assignedBy: "all",
      team: "all",
      dueDateFrom: "",
      dueDateTo: "",
      page: 1,
      limit: itemsPerPage,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
    setSearchInput("");
    setTitleInput("");
    setProjectInput("");
    setDueDateFromInput("");
    setDueDateToInput("");
    setSortConfig({ key: "dueDate", direction: "asc" });
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof TaskFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "status" ||
        filterName === "priority" ||
        filterName === "assignedTo" ||
        filterName === "assignedBy" ||
        filterName === "team"
          ? "all"
          : "",
      page: 1,
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
      case "dueDateFrom":
        setDueDateFromInput("");
        break;
      case "dueDateTo":
        setDueDateToInput("");
        break;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
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

    // Update filters
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        sortConfig?.key === key
          ? sortConfig.direction === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  // Calculate start and end index for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle Add Task
  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Handle Edit Task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle Send Reminder
  const handleSendReminder = (task: Task) => {
    setTaskForReminder(task);
    setIsReminderModalOpen(true);
  };

  // Handle Delete Task
  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteOpen(true);
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      try {
        setIsSubmitting(true);
        await taskService.deleteTask(taskToDelete.id);

        // Remove task from local state
        setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
        toast.success("Task deleted successfully!");

        // Refresh tasks list
        fetchTasks();
      } catch (error: any) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task", {
          description: error.message || "Please try again",
        });
      } finally {
        setTaskToDelete(null);
        setDeleteOpen(false);
        setIsSubmitting(false);
      }
    }
  };

  // Handle Save Task
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

      setIsTaskModalOpen(false);

      // Refresh tasks list to get updated data
      fetchTasks();
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

  // Handle Send Manual Reminder
  const handleSendManualReminder = async (taskId: string, message: string) => {
    try {
      setIsSubmitting(true);
      // We need to call the backend with daysThreshold = 0 for immediate reminder
      const response = await reminderService.sendManualReminder({
        taskId,
        daysThreshold: 0, // 0 means immediate reminder
        message,
      });

      toast.success("Reminder sent successfully!", {
        description: `Reminder sent to ${response.data.remindersSent} user(s)`,
      });
      setIsReminderModalOpen(false);
      setTaskForReminder(null);
    } catch (error: any) {
      console.error("Error sending manual reminder:", error);
      toast.error("Failed to send reminder", {
        description: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task status
  // const handleUpdateStatus = async (taskId: string, status: Task["status"]) => {
  //   try {
  //     const newStatus = await taskService.updateTaskStatus(taskId, status);

  //     // Update task in local state
  //     setTasks(
  //       tasks.map((task) =>
  //         task.id === taskId
  //           ? { ...task, status: newStatus as Task["status"] }
  //           : task,
  //       ),
  //     );
  //     toast.success("Task status updated!");
  //   } catch (error: any) {
  //     console.error("Error updating task status:", error);
  //     toast.error("Failed to update status", {
  //       description: error.message || "Please try again",
  //     });
  //   }
  // };

  // Refresh data
  const handleRefresh = () => {
    fetchTasks();
    fetchFormData();
    toast.info("Refreshing task data...");
  };

  // Prepare task data for form
  // const prepareTaskForForm = (task: Task) => {
  //   return {
  //     title: task.title || "",
  //     description: task.description || "",
  //     dueDate: parseISO(task.dueDate),
  //     assignedTo: task.assignedTo?.id || "",
  //     team: task.team?.id || "",
  //     priority: task.priority || "medium",
  //     tags: task.tags || [],
  //     project: task.project || "",
  //     status: task.status || "pending",
  //   };
  // };

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      value !== "all" &&
      key !== "search" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder",
  ).length;

  if (isLoading && tasks.length === 0) {
    return <TaskManagementSkeleton />;
  }

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
                      setFilters((prev) => ({ ...prev, search: "" }));
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

                          {/* Status Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="status"
                              className="text-sm font-medium"
                            >
                              Status
                            </Label>
                            <Select
                              value={filters.status || "all"}
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
                                {filterOptions.statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1).replace("-", " ")}
                                  </SelectItem>
                                ))}
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
                              value={filters.priority || "all"}
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
                                {filterOptions.priorities.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0).toUpperCase() +
                                      priority.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              value={filters.assignedTo || "all"}
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
                                {filterOptions.assignedToUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Team Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="team"
                              className="text-sm font-medium"
                            >
                              Team
                            </Label>
                            <Select
                              value={filters.team || "all"}
                              onValueChange={(value) =>
                                handleFilterChange("team", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="team">
                                <SelectValue placeholder="Select team" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                {filterOptions.teams.map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.teamName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Due Date Range */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Due Date From
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  value={dueDateFromInput}
                                  onChange={(e) =>
                                    handleDateChange(
                                      "dueDateFrom",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="dd/mm/yyyy"
                                  className="pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                              {dueDateFromInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setDueDateFromInput("");
                                    clearFilter("dueDateFrom");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Due Date To
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  value={dueDateToInput}
                                  onChange={(e) =>
                                    handleDateChange(
                                      "dueDateTo",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="dd/mm/yyyy"
                                  className="pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                              {dueDateToInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setDueDateToInput("");
                                    clearFilter("dueDateTo");
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
                  onValueChange={(value) => {
                    const newLimit = Number(value);
                    setItemsPerPage(newLimit);
                    setFilters((prev) => ({
                      ...prev,
                      limit: newLimit,
                      page: 1,
                    }));
                  }}
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
                          Assigned To
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
                          tasks.map((task, index) => {
                            const daysUntilDue = getDaysUntilDue(task.dueDate);
                            const isUrgent =
                              daysUntilDue <= 3 && daysUntilDue >= 0;
                            const isOverdue =
                              daysUntilDue < 0 && task.status !== "completed";

                            return (
                              <motion.tr
                                key={task.id}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                variants={rowVariants}
                                className={`group border-1 hover:bg-secondary/20 ${
                                  isOverdue
                                    ? "bg-red-50/50 dark:bg-red-950/20"
                                    : isUrgent
                                      ? "bg-orange-50/50 dark:bg-orange-950/20"
                                      : ""
                                }`}
                                layout
                                transition={{
                                  layout: { duration: 0.3 },
                                }}
                              >
                                <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-10 w-10 rounded-md flex items-center justify-center ${
                                        isOverdue
                                          ? "bg-red-100 text-red-600"
                                          : isUrgent
                                            ? "bg-orange-100 text-orange-600"
                                            : "bg-secondary text-muted-foreground"
                                      }`}
                                    >
                                      <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {task.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {task.project && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <FolderKanban className="h-3 w-3 mr-1" />
                                            {task.project}
                                          </Badge>
                                        )}
                                        {task.tags.length > 0 && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <Tag className="h-3 w-3 mr-1" />
                                            {task.tags[0]}
                                            {task.tags.length > 1 &&
                                              ` +${task.tags.length - 1}`}
                                          </Badge>
                                        )}
                                        {isOverdue && (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs"
                                          >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Overdue
                                          </Badge>
                                        )}
                                        {isUrgent && !isOverdue && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs border-orange-300 text-orange-600"
                                          >
                                            <Clock className="h-3 w-3 mr-1" />
                                            {daysUntilDue === 0
                                              ? "Due today"
                                              : daysUntilDue === 1
                                                ? "Due tomorrow"
                                                : `Due in ${daysUntilDue} days`}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="group-hover:bg-secondary/30 cursor-pointer max-w-xs">
                                  <div className="line-clamp-2 text-sm">
                                    {task.description || "No description"}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    {task.comments.length > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {task.comments.length}
                                      </Badge>
                                    )}
                                    {task.attachments.length > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Paperclip className="h-3 w-3 mr-1" />
                                        {task.attachments.length}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                  <div className="space-y-1">
                                    {task.assignedTo ? (
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm font-medium">
                                            {task.assignedTo.fullName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {task.assignedTo.email}
                                          </p>
                                        </div>
                                      </div>
                                    ) : task.team ? (
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm font-medium">
                                            {task.team.teamName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Team Assignment
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        Unassigned
                                      </div>
                                    )}
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
                                    {daysUntilDue >= 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {daysUntilDue === 0
                                          ? "Today"
                                          : daysUntilDue === 1
                                            ? "1 day"
                                            : `${daysUntilDue} days`}
                                      </Badge>
                                    )}
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
                                      disabled={isLoading || isSubmitting}
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSendReminder(task)}
                                      className="h-8 w-8 hover:bg-green-100"
                                      disabled={
                                        isLoading ||
                                        isSubmitting ||
                                        task.status === "completed" ||
                                        task.status === "cancelled"
                                      }
                                      title="Send Reminder"
                                    >
                                      <Bell className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => confirmDeleteTask(task)}
                                      className="h-8 w-8 hover:bg-red-100"
                                      disabled={
                                        isLoading ||
                                        isSubmitting ||
                                        task.status === "cancelled"
                                      }
                                      title="Delete Task"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            );
                          })
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
      // Update the modal call in TaskManagement:
      {isReminderModalOpen && taskForReminder && (
        <SendReminderModal
          open={isReminderModalOpen}
          onOpenChange={setIsReminderModalOpen}
          task={taskForReminder}
          onSend={handleSendManualReminder}
          isSubmitting={isSubmitting}
        />
      )}
      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Task"
        subText={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This action will mark the task as deleted and cannot be undone.`
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
