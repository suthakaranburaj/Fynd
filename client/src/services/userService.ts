import { apiClient } from "../api/api-client";
import {
  type User,
  type UserFormData,
  type SettingsFormData,
  type ApiResponse,
  type LoginData,
  type RegisterData,
  type AuthResponse,
  type NotificationPreferences,
} from "@/types/user";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

export const userService = {
  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/users/register",
      data,
    );
    return response.data.data;
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/users/login",
      data,
    );
    return response.data.data;
  },

  // Check authentication status
  async checkAuth(): Promise<User> {
    const response =
      await apiClient.get<ApiResponse<{ user: User }>>("/users/check");
    return response.data.data.user;
  },

  // Get user settings
  async getSettings(): Promise<NotificationPreferences> {
    const response =
      await apiClient.get<ApiResponse<{ settings: NotificationPreferences }>>(
        "/users/settings",
      );
    return response.data.data.settings;
  },

  // Update user settings
  async updateSettings(data: SettingsFormData): Promise<User> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      "/users/update-settings",
      data,
    );
    return response.data.data.user;
  },

  // Update user profile
  async updateProfile(userId: string, data: UserFormData): Promise<User> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      `/users/${userId}`,
      data,
    );
    return response.data.data.user;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>("/users/logout");
  },
};
