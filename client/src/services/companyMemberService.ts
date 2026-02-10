import { apiClient } from "../api/api-client";
import type {
  CompanyMember,
  CompanyMembersResponse,
  CompanyMemberResponse,
  CompanyMembersFilters,
} from "@/types/companyMember";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

export const companyMemberService = {
  // Get all company members with filters
  async getCompanyMembers(
    filters: CompanyMembersFilters = {},
  ): Promise<CompanyMembersResponse> {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.search) params.append("search", filters.search);
      if (filters.name) params.append("name", filters.name);
      if (filters.email) params.append("email", filters.email);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get<{
        status: any;
        success: boolean;
        data: CompanyMembersResponse;
        message: string;
      }>(`/company-members${queryString}`);
      console.log("API Response:", response.data);
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch company members",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error fetching company members", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Get single company member by ID
  async getCompanyMemberById(id: string): Promise<CompanyMember> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CompanyMemberResponse;
        message: string;
      }>(`/company-members/${id}`);

      if (response.data.success) {
        return response.data.data.member;
      }
      throw new Error(
        response.data.message || "Failed to fetch company member",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Error fetching company member:", message);
      throw new Error(message); // 👈 THIS is what UI will receive
    }
  },

  // Helper function to get members from local storage as fallback (optional)
  getMembersFromLocalStorage(): CompanyMember[] {
    try {
      const saved = localStorage.getItem("company_members");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading members from localStorage:", error);
    }

    return [];
  },

  // Helper function to save members to local storage as backup (optional)
  saveMembersToLocalStorage(members: CompanyMember[]): void {
    try {
      localStorage.setItem("company_members", JSON.stringify(members));
    } catch (error) {
      console.error("Error saving members to localStorage:", error);
    }
  },
};
