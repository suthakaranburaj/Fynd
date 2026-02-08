import { apiClient } from "../api/api-client";
import type {
  MainNotification,
  UserNotification,
  MainNotificationFilters,
  UserNotificationFilters,
  MainNotificationsResponse,
  UserNotificationsResponse,
  NotificationStatisticsResponse,
  MarkAsReadResponse,
  MarkAllReadResponse,
  NotificationStatistics,
} from "@/types/notification";

class NotificationService {
  private baseUrl = "/notifications";

  // Main Notifications
  async getMainNotifications(
    filters: MainNotificationFilters = {},
  ): Promise<MainNotificationsResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.search) params.append("search", filters.search);
      if (filters.notificationType && filters.notificationType !== "all")
        params.append("notificationType", filters.notificationType);
      if (filters.isActive && filters.isActive !== "all")
        params.append("isActive", filters.isActive);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<MainNotificationsResponse>(
        `${this.baseUrl}/main${queryString}`,
      );
      console.log("Main notifications response:", response.data);
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch notifications");
    } catch (error) {
      console.error("Error fetching main notifications:", error);
      throw error;
    }
  }

  // User Notifications
  async getUserNotifications(
    filters: UserNotificationFilters = {},
  ): Promise<UserNotificationsResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.isSeen && filters.isSeen !== "all")
        params.append("isSeen", filters.isSeen);
      if (filters.notificationType && filters.notificationType !== "all")
        params.append("notificationType", filters.notificationType);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<UserNotificationsResponse>(
        `${this.baseUrl}/user${queryString}`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch notifications");
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    try {
      const response = await apiClient.put<MarkAsReadResponse>(
        `${this.baseUrl}/user/${notificationId}/read`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to mark as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    try {
      const response = await apiClient.put<MarkAllReadResponse>(
        `${this.baseUrl}/user/mark-all-read`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to mark all as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStatistics(): Promise<NotificationStatistics> {
    try {
      const response = await apiClient.get<NotificationStatisticsResponse>(
        `${this.baseUrl}/statistics`,
      );

      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    } catch (error) {
      console.error("Error fetching notification statistics:", error);
      throw error;
    }
  }

  // Initialize SSE connection
  initializeSSE(token: string) {
    const url = `${import.meta.env.VITE_API_BASE_URL}${this.baseUrl}/stream?token=${encodeURIComponent(token)}`;

    // Store token in localStorage for SSE
    localStorage.setItem("token", token);

    return {
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Helper to get notifications from local storage
  getUserNotificationsFromLocalStorage(): UserNotification[] {
    try {
      const saved = localStorage.getItem("user_notifications");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error);
    }
    return [];
  }

  // Helper to save notifications to local storage
  saveUserNotificationsToLocalStorage(notifications: UserNotification[]): void {
    try {
      localStorage.setItem("user_notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving notifications to localStorage:", error);
    }
  }

  // Helper to get main notifications from local storage
  getMainNotificationsFromLocalStorage(): MainNotification[] {
    try {
      const saved = localStorage.getItem("main_notifications");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error(
        "Error loading main notifications from localStorage:",
        error,
      );
    }
    return [];
  }

  // Helper to save main notifications to local storage
  saveMainNotificationsToLocalStorage(notifications: MainNotification[]): void {
    try {
      localStorage.setItem("main_notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving main notifications to localStorage:", error);
    }
  }
}

export const notificationService = new NotificationService();
