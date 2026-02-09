import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Filter,
  Search,
  X,
  // Calendar,
  Plus,
  // Clock,
  Users,
  Edit,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  User,
  ListTodo,
} from "lucide-react";
import { CustomPagination } from "@/components/custom_ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { parseISO } from "date-fns";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { useDebounce } from "@/utils/debounce";
import CompanyTeamFormModal from "../components/forms/CompanyTeamFormModal";
import {
  type CompanyTeam,
  type CompanyTeamFilters,
  type CompanyMember,
} from "@/types/companyTeams";
import { teamService } from "@/services/teamService";
import { companyMemberService } from "@/services/companyMemberService";

// Loading skeleton component
const CompanyTeamsSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-8xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between gap-4">
            <div>
              <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Filter Section Skeleton */}
        <div className="mb-4">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                      <TableCell key={cell}>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Team Status Badge Component
const TeamStatusBadge = ({
  status,
}: {
  status: "active" | "inactive" | "archived";
}) => {
  const variants = {
    active: "bg-green-100 text-green-800 hover:bg-green-100",
    inactive: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    archived: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  const labels = {
    active: "Active",
    inactive: "Inactive",
    archived: "Archived",
  };

  return (
    <Badge className={`${variants[status]} font-medium`}>
      {labels[status]}
    </Badge>
  );
};

// Main Company Teams Component
export default function CompanyTeams() {
  // State for teams
  const [teams, setTeams] = useState<CompanyTeam[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    departments: [] as string[],
    teamLeads: [] as Array<{ id: string; email: string; fullName: string }>,
    statuses: ["active", "inactive", "archived"] as string[],
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<CompanyTeam | null>(null);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<CompanyTeam | null>(null);

  // Filter state
  const [filters, setFilters] = useState<CompanyTeamFilters>({
    search: "",
    teamName: "",
    department: "all",
    status: "all",
    teamLead: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Local state for immediate input values (before debounce)
  const [searchInput, setSearchInput] = useState<string>("");
  const [teamNameInput, setTeamNameInput] = useState<string>("");
  // const [createdAtInput, setCreatedAtInput] = useState<string>("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CompanyTeam;
    direction: "asc" | "desc";
  } | null>({ key: "createdAt", direction: "desc" });

  // Create debounced filter functions
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  }, 300);

  const debouncedSetTeamName = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, teamName: value, page: 1 }));
  }, 300);

  // Handle input changes with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleTeamNameChange = (value: string) => {
    setTeamNameInput(value);
    debouncedSetTeamName(value);
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format date for short display
  // const formatDateShort = (dateString: string) => {
  //   if (!dateString) return "N/A";
  //   try {
  //     const date = parseISO(dateString);
  //     if (isNaN(date.getTime())) return "Invalid date";
  //     return format(date, "MMM d, yyyy");
  //   } catch {
  //     return "Invalid date";
  //   }
  // };

  // Fetch members for form
  const fetchMembers = async () => {
    try {
      const response = await companyMemberService.getCompanyMembers({
        limit: 100, // Get all members for dropdown
        page: 1,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      setMembers(response.members);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members", {
        description: "Using cached data",
      });
    }
  };

  // Fetch teams from backend
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await teamService.getTeams({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig?.key || "createdAt",
        sortOrder: sortConfig?.direction || "desc",
      });

      setTeams(response.data.teams);
      setTotalItems(response.data.pagination.totalItems);
      setTotalPages(response.data.pagination.totalPages);

      // Update filter options
      setFilterOptions({
        departments: response.data.filterOptions.departments || [],
        teamLeads: response.data.filterOptions.teamLeads || [],
        statuses: response.data.filterOptions.statuses || [
          "active",
          "inactive",
          "archived",
        ],
      });

      // Save to local storage as backup
      teamService.saveTeamsToLocalStorage(response.data.teams);
    } catch (error: any) {
      console.error("Error fetching teams:", error);

      // Fallback to local storage if API fails
      const localTeams = teamService.getTeamsFromLocalStorage();
      setTeams(localTeams.slice(0, itemsPerPage));
      setTotalItems(localTeams.length);
      setTotalPages(Math.ceil(localTeams.length / itemsPerPage));

      toast.error("Failed to fetch teams from server", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTeams();
    fetchMembers();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [
    filters.search,
    filters.teamName,
    filters.department,
    filters.status,
    filters.teamLead,
  ]);

  // Handle filter changes for non-text fields
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      teamName: "",
      department: "all",
      status: "all",
      teamLead: "all",
      page: 1,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setTeamNameInput("");
    // setCreatedAtInput("");
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof CompanyTeamFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "department" ||
        filterName === "status" ||
        filterName === "teamLead"
          ? "all"
          : "",
      page: 1,
    }));

    // Clear corresponding input state
    switch (filterName) {
      case "search":
        setSearchInput("");
        break;
      case "teamName":
        setTeamNameInput("");
        break;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort
  const handleSort = (key: keyof CompanyTeam) => {
    setSortConfig((current) => {
      if (current && current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        key,
        direction: "asc",
      };
    });

    // Update filters
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        sortConfig?.key === key
          ? sortConfig.direction === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  // Calculate start and end index for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle Add Team
  const handleAddTeam = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  // Handle Edit Team
  const handleEditTeam = (team: CompanyTeam) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  // Handle Delete Team
  const confirmDeleteTeam = (team: CompanyTeam) => {
    setTeamToDelete(team);
    setDeleteOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (teamToDelete) {
      try {
        setIsSubmitting(true);
        await teamService.deleteTeam(teamToDelete.id);

        // Remove team from local state
        setTeams(teams.filter((team) => team.id !== teamToDelete.id));
        toast.success("Team deleted successfully!");

        // Refresh teams list
        fetchTeams();
      } catch (error: any) {
        console.error("Error deleting team:", error);
        toast.error("Failed to delete team", {
          description: error.message || "Please try again",
        });
      } finally {
        setTeamToDelete(null);
        setDeleteOpen(false);
        setIsSubmitting(false);
      }
    }
  };

  // Handle Save Team
  const handleSaveTeam = async (data: any, id?: string) => {
    setIsSubmitting(true);

    try {
      if (id) {
        // Update existing team
        const updatedTeam = await teamService.updateTeam(id, data);

        // Update team in local state
        setTeams(teams.map((team) => (team.id === id ? updatedTeam : team)));
        toast.success("Team updated successfully!");
      } else {
        // Create new team
        const newTeam = await teamService.createTeam(data);

        // Add team to local state
        setTeams([newTeam, ...teams]);
        toast.success("Team created successfully!");
      }

      setIsModalOpen(false);

      // Refresh teams list to get updated data
      fetchTeams();
    } catch (error: any) {
      console.error("Error saving team:", error);
      toast.error("Failed to save team", {
        description: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchTeams();
    fetchMembers();
    toast.info("Refreshing team data...");
  };

  // Prepare team data for form
  // const prepareTeamForForm = (team: CompanyTeam) => {
  //   return {
  //     teamName: team.teamName || "",
  //     description: team.description || "",
  //     members: team.members.map((member) => member.id),
  //     department: team.department || "",
  //     teamLead: team.teamLead?.id || "",
  //     status: team.status || "active",
  //   };
  // };

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      value !== "all" &&
      key !== "search" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder",
  ).length;

  if (isLoading && teams.length === 0) {
    return <CompanyTeamsSkeleton />;
  }

  return (
    <>
      <motion.div
        className="min-h-screen bg-background p-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex flex-col gap-6 mb-6 w-full"
            variants={headerVariants}
          >
            <div className="flex justify-between gap-4">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-heading">
                  Company Teams
                </h1>
                <motion.p
                  className="text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Manage and organize all company teams and their members
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.div
                className="relative w-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Search className="absolute left-3 top-6 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search teams by name, description, department, or team lead..."
                  className="pl-10 py-6 text-base"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => {
                      setSearchInput("");
                      setFilters((prev) => ({ ...prev, search: "" }));
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="flex flex-wrap items-center gap-3">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </motion.div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleAddTeam}
                    className="gap-2 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                    New Team
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div className="mb-2" variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="">
                <div className="flex flex-col gap-4">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Filters</h3>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount} active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 text-muted-foreground"
                          disabled={isLoading}
                        >
                          Clear all
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-8"
                        disabled={isLoading}
                      >
                        {showFilters ? "Hide" : "Show"} Filters
                      </Button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                          {/* Team Name Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="teamName"
                              className="text-sm font-medium"
                            >
                              Team Name
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="teamName"
                                placeholder="Enter team name"
                                value={teamNameInput}
                                onChange={(e) =>
                                  handleTeamNameChange(e.target.value)
                                }
                                className="flex-1"
                              />
                              {teamNameInput && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => {
                                    setTeamNameInput("");
                                    clearFilter("teamName");
                                  }}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Department Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="department"
                              className="text-sm font-medium"
                            >
                              Department
                            </Label>
                            <Select
                              value={filters.department || "all"}
                              onValueChange={(value) =>
                                handleFilterChange("department", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="department">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Departments
                                </SelectItem>
                                {filterOptions.departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Status Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="status"
                              className="text-sm font-medium"
                            >
                              Status
                            </Label>
                            <Select
                              value={filters.status || "all"}
                              onValueChange={(value) =>
                                handleFilterChange("status", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {filterOptions.statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Team Lead Filter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="teamLead"
                              className="text-sm font-medium"
                            >
                              Team Lead
                            </Label>
                            <Select
                              value={filters.teamLead || "all"}
                              onValueChange={(value) =>
                                handleFilterChange("teamLead", value)
                              }
                              disabled={isLoading}
                            >
                              <SelectTrigger id="teamLead">
                                <SelectValue placeholder="Select team lead" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Team Leads
                                </SelectItem>
                                {filterOptions.teamLeads.map((lead) => (
                                  <SelectItem key={lead.id} value={lead.id}>
                                    {lead.fullName} ({lead.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="flex justify-between items-center mb-4"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {totalItems} teams
              {activeFiltersCount > 0 && " (filtered)"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Items per page:
                </div>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    const newLimit = Number(value);
                    setItemsPerPage(newLimit);
                    setFilters((prev) => ({
                      ...prev,
                      limit: newLimit,
                      page: 1,
                    }));
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Teams Table */}
          <motion.div variants={itemVariants}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("teamName")}
                        >
                          <div className="flex items-center gap-1">
                            Team Name
                            {sortConfig?.key === "teamName" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("department")}
                        >
                          <div className="flex items-center gap-1">
                            Department
                            {sortConfig?.key === "department" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("totalMembers")}
                        >
                          <div className="flex items-center gap-1">
                            Members
                            {sortConfig?.key === "totalMembers" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("totalPendingTasks")}
                        >
                          <div className="flex items-center gap-1">
                            Tasks
                            {sortConfig?.key === "totalPendingTasks" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Created & Updated
                            {sortConfig?.key === "createdAt" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.tr
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell
                              colSpan={9}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">
                                  Loading teams...
                                </p>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ) : teams.length === 0 ? (
                          <motion.tr
                            key="no-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell
                              colSpan={9}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <motion.div
                                className="flex flex-col items-center justify-center"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Users className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <p>No teams found matching your filters.</p>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="link"
                                    onClick={clearFilters}
                                    className="mt-2"
                                  >
                                    Clear all filters
                                  </Button>
                                </motion.div>
                              </motion.div>
                            </TableCell>
                          </motion.tr>
                        ) : (
                          teams.map((team, index) => (
                            <motion.tr
                              key={team.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              variants={rowVariants}
                              className="group border-1"
                              layout
                              transition={{
                                layout: { duration: 0.3 },
                              }}
                            >
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {team.teamName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {team.id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer max-w-xs">
                                <div className="line-clamp-2 text-sm">
                                  {team.description || "No description"}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <Badge
                                  variant="outline"
                                  className="font-medium"
                                >
                                  {team.department || "Not specified"}
                                </Badge>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {team.totalMembers}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    members
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {team.totalPendingTasks}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    pending
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium text-green-400">
                                      Created:
                                    </span>
                                    <p className="text-xs text-muted-foreground ml-1">
                                      {formatDateTime(team.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium text-orange-400">
                                      Updated:
                                    </span>
                                    <p className="text-xs text-muted-foreground ml-1">
                                      {formatDateTime(team.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <TeamStatusBadge status={team.status} />
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditTeam(team)}
                                    className="h-8 w-8 hover:bg-blue-100"
                                    disabled={isLoading || isSubmitting}
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDeleteTeam(team)}
                                    className="h-8 w-8 hover:bg-red-100"
                                    disabled={
                                      isLoading ||
                                      isSubmitting ||
                                      team.status === "archived"
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom Pagination */}
          {!isLoading && teams.length > 0 && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Team Form Modal */}
      {isModalOpen && (
        <CompanyTeamFormModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editingTeam={editingTeam}
          onSave={handleSaveTeam}
          isSubmitting={isSubmitting}
          members={members}
        />
      )}

      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Team"
        subText={
          teamToDelete
            ? `Are you sure you want to delete "${teamToDelete.teamName}"? This action will set the team status to inactive and cannot be undone.`
            : "This action cannot be undone."
        }
        nextButtonText="Delete"
        cancelButtonText="Cancel"
        onNext={handleDeleteTeam}
        variant="destructive"
        showCancel={true}
        className="sm:max-w-[425px]"
      />
    </>
  );
}
