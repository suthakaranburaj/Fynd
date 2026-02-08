
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  User,
  Mail,
  Calendar,
  Clock,
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
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { CustomAlert } from "@/components/custom_ui";
import { useDebounce } from "@/utils/debounce";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
// import CompanyMemberFormModal from "../components/CompanyMemberFormModal";
import { type CompanyMember } from "@/types/company.types";

// Mock data
const MOCK_COMPANY_MEMBERS: CompanyMember[] = Array.from(
  { length: 50 },
  (_, i) => ({
    id: `member-${i + 1}`,
    name: `member${i + 1}`,
    fullName: `Full Name ${i + 1}`,
    email: `member${i + 1}@company.com`,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }),
);

export default function CompanyMembers() {
  // State for members
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CompanyMember | null>(
    null,
  );

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CompanyMember | null>(
    null,
  );

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    name: "",
    email: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Local state for immediate input values (before debounce)
  const [searchInput, setSearchInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CompanyMember;
    direction: "asc" | "desc";
  } | null>(null);

  // Create debounced filter functions
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 300);

  const debouncedSetName = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, name: value }));
  }, 300);

  const debouncedSetEmail = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, email: value }));
  }, 300);

  // Handle input changes with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const handleNameChange = (value: string) => {
    setNameInput(value);
    debouncedSetName(value);
  };

  const handleEmailChange = (value: string) => {
    setEmailInput(value);
    debouncedSetEmail(value);
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  // Format date for short display
  const formatDateShort = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Fetch members
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredMembers = [...MOCK_COMPANY_MEMBERS];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMembers = filteredMembers.filter(
          (member) =>
            member.name.toLowerCase().includes(searchLower) ||
            member.fullName.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower),
        );
      }

      if (filters.name) {
        filteredMembers = filteredMembers.filter((member) =>
          member.name.toLowerCase().includes(filters.name.toLowerCase()),
        );
      }

      if (filters.email) {
        filteredMembers = filteredMembers.filter((member) =>
          member.email.toLowerCase().includes(filters.email.toLowerCase()),
        );
      }

      // Apply sorting
      if (sortConfig) {
        filteredMembers.sort((a, b) => {
          let aValue: any = a[sortConfig.key];
          let bValue: any = b[sortConfig.key];

          // Handle dates
          if (
            sortConfig.key === "createdAt" ||
            sortConfig.key === "updatedAt"
          ) {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      // Pagination calculations
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

      setMembers(paginatedMembers);
      setTotalItems(filteredMembers.length);
      setTotalPages(Math.ceil(filteredMembers.length / itemsPerPage));
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members", {
        description: "Please try again later",
      });
      setMembers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMembers();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.name, filters.email, itemsPerPage]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      name: "",
      email: "",
    });
    setSearchInput("");
    setNameInput("");
    setEmailInput("");
    setSortConfig(null);
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: "",
    }));

    // Clear corresponding input state
    switch (filterName) {
      case "search":
        setSearchInput("");
        break;
      case "name":
        setNameInput("");
        break;
      case "email":
        setEmailInput("");
        break;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort
  const handleSort = (key: keyof CompanyMember) => {
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
  };

  // Calculate start and end index for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle Add Member
  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  // Handle Edit Member
  const handleEditMember = (member: CompanyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  // Handle Delete Member
  const confirmDeleteMember = (member: CompanyMember) => {
    setMemberToDelete(member);
    setDeleteOpen(true);
  };

  const handleDeleteMember = async () => {
    if (memberToDelete) {
      try {
        // In a real app, call API here
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMembers(members.filter((member) => member.id !== memberToDelete.id));
        toast.success("Member deleted successfully!");
      } catch (error: any) {
        toast.error("Failed to delete member", {
          description: "Please try again",
        });
      } finally {
        setMemberToDelete(null);
        setDeleteOpen(false);
      }
    }
  };

  // Handle Save Member
  const handleSaveMember = async (data: any, id?: string) => {
    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (id) {
        // Update existing member
        const updatedMember: CompanyMember = {
          id,
          ...data,
          createdAt: editingMember?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMembers(
          members.map((member) => (member.id === id ? updatedMember : member)),
        );
        toast.success("Member updated successfully!");
      } else {
        // Add new member
        const newMember: CompanyMember = {
          id: `member-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMembers([newMember, ...members]);
        toast.success("Member created successfully!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving member:", error);
      toast.error("Failed to save member", {
        description: "Please try again",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchMembers();
    toast.info("Refreshing member data...");
  };

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== "search",
  ).length;

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
                  Company Members
                </h1>
                <motion.p
                  className="text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Manage all company members in one place
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
                  placeholder="Search members by name, full name, or email..."
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
                    onClick={handleAddMember}
                    className="gap-2 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                    New Member
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div className="mb-2" variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-muted-foreground" />
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
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                    {/* Name Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          placeholder="Enter member name"
                          value={nameInput}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="flex-1"
                        />
                        {nameInput && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => {
                              setNameInput("");
                              clearFilter("name");
                            }}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Email Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          placeholder="Enter email address"
                          value={emailInput}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className="flex-1"
                        />
                        {emailInput && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => {
                              setEmailInput("");
                              clearFilter("email");
                            }}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
              Showing {startIndex} to {endIndex} of {totalItems} members
              {activeFiltersCount > 0 && " (filtered)"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Items per page:
                </div>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
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

          {/* Members Table */}
          <motion.div variants={itemVariants}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            {sortConfig?.key === "name" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">
                          Full Name
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center gap-1">
                            Email
                            {sortConfig?.key === "email" &&
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
                            Created At
                            {sortConfig?.key === "createdAt" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-semibold cursor-pointer"
                          onClick={() => handleSort("updatedAt")}
                        >
                          <div className="flex items-center gap-1">
                            Updated At
                            {sortConfig?.key === "updatedAt" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
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
                              colSpan={7}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">
                                  Loading members...
                                </p>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ) : members.length === 0 ? (
                          <motion.tr
                            key="no-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <motion.div
                                className="flex flex-col items-center justify-center"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <p>No members found matching your filters.</p>
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
                          members.map((member, index) => (
                            <motion.tr
                              key={member.id}
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
                                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{member.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {member.id}
                                </code>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="font-medium">
                                  {member.fullName}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {member.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatDateShort(member.createdAt)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDateTime(member.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatDateShort(member.updatedAt)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDateTime(member.updatedAt)}
                                </div>
                              </TableCell>
                              <TableCell className="group-hover:bg-secondary/30">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMember(member)}
                                    className="h-8 w-8 hover:bg-blue-100"
                                    disabled={isLoading}
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDeleteMember(member)}
                                    className="h-8 w-8 hover:bg-red-100"
                                    disabled={isLoading}
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
          {!isLoading && members.length > 0 && totalPages > 1 && (
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

      {/* Member Form Modal */}
      {/* <CompanyMemberFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingMember={editingMember}
        onSave={handleSaveMember}
        isSubmitting={isSubmitting}
      /> */}

      {/* Delete Confirmation */}
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        mainText="Delete Member"
        subText={
          memberToDelete
            ? `Are you sure you want to delete "${memberToDelete.fullName}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        nextButtonText="Delete"
        cancelButtonText="Cancel"
        onNext={handleDeleteMember}
        variant="destructive"
        showCancel={true}
        className="sm:max-w-[425px]"
      />
    </>
  );
}
