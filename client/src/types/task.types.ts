export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  tags?: string[];
  project?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate: Date | undefined;
  assignedTo: string;
  priority: Task["priority"];
  status: Task["status"];
  tags?: string[];
  project?: string;
}
