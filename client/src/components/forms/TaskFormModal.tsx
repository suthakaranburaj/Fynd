import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  type Task,
  type TeamMember,
  type TaskFormData,
} from "../../types/task.types";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
  onSave: (data: TaskFormData, id?: string) => Promise<void>;
  isSubmitting: boolean;
  teamMembers: TeamMember[];
}

function TaskFormModal({
  open,
  onOpenChange,
  editingTask,
  onSave,
  isSubmitting,
  teamMembers,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    dueDate: editingTask?.dueDate ? parseISO(editingTask.dueDate) : undefined,
    assignedTo: editingTask?.assignedTo || "",
    priority: editingTask?.priority || "medium",
    status: editingTask?.status || "pending",
    tags: editingTask?.tags || [],
    project: editingTask?.project || "",
  });

  const [dueDateInput, setDueDateInput] = useState<string>("");

  useEffect(() => {
    if (editingTask) {
      const dueDate = parseISO(editingTask.dueDate);
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        dueDate: dueDate,
        assignedTo: editingTask.assignedTo,
        priority: editingTask.priority,
        status: editingTask.status,
        tags: editingTask.tags || [],
        project: editingTask.project || "",
      });
      setDueDateInput(format(dueDate, "dd/MM/yyyy"));
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: undefined,
        assignedTo: "",
        priority: "medium",
        status: "pending",
        tags: [],
        project: "",
      });
      setDueDateInput("");
    }
  }, [editingTask, open]);

  const handleDueDateSelect = (date: Date | undefined) => {
    setFormData({ ...formData, dueDate: date });
    if (date) {
      setDueDateInput(format(date, "dd/MM/yyyy"));
    } else {
      setDueDateInput("");
    }
  };

  const handleDueDateInputChange = (value: string) => {
    setDueDateInput(value);
    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      setFormData({ ...formData, dueDate: parsedDate });
    } else if (value === "") {
      setFormData({ ...formData, dueDate: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.dueDate) {
      alert("Due date is required");
      return;
    }

    if (!formData.assignedTo) {
      alert("Assignee is required");
      return;
    }

    try {
      await onSave(formData, editingTask?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isSubmitting && onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {editingTask
                  ? "Update task details"
                  : "Add a new task to the system"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Enter task title"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate" className="mb-2 block">
                    Due Date *
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="dueDate"
                        value={dueDateInput}
                        onChange={(e) =>
                          handleDueDateInputChange(e.target.value)
                        }
                        placeholder="dd/mm/yyyy or select"
                        className="pr-10"
                        required
                        disabled={isSubmitting}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                            type="button"
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={handleDueDateSelect}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {dueDateInput && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => {
                          setDueDateInput("");
                          setFormData({ ...formData, dueDate: undefined });
                        }}
                        type="button"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignedTo" className="mb-2 block">
                    Assign To *
                  </Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assignedTo: value })
                    }
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.email}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="mb-2 block">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Task["priority"]) =>
                      setFormData({ ...formData, priority: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Task["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="project" className="mb-2 block">
                  Project
                </Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  placeholder="Enter project name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingTask ? (
                    "Update Task"
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskFormModal;
