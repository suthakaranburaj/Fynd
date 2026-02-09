import { apiClient } from "../api/api-client";
import type {
  Reminder,
  ReminderFilters,
  RemindersResponse,
  ManualReminderData,
  ManualReminderResponse,
  ReminderStatistics,
  MarkAsReadResponse,
} from "@/types/reminder.types";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

export const reminderService = {
  // Get all reminders for current user with filters
  async getReminders(
    filters: ReminderFilters = {},
  ): Promise<RemindersResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.search) params.append("search", filters.search);
      if (filters.type && filters.type !== "all")
        params.append("type", filters.type);
      if (filters.priority && filters.priority !== "all")
        params.append("priority", filters.priority);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<RemindersResponse>(
        `/reminders${queryString}`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch reminders");
    } catch (error) {
      console.error("Error fetching reminders:", error);
      throw error;
    }
  },

  // Send manual reminder for a task
  async sendManualReminder(
    data: ManualReminderData,
  ): Promise<ManualReminderResponse> {
    try {
      const response = await apiClient.post<ManualReminderResponse>(
        "/reminders/manual",
        data,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(
        response.data.message || "Failed to send manual reminder",
      );
    } catch (error) {
      console.error("Error sending manual reminder:", error);
      throw error;
    }
  },

  // Mark reminder as read
  async markAsRead(id: string): Promise<MarkAsReadResponse> {
    try {
      const response = await apiClient.patch<MarkAsReadResponse>(
        `/reminders/${id}/read`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(
        response.data.message || "Failed to mark reminder as read",
      );
    } catch (error) {
      console.error("Error marking reminder as read:", error);
      throw error;
    }
  },

  // Mark reminder as dismissed
  async dismissReminder(id: string): Promise<MarkAsReadResponse> {
    try {
      const response = await apiClient.patch<MarkAsReadResponse>(
        `/reminders/${id}/dismiss`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to dismiss reminder");
    } catch (error) {
      console.error("Error dismissing reminder:", error);
      throw error;
    }
  },

  // Delete reminder
  async deleteReminder(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{
        status: any;
        success: boolean;
        message: string;
      }>(`/reminders/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to delete reminder");
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error deleting reminder:", message);
      throw new Error(message);
    }
  },

  // Get reminder statistics
  async getReminderStatistics(): Promise<ReminderStatistics> {
    try {
      const response = await apiClient.get<{
        status: any;
        success: boolean;
        data: ReminderStatistics;
        message: string;
      }>("/reminders/statistics");

      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch reminder statistics",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error fetching reminder statistics:", message);
      throw new Error(message);
    }
  },

  // Helper function to get reminders from local storage as fallback
  getRemindersFromLocalStorage(): Reminder[] {
    try {
      const saved = localStorage.getItem("user_reminders");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading reminders from localStorage:", error);
    }
    return [];
  },

  // Helper function to save reminders to local storage as backup
  saveRemindersToLocalStorage(reminders: Reminder[]): void {
    try {
      localStorage.setItem("user_reminders", JSON.stringify(reminders));
    } catch (error) {
      console.error("Error saving reminders to localStorage:", error);
    }
  },
};
