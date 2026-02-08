import { apiClient } from "../api/api-client";
import type {
  Task,
  TaskFormData,
  TasksResponse,
  TaskResponse,
  TaskFilters,
  TaskStatistics,
  CommentFormData,
} from "@/types/task.types";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

export const taskService = {
  // Get all tasks for current user with filters
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.search) params.append("search", filters.search);
      if (filters.title) params.append("title", filters.title);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.priority && filters.priority !== "all")
        params.append("priority", filters.priority);
      if (filters.project) params.append("project", filters.project);
      if (filters.assignedTo && filters.assignedTo !== "all")
        params.append("assignedTo", filters.assignedTo);
      if (filters.assignedBy && filters.assignedBy !== "all")
        params.append("assignedBy", filters.assignedBy);
      if (filters.team && filters.team !== "all")
        params.append("team", filters.team);
      if (filters.dueDateFrom)
        params.append("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<TasksResponse>(
        `/tasks${queryString}`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch tasks");
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  // Get single task by ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);

      if (response.data.status) {
        return response.data.data.task;
      }
      throw new Error(response.data.message || "Failed to fetch task");
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  // Create new task
  async createTask(taskData: TaskFormData): Promise<Task> {
    try {
      // Format the data for API
      const formattedData = {
        ...taskData,
        dueDate: taskData.dueDate?.toISOString(),
        assignedTo: taskData.assignedTo || undefined,
        team: taskData.team || undefined,
      };

      const response = await apiClient.post<TaskResponse>(
        "/tasks",
        formattedData,
      );

      if (response.data.status) {
        return response.data.data.task;
      }
      throw new Error(response.data.message || "Failed to create task");
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  // Update task
  async updateTask(id: string, taskData: TaskFormData): Promise<Task> {
    try {
      // Format the data for API
      const formattedData = {
        ...taskData,
        dueDate: taskData.dueDate?.toISOString(),
        assignedTo: taskData.assignedTo || undefined,
        team: taskData.team || undefined,
      };
      const response = await apiClient.put<TaskResponse>(
        `/tasks/${id}`,
        formattedData,
      );
      console.log("fewoiehf", response.data);

      if (response.data.status) {
        return response.data.data.task;
      }
      throw new Error(response.data.message || "Failed to update task");
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error creating task:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Delete task (soft delete)
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{
        status: any;
        success: boolean;
        message: string;
      }>(`/tasks/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error creating task:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Update task status
  async updateTaskStatus(id: string, status: Task["status"]): Promise<string> {
    try {
      const response = await apiClient.patch<{
        status: any;
        success: boolean;
        data: { status: string };
        message: string;
      }>(`/tasks/${id}/status`, { status });
      
      if (response.data.status) {
        return response.data.data.status;
      }
      throw new Error(response.data.message || "Failed to update task status");
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error creating task:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Add comment to task
  async addComment(id: string, commentData: CommentFormData): Promise<any> {
    try {
      const response = await apiClient.post<{
        status: any;
        success: boolean;
        data: any;
        message: string;
      }>(`/tasks/${id}/comments`, commentData);

      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to add comment");
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error creating task:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Get task statistics for current user
  async getTaskStatistics(): Promise<TaskStatistics> {
    try {
      const response = await apiClient.get<{
        status: any;
        success: boolean;
        data: TaskStatistics;
        message: string;
      }>("/tasks/statistics");

      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch task statistics",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error fetching task statistics:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Helper function to get tasks from local storage as fallback
  getTasksFromLocalStorage(): Task[] {
    try {
      const saved = localStorage.getItem("user_tasks");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
    }
    return [];
  },

  // Helper function to save tasks to local storage as backup
  saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem("user_tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  },
};
