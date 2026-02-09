import { useState, useEffect } from "react";
import { RefreshCw, X, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CompanyTeam,
  type CompanyTeamFormData,
  type CompanyMember,
} from "@/types/companyTeams";

interface CompanyTeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeam?: CompanyTeam | null;
  onSave: (data: CompanyTeamFormData, id?: string) => Promise<void>;
  isSubmitting: boolean;
  members: CompanyMember[];
}

function CompanyTeamFormModal({
  open,
  onOpenChange,
  editingTeam,
  onSave,
  isSubmitting,
  members,
}: CompanyTeamFormModalProps) {
  const [formData, setFormData] = useState<CompanyTeamFormData>({
    teamName: "",
    description: "",
    members: [],
    department: "",
    teamLead: "",
    status: "active",
  });

  const [membersOpen, setMembersOpen] = useState(false);
  const [uniqueDepartments] = useState<string[]>([
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Operations",
    "Human Resources",
    "Finance",
    "Customer Support",
    "Research & Development",
  ]);

  useEffect(() => {
    if (editingTeam && open) {
      // Convert team data to form data
      setFormData({
        teamName: editingTeam.teamName || "",
        description: editingTeam.description || "",
        members: editingTeam.members.map((member) => member.id),
        department: editingTeam.department || "",
        teamLead: editingTeam.teamLead?.id || "",
        status: editingTeam.status || "active",
      });
    } else {
      setFormData({
        teamName: "",
        description: "",
        members: [],
        department: "",
        teamLead: "",
        status: "active",
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

    if (formData.members.length === 0) {
      alert("At least one member is required");
      return;
    }

    // Ensure team lead is selected from members
    if (formData.teamLead && !formData.members.includes(formData.teamLead)) {
      alert("Team lead must be selected from team members");
      return;
    }

    try {
      await onSave(formData, editingTeam?.id);
      // Form reset is handled in useEffect when modal opens
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

    // If no team lead is selected, auto-select the first member
    if (!formData.teamLead && formData.members.length === 0) {
      setFormData((prev) => ({ ...prev, teamLead: memberId }));
    }
  };

  const removeMember = (memberId: string) => {
    const newMembers = formData.members.filter((id) => id !== memberId);

    // If team lead is removed, clear team lead
    const newTeamLead = formData.teamLead === memberId ? "" : formData.teamLead;

    setFormData((prev) => ({
      ...prev,
      members: newMembers,
      teamLead: newTeamLead,
    }));
  };

  // const getMemberDisplay = (memberId: string) => {
  //   const member = members.find((m) => m.id === memberId);
  //   return member ? `${member.fullName} (${member.email})` : "Unknown Member";
  // };

  const getTeamLeadDisplay = (memberId: string | undefined) => {
    if (!memberId) return "Select team lead";
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.fullName} - ${member.email}` : "Select team lead";
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTeam ? "Edit Team" : "Create New Team"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {editingTeam
                  ? "Update team details and members"
                  : "Create a new team with members and details"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-sm font-medium">
                  Team Name *
                </Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  required
                  placeholder="Enter team name (e.g., Frontend Team)"
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
                  placeholder="Enter team description"
                  disabled={isSubmitting}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department">
                        {formData.department || "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Lead */}
                <div className="space-y-2">
                  <Label htmlFor="teamLead" className="text-sm font-medium">
                    Team Lead
                  </Label>
                  <Select
                    value={formData.teamLead}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teamLead: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="teamLead" className="w-full">
                      <SelectValue placeholder="Select team lead">
                        {getTeamLeadDisplay(formData.teamLead)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter((member) =>
                          formData.members.includes(member.id),
                        )
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName} ({member.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.teamLead &&
                    !formData.members.includes(formData.teamLead) && (
                      <p className="text-xs text-red-500 mt-1">
                        Team lead must be a team member
                      </p>
                    )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "active" | "inactive" | "archived",
                    ) => setFormData({ ...formData, status: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Members Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Members *</Label>
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
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search members by name or email..." />
                      <CommandList>
                        <CommandEmpty>No members found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {members.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={`${member.fullName} ${member.email}`}
                              onSelect={() => toggleMember(member.id)}
                              className="cursor-pointer"
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
                                <span className="font-medium">
                                  {member.fullName}
                                </span>
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
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Selected Members ({formData.members.length})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            members: [],
                            teamLead: "",
                          })
                        }
                        disabled={isSubmitting || formData.members.length === 0}
                        className="h-7 px-2 text-xs"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.members.map((memberId) => {
                        const member = members.find((m) => m.id === memberId);
                        const isTeamLead = formData.teamLead === memberId;
                        return (
                          <Badge
                            key={memberId}
                            variant={isTeamLead ? "default" : "secondary"}
                            className={`gap-1 pl-2 pr-1 py-1 ${isTeamLead ? "bg-primary text-primary-foreground" : ""}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs">
                                {member?.fullName.split(" ")[0] || "Unknown"}
                                {isTeamLead && " (Lead)"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`h-4 w-4 p-0 ${isTeamLead ? "hover:bg-primary/80" : "hover:bg-transparent"}`}
                                onClick={() => removeMember(memberId)}
                                disabled={isSubmitting}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Select at least one team member. Team lead will be selected
                  from team members.
                </p>
              </div>

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
                  ) : editingTeam ? (
                    "Update Team"
                  ) : (
                    "Create Team"
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

export default CompanyTeamFormModal;
