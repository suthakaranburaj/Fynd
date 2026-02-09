export interface CompanyMember {
  avatar: any;
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

export interface CompanyMembersResponse {
  success: any;
  data: CompanyMembersResponse | PromiseLike<CompanyMembersResponse>;
  message: string;
  members: CompanyMember[];
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
    name?: string;
    email?: string;
  };
}

export interface CompanyMemberResponse {
  success: any;
  data: any;
  message: string;
  member: CompanyMember;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface CompanyMembersFilters {
  search?: string;
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
