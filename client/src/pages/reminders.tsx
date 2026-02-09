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
  Users,
  Target,
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
import { format } from "date-fns";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";

// Types
type ReminderPriority = "low" | "medium" | "high";
type ReminderStatus = "unread" | "read" | "dismissed";
type ReminderType =
  | "task"
  | "meeting"
  | "deadline"
  | "notification"
  | "system"
  | "project";

interface Sender {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface ReminderMetadata {
  taskId?: string;
  taskTitle?: string;
  meetingId?: string;
  meetingTitle?: string;
  projectId?: string;
  projectName?: string;
  url?: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: ReminderType;
  priority: ReminderPriority;
  status: ReminderStatus;
  sender?: Sender;
  dueDate?: string;
  readAt?: string;
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: ReminderMetadata;
}

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

// Dummy data
const DUMMY_REMINDERS: Reminder[] = [
  {
    id: "1",
    title: "Project Deadline Approaching",
    description:
      "The 'Website Redesign' project deadline is in 2 days. Please ensure all tasks are completed.",
    type: "project",
    priority: "high",
    status: "unread",
    sender: {
      id: "101",
      fullName: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "Project Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    metadata: {
      projectId: "proj-001",
      projectName: "Website Redesign",
      url: "/projects/proj-001",
    },
  },
  {
    id: "2",
    title: "Team Meeting Today",
    description: "Weekly team sync meeting at 2:00 PM in Conference Room A",
    type: "meeting",
    priority: "medium",
    status: "unread",
    sender: {
      id: "102",
      fullName: "Michael Chen",
      email: "michael.c@example.com",
      role: "Team Lead",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: {
      meetingId: "meet-001",
      meetingTitle: "Weekly Team Sync",
      url: "/meetings/meet-001",
    },
  },
  {
    id: "3",
    title: "Task Review Required",
    description:
      "Please review the pending tasks assigned to you and update their status",
    type: "task",
    priority: "medium",
    status: "read",
    sender: {
      id: "103",
      fullName: "Alex Rodriguez",
      email: "alex.r@example.com",
      role: "Senior Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: {
      taskId: "task-001",
      taskTitle: "Dashboard Implementation",
      url: "/tasks/task-001",
    },
  },
  {
    id: "4",
    title: "System Maintenance Notification",
    description:
      "Scheduled system maintenance this Saturday from 10:00 PM to 2:00 AM",
    type: "system",
    priority: "low",
    status: "read",
    sender: {
      id: "104",
      fullName: "System Admin",
      email: "admin@example.com",
      role: "System Administrator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    },
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Client Presentation Tomorrow",
    description:
      "Final presentation for the Johnson account scheduled for 10:00 AM",
    type: "deadline",
    priority: "high",
    status: "unread",
    sender: {
      id: "105",
      fullName: "Emily Watson",
      email: "emily.w@example.com",
      role: "Account Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    metadata: {
      meetingId: "meet-002",
      meetingTitle: "Johnson Account Presentation",
      url: "/meetings/meet-002",
    },
  },
  {
    id: "6",
    title: "Quarterly Goals Review",
    description:
      "Don't forget to submit your quarterly goals for review by end of day",
    type: "deadline",
    priority: "medium",
    status: "dismissed",
    sender: {
      id: "106",
      fullName: "David Kim",
      email: "david.k@example.com",
      role: "HR Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    dueDate: new Date(Date.now()).toISOString(),
    readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    dismissedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    title: "New Team Member Onboarding",
    description:
      "Welcome new team member - John Smith. Please help with onboarding process.",
    type: "notification",
    priority: "low",
    status: "read",
    sender: {
      id: "107",
      fullName: "Lisa Wang",
      email: "lisa.w@example.com",
      role: "Team Lead",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    },
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    title: "Code Review Request",
    description: "Please review the latest PR for the authentication module",
    type: "task",
    priority: "medium",
    status: "unread",
    sender: {
      id: "108",
      fullName: "Robert Brown",
      email: "robert.b@example.com",
      role: "Senior Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    },
    dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: {
      taskId: "task-002",
      taskTitle: "Authentication Module PR",
      url: "/tasks/task-002",
    },
  },
  {
    id: "9",
    title: "Budget Approval Needed",
    description: "Q3 budget needs your approval before end of week",
    type: "deadline",
    priority: "high",
    status: "read",
    sender: {
      id: "109",
      fullName: "Jennifer Lee",
      email: "jennifer.l@example.com",
      role: "Finance Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    },
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "10",
    title: "Security Training Completion",
    description:
      "Complete the mandatory security awareness training by next week",
    type: "task",
    priority: "medium",
    status: "unread",
    sender: {
      id: "110",
      fullName: "Security Team",
      email: "security@example.com",
      role: "Security Department",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Security",
    },
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    metadata: {
      taskId: "task-003",
      taskTitle: "Security Awareness Training",
      url: "/tasks/task-003",
    },
  },
];

// Main Reminders Component
export default function Reminders() {
  // State for reminders
  const [reminders, setReminders] = useState<Reminder[]>(DUMMY_REMINDERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    priority: "all",
    status: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt" as keyof Reminder,
    sortOrder: "desc" as "asc" | "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(DUMMY_REMINDERS.length);
  const [totalPages, setTotalPages] = useState<number>(
    Math.ceil(DUMMY_REMINDERS.length / 10),
  );

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

  // Get unique types, priorities, statuses for filters
  const filterOptions = {
    types: Array.from(new Set(reminders.map((r) => r.type))),
    priorities: Array.from(new Set(reminders.map((r) => r.priority))),
    statuses: Array.from(new Set(reminders.map((r) => r.status))),
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "No due date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Filter and sort reminders
  const getFilteredReminders = () => {
    let filtered = [...reminders];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(searchLower) ||
          reminder.description.toLowerCase().includes(searchLower) ||
          reminder.sender?.fullName.toLowerCase().includes(searchLower),
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((reminder) => reminder.type === filters.type);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(
        (reminder) => reminder.priority === filters.priority,
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (reminder) => reminder.status === filters.status,
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          if (sortConfig.direction === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        if (aValue == null || bValue == null) return 0;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Get paginated reminders
  const getPaginatedReminders = () => {
    const filtered = getFilteredReminders();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Update pagination when filters change
  useEffect(() => {
    const filtered = getFilteredReminders();
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    // If current page is out of bounds, go to page 1
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  }, [filters, reminders, itemsPerPage, sortConfig]);

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
  const clearFilter = (filterName: keyof typeof filters) => {
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
  const displayReminders = getPaginatedReminders();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle Mark as Read
  const handleMarkAsRead = async (reminderId: string) => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setReminders(
        reminders.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, status: "read", readAt: new Date().toISOString() }
            : reminder,
        ),
      );
      setIsSubmitting(false);
      toast.success("Reminder marked as read!");
    }, 300);
  };

  // Handle Mark as Unread
  const handleMarkAsUnread = async (reminderId: string) => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setReminders(
        reminders.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, status: "unread", readAt: undefined }
            : reminder,
        ),
      );
      setIsSubmitting(false);
      toast.success("Reminder marked as unread!");
    }, 300);
  };

  // Handle Dismiss Reminder
  const handleDismiss = async (reminderId: string) => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
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
      setIsSubmitting(false);
      toast.success("Reminder dismissed!");
    }, 300);
  };

  // Handle Delete Reminder
  const confirmDeleteReminder = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setDeleteOpen(true);
  };

  const handleDeleteReminder = async () => {
    if (reminderToDelete) {
      setIsSubmitting(true);
      // Simulate API delay
      setTimeout(() => {
        setReminders(
          reminders.filter((reminder) => reminder.id !== reminderToDelete.id),
        );
        setIsSubmitting(false);
        setReminderToDelete(null);
        setDeleteOpen(false);
        toast.success("Reminder deleted successfully!");
      }, 500);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
      toast.info("Reminders refreshed!");
    }, 800);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setReminders(
        reminders.map((reminder) => ({
          ...reminder,
          status: "read",
          readAt: new Date().toISOString(),
        })),
      );
      setIsSubmitting(false);
      toast.success("All reminders marked as read!");
    }, 500);
  };

  // Get unread count
  const unreadCount = reminders.filter((r) => r.status === "unread").length;

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
                      value={filters.type}
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
                      value={filters.priority}
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
                      value={filters.status}
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
                      <TableRow className="bg-secondary/50">
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
                        ) : displayReminders.length === 0 ? (
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
                          displayReminders.map((reminder, index) => (
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
          {!isLoading && displayReminders.length > 0 && totalPages > 1 && (
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
