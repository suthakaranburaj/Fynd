export interface BaseNotification {
  id: string;
  title: string;
  description: string;
  notificationType: "good" | "normal" | "alert";
  createdAt: string;
  updatedAt: string;
}

export interface MainNotification extends BaseNotification {
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  organization: string;
  isActive: boolean;
  expiryDate: string | null;
}

export interface UserNotification extends BaseNotification {
  user: string;
  isSeen: boolean;
  organization: string;
}

export interface MainNotificationFilters {
  search?: string;
  notificationType?: "good" | "normal" | "alert" | "all";
  isActive?: "true" | "false" | "all";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserNotificationFilters {
  isSeen?: "true" | "false" | "all";
  notificationType?: "good" | "normal" | "alert" | "all";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MainNotificationsResponse {
  status: any;
  success: boolean;
  data: {
    notifications: MainNotification[];
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
      notificationType?: string;
      isActive?: string;
    };
    statistics: {
      total: number;
      active: number;
      expired: number;
      goodCount: number;
      normalCount: number;
      alertCount: number;
    };
    filterOptions: {
      notificationTypes: string[];
      statuses: string[];
    };
  };
  message: string;
}

export interface UserNotificationsResponse {
  status: any;
  success: boolean;
  data: {
    notifications: UserNotification[];
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
    summary: {
      total: number;
      unread: number;
      read: number;
    };
    filters: {
      isSeen?: string;
      notificationType?: string;
    };
  };
  message: string;
}

export interface NotificationStatistics {
  userStatistics: {
    total: number;
    read: number;
    unread: number;
    goodCount: number;
    normalCount: number;
    alertCount: number;
  };
  mainStatistics: {
    activeNotifications: number;
  };
  recentNotifications: UserNotification[];
}

export interface NotificationStatisticsResponse {
  status: any;
  success: boolean;
  data: NotificationStatistics;
  message: string;
}

export interface MarkAsReadResponse {
  status: any;
  success: boolean;
  data: {
    notification: UserNotification;
  };
  message: string;
}

export interface MarkAllReadResponse {
  status: any;
  success: boolean;
  data: {
    updatedCount: number;
  };
  message: string;
}

export interface SSENotificationData {
  type: "user-notification" | "main-notification";
  data: {
    id: string;
    title: string;
    description: string;
    notificationType: "good" | "normal" | "alert";
    isSeen?: boolean;
    isBroadcast?: boolean;
  };
  timestamp: number;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationEvent {
  type: "new-notification" | "mark-read" | "mark-all-read";
  data: SSENotificationData;
}
