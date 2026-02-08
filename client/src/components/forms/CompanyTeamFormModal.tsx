// app/company/components/CompanyTeamFormModal.tsx
import { useState, useEffect } from "react";
import { RefreshCw, X, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type CompanyTeam,
  type CompanyTeamFormData,
  type CompanyMember,
} from "@/types/company.types";

interface Task {
  id: string;
  title: string;
  description: string;
}

interface CompanyTeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeam?: CompanyTeam | null;
  onSave: (data: CompanyTeamFormData, id?: string) => Promise<void>;
  isSubmitting: boolean;
  members: CompanyMember[];
  tasks: Task[];
}

function CompanyTeamFormModal({
  open,
  onOpenChange,
  editingTeam,
  onSave,
  isSubmitting,
  members,
  tasks,
}: CompanyTeamFormModalProps) {
  const [formData, setFormData] = useState<CompanyTeamFormData>({
    teamName: editingTeam?.teamName || "",
    members: editingTeam?.members || [],
    tasks: editingTeam?.tasks || [],
  });

  const [membersOpen, setMembersOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        teamName: editingTeam.teamName,
        members: editingTeam.members,
        tasks: editingTeam.tasks,
      });
    } else {
      setFormData({
        teamName: "",
        members: [],
        tasks: [],
      });
    }
  }, [editingTeam, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.teamName.trim()) {
      alert("Team Name is required");
      return;
    }

    try {
      await onSave(formData, editingTeam?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter((id) => id !== memberId)
        : [...prev.members, memberId],
    }));
  };

  const toggleTask = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter((id) => id !== taskId)
        : [...prev.tasks, taskId],
    }));
  };

  const removeMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((id) => id !== memberId),
    }));
  };

  const removeTask = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((id) => id !== taskId),
    }));
  };

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.fullName} (${member.email})` : memberId;
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.title : taskId;
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
                {editingTeam ? "Edit Team" : "Create New Team"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {editingTeam
                  ? "Update team details"
                  : "Add a new team to the company"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="teamName" className="mb-2 block">
                  Team Name *
                </Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  required
                  placeholder="Enter team name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="mb-2 block">Members *</Label>
                <Popover open={membersOpen} onOpenChange={setMembersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={membersOpen}
                      className="w-full justify-between"
                      disabled={isSubmitting}
                    >
                      <span className="truncate">
                        {formData.members.length > 0
                          ? `${formData.members.length} member(s) selected`
                          : "Select team members..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandList>
                        <CommandEmpty>No members found.</CommandEmpty>
                        <CommandGroup>
                          {members.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={member.id}
                              onSelect={() => toggleMember(member.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.members.includes(member.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{member.fullName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {member.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Members */}
                {formData.members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.members.map((memberId) => (
                      <Badge
                        key={memberId}
                        variant="secondary"
                        className="gap-1"
                      >
                        {getMemberName(memberId)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeMember(memberId)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="mb-2 block">Tasks</Label>
                <Popover open={tasksOpen} onOpenChange={setTasksOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tasksOpen}
                      className="w-full justify-between"
                      disabled={isSubmitting}
                    >
                      <span className="truncate">
                        {formData.tasks.length > 0
                          ? `${formData.tasks.length} task(s) assigned`
                          : "View assigned tasks..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search tasks..." />
                      <CommandList>
                        <CommandEmpty>No tasks found.</CommandEmpty>
                        <CommandGroup>
                          {tasks.map((task) => (
                            <CommandItem
                              key={task.id}
                              value={task.id}
                              onSelect={() => toggleTask(task.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.tasks.includes(task.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{task.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {task.description}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Tasks (Read-only) */}
                {formData.tasks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tasks.map((taskId) => (
                      <Badge key={taskId} variant="outline" className="gap-1">
                        {getTaskTitle(taskId)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTask(taskId)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Note: Tasks are read-only. To modify tasks, use the Task
                  Management page.
                </p>
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
                  ) : editingTeam ? (
                    "Update Team"
                  ) : (
                    "Create Team"
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

export default CompanyTeamFormModal;
