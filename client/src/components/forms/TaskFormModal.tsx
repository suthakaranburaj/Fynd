import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  X,
  Users,
  Tag,
  FolderKanban,
  Check,
  ChevronsUpDown,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  type Task,
  type TaskFormData,
  type TaskAssignee,
  type TaskTeam,
} from "@/types/task.types";
import type { CompanyMember } from "@/types/companyMember.ts";
import type { CompanyTeam } from "@/types/companyTeams.ts";
import {toast} from "sonner"
interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
  onSave: (data: TaskFormData, id?: string) => Promise<void>;
  isSubmitting: boolean;
  members: CompanyMember[];
  teams: CompanyTeam[];
}

function TaskFormModal({
  open,
  onOpenChange,
  editingTask,
  onSave,
  isSubmitting,
  members,
  teams,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    dueDate: undefined,
    assignedTo: "none",
    team: "none",
    priority: "medium",
    tags: [],
    project: "",
    status: "pending",
  });

  const [dueDateInput, setDueDateInput] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [teamSearch, setTeamSearch] = useState<string>("");
  const [openMemberDropdown, setOpenMemberDropdown] = useState(false);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);

  // Status update options
  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: Pause,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      description: "Task is not started yet",
    },
    {
      value: "in-progress",
      label: "In Progress",
      icon: Play,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: "Task is currently being worked on",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      description: "Task has been finished",
    },
    {
      value: "overdue",
      label: "Overdue",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      description: "Task is past due date",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: X,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      description: "Task has been cancelled",
    },
  ];

  useEffect(() => {
    if (editingTask && open) {
      const dueDate = parseISO(editingTask.dueDate);
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        dueDate: dueDate,
        assignedTo: editingTask.assignedTo?.id || "none",
        team: editingTask.team?.id || "none",
        priority: editingTask.priority,
        tags: editingTask.tags || [],
        project: editingTask.project || "",
        status: editingTask.status || "pending",
      });
      setDueDateInput(format(dueDate, "dd/MM/yyyy"));
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: undefined,
        assignedTo: "none",
        team: "none",
        priority: "medium",
        tags: [],
        project: "",
        status: "pending",
      });
      setDueDateInput("");
      setTagInput("");
      setMemberSearch("");
      setTeamSearch("");
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Filter available members based on selected team and search
  const filteredMembers =
    formData.team !== "none"
      ? members.filter((member) =>
          teams
            .find((t) => t.id === formData.team)
            ?.members.some((m) => m.id === member.id),
        )
      : members;

  const searchFilteredMembers = filteredMembers.filter((member) =>
    member.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  // Filter teams based on search
  const searchFilteredTeams = teams.filter((team) =>
    team.teamName.toLowerCase().includes(teamSearch.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }

    // Prepare data for API (convert "none" to empty string)
    const apiData = {
      ...formData,
      assignedTo: formData.assignedTo === "none" ? "" : formData.assignedTo,
      team: formData.team === "none" ? "" : formData.team,
      dueDate: formData.dueDate,
    };

    try {
      await onSave(apiData, editingTask?.id);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Get current status option
  const currentStatus = statusOptions.find(
    (option) => option.value === formData.status,
  );

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
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {editingTask ? "Update task details" : "Create a new task"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
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
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  disabled={isSubmitting}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
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

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setFormData({ ...formData, priority: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                {/* <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Task["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <status.icon
                              className={`h-4 w-4 ${status.color}`}
                            />
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              {/* Status Quick Actions */}
              {editingTask && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Quick Status Update
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={
                        formData.status === "pending" ? "default" : "outline"
                      }
                      onClick={() =>
                        setFormData({ ...formData, status: "pending" })
                      }
                      disabled={isSubmitting}
                      className={`${
                        formData.status === "pending"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "border-yellow-200 hover:bg-yellow-50"
                      }`}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pending
                    </Button>
                    <Button
                      type="button"
                      variant={
                        formData.status === "in-progress"
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setFormData({ ...formData, status: "in-progress" })
                      }
                      disabled={isSubmitting}
                      className={`${
                        formData.status === "in-progress"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      type="button"
                      variant={
                        formData.status === "completed" ? "default" : "outline"
                      }
                      onClick={() =>
                        setFormData({ ...formData, status: "completed" })
                      }
                      disabled={isSubmitting}
                      className={`${
                        formData.status === "completed"
                          ? "bg-green-500 hover:bg-green-600"
                          : "border-green-200 hover:bg-green-50"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Assignment with Command */}
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-medium">
                    Assign to Team
                  </Label>
                  <Popover
                    open={openTeamDropdown}
                    onOpenChange={setOpenTeamDropdown}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTeamDropdown}
                        className="w-full justify-between"
                        disabled={isSubmitting}
                      >
                        {formData.team !== "none"
                          ? teams.find((team) => team.id === formData.team)
                              ?.teamName
                          : "Select team (optional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search teams..."
                          value={teamSearch}
                          onValueChange={setTeamSearch}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No team found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  team: "none",
                                  assignedTo: "none",
                                });
                                setOpenTeamDropdown(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.team === "none"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              No team assignment
                            </CommandItem>
                            {searchFilteredTeams.map((team) => (
                              <CommandItem
                                key={team.id}
                                value={team.id}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    team: team.id,
                                    assignedTo: "none",
                                  });
                                  setOpenTeamDropdown(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.team === team.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {team.teamName}
                                {team.department && ` (${team.department})`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* User Assignment with Command */}
                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-sm font-medium">
                    Assign to User
                  </Label>
                  <Popover
                    open={openMemberDropdown}
                    onOpenChange={setOpenMemberDropdown}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMemberDropdown}
                        className="w-full justify-between"
                        disabled={isSubmitting || filteredMembers.length === 0}
                      >
                        {formData.assignedTo !== "none"
                          ? members.find(
                              (member) => member.id === formData.assignedTo,
                            )?.fullName
                          : filteredMembers.length > 0
                            ? "Select user (optional)"
                            : "No members available"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search users..."
                          value={memberSearch}
                          onValueChange={setMemberSearch}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  assignedTo: "none",
                                });
                                setOpenMemberDropdown(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.assignedTo === "none"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              No user assignment
                            </CommandItem>
                            {searchFilteredMembers.map((member) => (
                              <CommandItem
                                key={member.id}
                                value={member.id}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    assignedTo: member.id,
                                  });
                                  setOpenMemberDropdown(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.assignedTo === member.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {member.fullName} ({member.email})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.team !== "none" && filteredMembers.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No members found in the selected team
                    </p>
                  )}
                </div>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-medium">
                  Project
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
                    }
                    placeholder="Enter project name"
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    disabled={isSubmitting}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tags (press Enter)"
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isSubmitting || !tagInput.trim()}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pl-2 pr-1 py-1"
                      >
                        <span className="text-xs">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Validation Message */}
              {formData.assignedTo === "none" && formData.team === "none" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Note: Task must be assigned to either a user or a team. If
                    left unassigned, it will be assigned to you.
                  </p>
                </div>
              )}

              {/* Current Status Display */}
              {currentStatus && (
                <div
                  className={`p-4 rounded-lg ${currentStatus.bgColor} border ${currentStatus.color.replace("text", "border")}`}
                >
                  <div className="flex items-center gap-3">
                    <currentStatus.icon
                      className={`h-6 w-6 ${currentStatus.color}`}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Current Status: {currentStatus.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {currentStatus.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
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

            {/* Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskFormModal;
