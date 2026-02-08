export interface TaskAssignee {
  id: string;
  fullName: string;
  email: string;
}

export interface TaskTeam {
  id: string;
  teamName: string;
}

export interface TaskComment {
  id: string;
  user: TaskAssignee;
  comment: string;
  createdAt: string;
}

export interface TaskAttachment {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  assignedTo: TaskAssignee | null;
  assignedBy: TaskAssignee;
  assignedToType: "user" | "team";
  team: TaskTeam | null;
  status: "pending" | "in-progress" | "completed" | "overdue" | "cancelled";
  priority: "low" | "medium" | "high";
  tags: string[];
  project?: string;
  organization: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: Date | undefined;
  assignedTo: string; // user ID or empty string
  team: string; // team ID or empty string
  priority: "low" | "medium" | "high";
  tags: string[];
  project: string;
  status: Task["status"];
}

export interface TaskFilters {
  search?: string;
  title?: string;
  status?: string;
  priority?: string;
  project?: string;
  assignedTo?: string;
  assignedBy?: string;
  team?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TaskResponse {
  status: any;
  success: boolean;
  data: {
    task: Task;
  };
  message: string;
}

export interface TasksResponse {
  status: any;
  success: boolean;
  data: {
    tasks: Task[];
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
    filters: {
      search?: string;
      title?: string;
      status?: string;
      priority?: string;
      project?: string;
      assignedTo?: string;
      assignedBy?: string;
      team?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
    };
    filterOptions: {
      statuses: string[];
      priorities: string[];
      assignedToUsers: TaskAssignee[];
      assignedByUsers: TaskAssignee[];
      teams: TaskTeam[];
    };
  };
  message: string;
}

export interface TaskStatistics {
  totalTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  statusCounts: Array<{
    status: string;
    count: number;
  }>;
  priorityCounts: Array<{
    priority: string;
    count: number;
  }>;
}

export interface CommentFormData {
  comment: string;
}
