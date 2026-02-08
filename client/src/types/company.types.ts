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
  description: any;
  department: any;
  teamLead: any;
  status: any;
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
  description: string | number | readonly string[] | undefined;
  department: string | undefined;
  teamLead: string | undefined;
  status: string | undefined;
  teamName: string;
  members: string[];
}
