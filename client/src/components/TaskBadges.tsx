import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { type Task } from "../types/task.types";

// Task status badge component
export const TaskStatusBadge = ({ status }: { status: Task["status"] }) => {
  const variants = {
    pending: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      icon: Clock,
    },
    "in-progress": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-300",
      icon: Clock,
    },
    completed: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
      icon: CheckCircle,
    },
    overdue: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      icon: AlertCircle,
    },
  };

  const { bg, text, icon: Icon } = variants[status];

  return (
    <Badge variant="secondary" className={`${bg} ${text} gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Priority badge component
export const PriorityBadge = ({ priority }: { priority: Task["priority"] }) => {
  const variants = {
    low: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
    },
    medium: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
    },
    high: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
    },
  };

  const { bg, text } = variants[priority];

  return (
    <Badge variant="secondary" className={`${bg} ${text}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};
