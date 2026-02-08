// types/company.types.ts
export interface CompanyMember {
  id: string;
  name: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyTeam {
  id: string;
  teamName: string;
  createdAt: string;
  updatedAt: string;
  totalPendingTasks: number;
  totalMembers: number;
  members: string[]; // Array of member IDs
  tasks: string[]; // Array of task IDs
}

export interface CompanyMemberFormData {
  name: string;
  fullName: string;
  email: string;
}

export interface CompanyTeamFormData {
  teamName: string;
  members: string[];
  tasks: string[];
}
