export interface User {
  id: string;
  fullName: string;
  email: string;
  organization?: string;
  teamSize?: string;
  phone?: string;
  isVerified: boolean;
  role: string;
  notificationPreferences: NotificationPreferences;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  emailReminder: boolean;
  pushNotification: boolean;
  notificationSound: boolean;
}

export interface UserFormData {
  fullName: string;
  email: string;
  organization?: string;
  teamSize?: string;
  phone?: string;
}

export interface SettingsFormData {
  emailReminder: boolean;
  pushNotification: boolean;
  notificationSound: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  fullName: string;
  organization?: string;
  teamSize?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
