import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

export const TaskStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "in-progress": "bg-blue-100 text-blue-800 hover:bg-blue-100",
    completed: "bg-green-100 text-green-800 hover:bg-green-100",
    overdue: "bg-red-100 text-red-800 hover:bg-red-100",
    cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  const icons = {
    pending: <Clock className="h-3 w-3 mr-1" />,
    "in-progress": <PlayCircle className="h-3 w-3 mr-1" />,
    completed: <CheckCircle className="h-3 w-3 mr-1" />,
    overdue: <AlertCircle className="h-3 w-3 mr-1" />,
    cancelled: <XCircle className="h-3 w-3 mr-1" />,
  };

  const labels = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    overdue: "Overdue",
    cancelled: "Cancelled",
  };

  return (
    <Badge
      className={`${variants[status as keyof typeof variants]} font-medium gap-1`}
    >
      {icons[status as keyof typeof icons]}
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    low: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    medium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    high: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <Badge
      className={`${variants[priority as keyof typeof variants]} font-medium`}
    >
      {labels[priority as keyof typeof labels]}
    </Badge>
  );
};
