export interface CompanyTeamMember {
  id: string;
  fullName: string;
  email: string;
  role: "member" | "lead" | "admin";
}

export interface CompanyTeam {
  id: string;
  teamName: string;
  description?: string;
  department?: string;
  teamLead: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  organization: string;
  status: "active" | "inactive" | "archived";
  totalMembers: number;
  totalPendingTasks: number;
  members: CompanyTeamMember[];
  tasks?: string[];
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CompanyTeamFormData {
  teamName: string;
  description: string;
  members: string[]; // array of user IDs
  department: string;
  teamLead: string; // user ID
  status: "active" | "inactive" | "archived";
}

export interface CompanyTeamResponse {
  status: any;
  success: boolean;
  data: {
    team: CompanyTeam;
  };
  message: string;
}

export interface CompanyTeamsResponse {
  status: any;
  success: boolean;
  data: {
    teams: CompanyTeam[];
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
      teamName?: string;
      department?: string;
      status?: string;
      teamLead?: string;
    };
    filterOptions: {
      departments: string[];
      teamLeads: Array<{
        id: string;
        email: string;
        fullName: string;
      }>;
      statuses: string[];
    };
  };
  message: string;
}

export interface CompanyTeamFilters {
  search?: string;
  teamName?: string;
  department?: string;
  status?: string;
  teamLead?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CompanyTeamStatistics {
  totalTeams: number;
  totalMembers: number;
  totalTasks: number;
  statusCounts: Array<{
    status: string;
    count: number;
  }>;
  topDepartments: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CompanyMember {
  id: string;
  name: string;
  fullName: string;
  email: string;
  organization?: string;
  phone?: string;
  role?: string;
  notificationPreferences?: {
    emailReminder: boolean;
    pushNotification: boolean;
    notificationSound: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
