import { apiClient } from "../api/api-client";
import type {
  CompanyTeam,
  CompanyTeamFormData,
  CompanyTeamsResponse,
  CompanyTeamResponse,
  CompanyTeamFilters,
  CompanyTeamStatistics,
} from "@/types/companyTeams";

export const teamService = {
  // Get all teams with filters
  async getTeams(
    filters: CompanyTeamFilters = {},
  ): Promise<CompanyTeamsResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.search) params.append("search", filters.search);
      if (filters.teamName) params.append("teamName", filters.teamName);
      if (filters.department && filters.department !== "all")
        params.append("department", filters.department);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.teamLead && filters.teamLead !== "all")
        params.append("teamLead", filters.teamLead);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<CompanyTeamsResponse>(
        `/teams${queryString}`,
      );

      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch teams");
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  },

  // Get single team by ID
  async getTeamById(id: string): Promise<CompanyTeam> {
    try {
      const response = await apiClient.get<CompanyTeamResponse>(`/teams/${id}`);

      if (response.data.status) {
        return response.data.data.team;
      }
      throw new Error(response.data.message || "Failed to fetch team");
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      throw error;
    }
  },

  // Create new team
  async createTeam(teamData: CompanyTeamFormData): Promise<CompanyTeam> {
    try {
      const response = await apiClient.post<CompanyTeamResponse>(
        "/teams",
        teamData,
      );

      if (response.data.status) {
        return response.data.data.team;
      }
      throw new Error(response.data.message || "Failed to create team");
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  // Update team
  async updateTeam(
    id: string,
    teamData: CompanyTeamFormData,
  ): Promise<CompanyTeam> {
    try {
      const response = await apiClient.put<CompanyTeamResponse>(
        `/teams/${id}`,
        teamData,
      );

      if (response.data.status) {
        return response.data.data.team;
      }
      throw new Error(response.data.message || "Failed to update team");
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      throw error;
    }
  },

  // Delete team (soft delete)
  async deleteTeam(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{
        status: any;
        success: boolean;
        message: string;
      }>(`/teams/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to delete team");
      }
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      throw error;
    }
  },

  // Get team statistics
  async getTeamStatistics(): Promise<CompanyTeamStatistics> {
    try {
      const response = await apiClient.get<{
        status: any;
        success: boolean;
        data: CompanyTeamStatistics;
        message: string;
      }>("/teams/statistics");

      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch team statistics",
      );
    } catch (error) {
      console.error("Error fetching team statistics:", error);
      throw error;
    }
  },

  // Helper function to get teams from local storage as fallback
  getTeamsFromLocalStorage(): CompanyTeam[] {
    try {
      const saved = localStorage.getItem("company_teams");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading teams from localStorage:", error);
    }
    return [];
  },

  // Helper function to save teams to local storage as backup
  saveTeamsToLocalStorage(teams: CompanyTeam[]): void {
    try {
      localStorage.setItem("company_teams", JSON.stringify(teams));
    } catch (error) {
      console.error("Error saving teams to localStorage:", error);
    }
  },
};
