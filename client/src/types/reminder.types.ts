export interface Sender {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface ReminderMetadata {
  taskId?: string;
  taskTitle?: string;
  meetingId?: string;
  meetingTitle?: string;
  projectId?: string;
  projectName?: string;
  url?: string;
}

export type ReminderPriority = "low" | "medium" | "high";
export type ReminderStatus = "unread" | "read" | "dismissed";
export type ReminderType =
  | "task"
  | "meeting"
  | "deadline"
  | "notification"
  | "system"
  | "project";

export interface Reminder {
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

export interface ReminderFilters {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ManualReminderData {
  taskId: string;
  daysThreshold: number;
  message?: string;
}

export interface ReminderStatistics {
  totalReminders: number;
  upcomingReminders: number;
  overdueReminders: number;
  statusCounts: Array<{
    _id: string;
    count: number;
  }>;
  priorityCounts: Array<{
    _id: string;
    count: number;
  }>;
  typeCounts: Array<{
    _id: string;
    count: number;
  }>;
}

export interface RemindersResponse {
  status: any;
  success: boolean;
  data: {
    reminders: Reminder[];
    statistics: {
      total: number;
      unread: number;
      read: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      startIndex: number;
      endIndex: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export interface ReminderResponse {
  status: any;
  success: boolean;
  data: {
    reminder: Reminder;
  };
  message: string;
}

export interface ManualReminderResponse {
  status: any;
  success: boolean;
  data: {
    remindersSent: number;
  };
  message: string;
}

export interface MarkAsReadResponse {
  status: any;
  success: boolean;
  data: {
    id: string;
    status: string;
  };
  message: string;
}
