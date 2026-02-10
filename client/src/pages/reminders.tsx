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
  Bell,
  CheckCircle,
  Search,
  X,
  Clock,
  User,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  Calendar,
  MoreVertical,
  FolderKanban,
  // Users,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { reminderService } from "@/services/reminderService";
import type {
  Reminder,
  ReminderFilters,
  ReminderType,
  ReminderPriority,
  ReminderStatus,
  // Sender,
} from "@/types/reminder.types";

// Loading skeleton component
const RemindersSkeleton = () => {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
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
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
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

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: ReminderPriority }) => {
  const priorityConfig = {
    high: {
      label: "High",
      className:
        "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200",
    },
    medium: {
      label: "Medium",
      className:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
    },
    low: {
      label: "Low",
      className:
        "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge className={`${config.className} font-medium`}>{config.label}</Badge>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: ReminderStatus }) => {
  const statusConfig = {
    unread: {
      label: "Unread",
      className:
        "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200",
    },
    read: {
      label: "Read",
      className:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200",
    },
    dismissed: {
      label: "Dismissed",
      className:
        "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200",
    },
  };

  const config = statusConfig[status] || statusConfig.unread;

  return (
    <Badge className={`${config.className} font-medium`}>{config.label}</Badge>
  );
};

// Type Badge Component
const TypeBadge = ({ type }: { type: ReminderType }) => {
  const typeConfig: Record<
    ReminderType,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    task: {
      label: "Task",
      icon: <Clock className="h-3 w-3 mr-1" />,
      className:
        "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200",
    },
    meeting: {
      label: "Meeting",
      icon: <Calendar className="h-3 w-3 mr-1" />,
      className:
        "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200",
    },
    deadline: {
      label: "Deadline",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      className:
        "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200",
    },
    notification: {
      label: "Notification",
      icon: <Bell className="h-3 w-3 mr-1" />,
      className:
        "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200",
    },
    system: {
      label: "System",
      icon: <MessageSquare className="h-3 w-3 mr-1" />,
      className:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200",
    },
    project: {
      label: "Project",
      icon: <FolderKanban className="h-3 w-3 mr-1" />,
      className:
        "bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-200",
    },
  };

  const config = typeConfig[type] || {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: <Bell className="h-3 w-3 mr-1" />,
    className:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <Badge className={`${config.className} font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

// Main Reminders Component
export default function Reminders() {
  // State for reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ReminderFilters>({
    search: "",
    type: "all",
    priority: "all",
    status: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Reminder;
    direction: "asc" | "desc";
  } | null>({ key: "createdAt", direction: "desc" });

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(
    null,
  );

  // Local state for search input
  const [searchInput, setSearchInput] = useState<string>("");

  // Filter options
  const [filterOptions] = useState({
    types: ["task", "meeting", "deadline", "notification", "system", "project"],
    priorities: ["low", "medium", "high"],
    statuses: ["unread", "read", "dismissed"],
  });

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "No due date";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Fetch reminders from backend
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const response = await reminderService.getReminders({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig?.key || "createdAt",
        sortOrder: sortConfig?.direction || "desc",
      });

      setReminders(response.data.reminders);
      setStatistics(response.data.statistics);
      setTotalItems(response.data.pagination.totalItems);
      setTotalPages(response.data.pagination.totalPages);

      // Save to local storage as backup
      reminderService.saveRemindersToLocalStorage(response.data.reminders);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);

      // Fallback to local storage if API fails
      const localReminders = reminderService.getRemindersFromLocalStorage();
      setReminders(localReminders.slice(0, itemsPerPage));
      setTotalItems(localReminders.length);
      setTotalPages(Math.ceil(localReminders.length / itemsPerPage));

      toast.error("Failed to fetch reminders from server", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Update pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [
    filters.search,
    filters.type,
    filters.priority,
    filters.status,
    filters.startDate,
    filters.endDate,
  ]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      priority: "all",
      status: "all",
      page: 1,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(1);
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof ReminderFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "type" ||
        filterName === "priority" ||
        filterName === "status"
          ? "all"
          : "",
      page: 1,
    }));
    setCurrentPage(1);

    if (filterName === "search") {
      setSearchInput("");
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort
  const handleSort = (key: keyof Reminder) => {
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

  // Handle Mark as Read
  const handleMarkAsRead = async (reminderId: string) => {
    setIsSubmitting(true);
    try {
      await reminderService.markAsRead(reminderId);

      // Update local state
      setReminders(
        reminders.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, status: "read", readAt: new Date().toISOString() }
            : reminder,
        ),
      );

      // Update statistics
      setStatistics((prev) => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1,
      }));

      toast.success("Reminder marked as read!");
    } catch (error: any) {
      console.error("Error marking reminder as read:", error);
      toast.error("Failed to mark reminder as read", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Mark as Unread
  const handleMarkAsUnread = async (reminderId: string) => {
    setIsSubmitting(true);
    try {
      // Since backend doesn't have mark as unread, we'll simulate it
      const reminder = reminders.find((r) => r.id === reminderId);
      if (reminder) {
        // Update local state
        setReminders(
          reminders.map((reminder) =>
            reminder.id === reminderId
              ? { ...reminder, status: "unread", readAt: undefined }
              : reminder,
          ),
        );

        // Update statistics
        setStatistics((prev) => ({
          ...prev,
          unread: prev.unread + 1,
          read: prev.read - 1,
        }));

        toast.success("Reminder marked as unread!");
      }
    } catch (error: any) {
      console.error("Error marking reminder as unread:", error);
      toast.error("Failed to mark reminder as unread", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Dismiss Reminder
  const handleDismiss = async (reminderId: string) => {
    setIsSubmitting(true);
    try {
      await reminderService.dismissReminder(reminderId);

      // Update local state
      setReminders(
        reminders.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                status: "dismissed",
                dismissedAt: new Date().toISOString(),
              }
            : reminder,
        ),
      );

      // Update statistics
      const reminder = reminders.find((r) => r.id === reminderId);
      if (reminder?.status === "unread") {
        setStatistics((prev) => ({
          ...prev,
          unread: prev.unread - 1,
        }));
      } else if (reminder?.status === "read") {
        setStatistics((prev) => ({
          ...prev,
          read: prev.read - 1,
        }));
      }

      toast.success("Reminder dismissed!");
    } catch (error: any) {
      console.error("Error dismissing reminder:", error);
      toast.error("Failed to dismiss reminder", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Reminder
  const confirmDeleteReminder = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setDeleteOpen(true);
  };

  const handleDeleteReminder = async () => {
    if (reminderToDelete) {
      setIsSubmitting(true);
      try {
        await reminderService.deleteReminder(reminderToDelete.id);

        // Update local state
        setReminders(
          reminders.filter((reminder) => reminder.id !== reminderToDelete.id),
        );

        // Update statistics
        const status = reminderToDelete.status;
        setStatistics((prev) => ({
          ...prev,
          total: prev.total - 1,
          [status]: prev[status as keyof typeof statistics] - 1,
        }));

        toast.success("Reminder deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting reminder:", error);
        toast.error("Failed to delete reminder", {
          description: error.message || "Please try again",
        });
      } finally {
        setReminderToDelete(null);
        setDeleteOpen(false);
        setIsSubmitting(false);
      }
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchReminders();
    toast.info("Refreshing reminders...");
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true);
    try {
      // Get all unread reminders
      const unreadReminders = reminders.filter((r) => r.status === "unread");

      // Mark each as read
      for (const reminder of unreadReminders) {
        try {
          await reminderService.markAsRead(reminder.id);
        } catch (error) {
          console.error(
            `Error marking reminder ${reminder.id} as read:`,
            error,
          );
        }
      }

      // Update all reminders locally
      setReminders(
        reminders.map((reminder) =>
          reminder.status === "unread"
            ? { ...reminder, status: "read", readAt: new Date().toISOString() }
            : reminder,
        ),
      );

      // Update statistics
      setStatistics((prev) => ({
        ...prev,
        unread: 0,
        read: prev.read + unreadReminders.length,
      }));

      toast.success("All reminders marked as read!");
    } catch (error: any) {
      console.error("Error marking all reminders as read:", error);
      toast.error("Failed to mark all reminders as read", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unread count
  const unreadCount = statistics.unread;

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      value !== "all" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder",
  ).length;

  if (isLoading && reminders.length === 0) {
    return <RemindersSkeleton />;
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
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-heading">
                      Reminders
                    </h1>
                    <motion.p
                      className="text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Manage your notifications and reminders
                      {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <motion.div
                className="relative w-80"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Search className="absolute left-3 top-6 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reminders..."
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
                      clearFilter("search");
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="flex flex-wrap items-center gap-3">
                {unreadCount > 0 && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleMarkAllAsRead}
                      disabled={isLoading || isSubmitting}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark All Read
                    </Button>
                  </motion.div>
                )}

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

                {activeFiltersCount > 0 && (
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={clearFilters}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Simple Filters */}
          <motion.div className="mb-6" variants={itemVariants}>
            <Card>
              <CardContent className="">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type
                    </Label>
                    <Select
                      value={filters.type || "all"}
                      onValueChange={(value) =>
                        handleFilterChange("type", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {filterOptions.types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
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
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {filterOptions.priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
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
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {filterOptions.statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
              Showing {startIndex} to {endIndex} of {totalItems} reminders
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
                    setCurrentPage(1);
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

          {/* Reminders Table */}
          <motion.div variants={itemVariants}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="">
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          <div className="flex items-center gap-1">
                            Reminder
                            {sortConfig?.key === "title" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">From</TableHead>
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
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Created
                            {sortConfig?.key === "createdAt" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
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
                                  Loading reminders...
                                </p>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ) : reminders.length === 0 ? (
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
                                <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <p>No reminders found.</p>
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
                          reminders.map((reminder, index) => (
                            <motion.tr
                              key={reminder.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              variants={rowVariants}
                              className={`group border-1 hover:bg-secondary/20 ${
                                reminder.status === "unread"
                                  ? "bg-blue-50/50 dark:bg-blue-950/20"
                                  : ""
                              }`}
                              layout
                              transition={{
                                layout: { duration: 0.3 },
                              }}
                            >
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-md flex items-center justify-center ${
                                      reminder.status === "unread"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                  >
                                    <Bell className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p
                                      className={`font-medium ${reminder.status === "unread" ? "text-primary" : ""}`}
                                    >
                                      {reminder.title}
                                      {reminder.status === "unread" && (
                                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                      )}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {reminder.description}
                                    </p>
                                    {reminder.metadata?.taskTitle && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Task: {reminder.metadata.taskTitle}
                                      </p>
                                    )}
                                    {reminder.metadata?.projectName && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Project: {reminder.metadata.projectName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <TypeBadge type={reminder.type} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {reminder.sender?.avatar ? (
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                      <img
                                        src={reminder.sender.avatar}
                                        alt={reminder.sender.fullName}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                      <User className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">
                                      {reminder.sender?.fullName || "System"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {reminder.sender?.role || "Automated"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <PriorityBadge priority={reminder.priority} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatDateShort(reminder.dueDate || "")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="text-sm">
                                  {formatDateTime(reminder.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <StatusBadge status={reminder.status} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 text-right">
                                <div className="flex justify-end gap-2">
                                  {reminder.status === "unread" ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleMarkAsRead(reminder.id)
                                      }
                                      className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                                      disabled={isSubmitting}
                                      title="Mark as read"
                                    >
                                      <Eye className="h-4 w-4 text-green-600" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleMarkAsUnread(reminder.id)
                                      }
                                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                      disabled={isSubmitting}
                                      title="Mark as unread"
                                    >
                                      <EyeOff className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  )}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={isSubmitting}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDismiss(reminder.id)
                                        }
                                        className="cursor-pointer"
                                        disabled={isSubmitting}
                                      >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Dismiss
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          confirmDeleteReminder(reminder)
                                        }
                                        className="cursor-pointer text-red-600"
                                        disabled={isSubmitting}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
          {!isLoading && reminders.length > 0 && totalPages > 1 && (
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

      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Reminder"
        subText={
          reminderToDelete
            ? `Are you sure you want to delete "${reminderToDelete.title}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        nextButtonText="Delete"
        cancelButtonText="Cancel"
        onNext={handleDeleteReminder}
        variant="destructive"
        showCancel={true}
        className="sm:max-w-[425px]"
      />
    </>
  );
}
