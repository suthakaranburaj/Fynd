import { apiClient } from "../api/api-client";

export interface NotificationSettings {
  emailReminder: boolean;
  pushNotification: boolean;
  notificationSound: boolean;
}

export interface SettingsData {
  notifications: NotificationSettings;
}
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

export const settingsService = {
  // Get notification settings from backend
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: { settings: NotificationSettings };
        message: string;
      }>("/users/settings");
      console.log("API Response:", response);
      if (response.data.success) {
        return response.data.data.settings;
      }
      throw new Error(response.data.message || "Failed to fetch settings");
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Fallback to local storage if API fails
      const localSettings = this.getSettingsFromLocalStorage();
      return localSettings;
    }
  },

  // Update notification settings to backend
  async updateNotificationSettings(
    settings: NotificationSettings,
  ): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: { user: any }; // Backend returns user with notificationPreferences
        message: string;
      }>("/users/update-settings", settings);

      if (response.data.success) {
        // Save to local storage as backup
        this.saveSettingsToLocalStorage(
          response.data.data.user.notificationPreferences,
        );
        return response.data.data.user.notificationPreferences;
      }
      throw new Error(response.data.message || "Failed to update settings");
    } catch (error) {
      console.error("Error updating settings:", error);
      // Fallback: save to local storage
      this.saveSettingsToLocalStorage(settings);
      return settings;
    }
  },

  // Get settings from local storage (fallback)
  getSettingsFromLocalStorage(): NotificationSettings {
    try {
      const saved = localStorage.getItem("notification_settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }

    // Default settings
    return {
      emailReminder: true,
      pushNotification: true,
      notificationSound: true,
    };
  },

  // Save settings to local storage (backup)
  saveSettingsToLocalStorage(settings: NotificationSettings): void {
    try {
      localStorage.setItem("notification_settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  },

  // Get all user settings (including notifications)
  async getUserSettings(): Promise<SettingsData> {
    const notificationSettings = await this.getNotificationSettings();
    return {
      notifications: notificationSettings,
    };
  },
};
