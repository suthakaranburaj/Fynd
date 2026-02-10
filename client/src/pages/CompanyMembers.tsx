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
import { useDebounce } from "@/utils/debounce";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";
import {
  type CompanyMember,
  type CompanyMembersFilters,
} from "@/types/companyMember";
import { companyMemberService } from "@/services/companyMemberService";

// Loading skeleton component
const CompanyMembersSkeleton = () => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
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
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => (
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

export default function CompanyMembers() {
  // State for members
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<CompanyMembersFilters>({
    search: "",
    name: "",
    email: "",
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

  // Local state for immediate input values (before debounce)
  const [searchInput, setSearchInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  // Create debounced filter functions
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      search: value,
      page: 1, // Reset to first page when search changes
    }));
  }, 300);

  const debouncedSetName = useDebounce((value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      name: value,
      page: 1,
    }));
  }, 300);

  const debouncedSetEmail = useDebounce((value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      email: value,
      page: 1,
    }));
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

  // Generate avatar URL based on member name (like Reminders component)
  const getAvatarUrl = (member: CompanyMember) => {
    // If member has an avatar property, use it
    if (member.avatar) {
      return member.avatar;
    }
    // Otherwise generate one using DiceBear API with the member's name as seed
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      member.name || member.fullName || member.email || "User",
    )}`;
  };

  // Fetch members from backend
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await companyMemberService.getCompanyMembers({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });

      setMembers(response.members);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching members:", error);

      // Fallback to local storage if API fails
      const localMembers = companyMemberService.getMembersFromLocalStorage();
      setMembers(localMembers.slice(0, itemsPerPage));
      setTotalItems(localMembers.length);
      setTotalPages(Math.ceil(localMembers.length / itemsPerPage));

      toast.error("Failed to fetch members from server", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members when filters, pagination, or sort changes
  useEffect(() => {
    fetchMembers();
  }, [
    currentPage,
    itemsPerPage,
    filters.search,
    filters.name,
    filters.email,
    sortConfig,
  ]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
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
    setFilters((prev: any) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        sortConfig.key === key
          ? sortConfig.direction === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      name: "",
      email: "",
      page: 1,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setNameInput("");
    setEmailInput("");
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof CompanyMembersFilters) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterName]: "",
      page: 1,
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
    setFilters((prev: any) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Refresh data
  const handleRefresh = () => {
    fetchMembers();
    toast.info("Refreshing member data...");
  };

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      key !== "search" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder",
  ).length;

  // Calculate start and end index for display
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  if (isLoading && members.length === 0) {
    return <CompanyMembersSkeleton />;
  }

  return (
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
                View all members in your organization
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
                    setFilters((prev: any) => ({ ...prev, search: "" }));
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
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setFilters((prev: any) => ({
                    ...prev,
                    limit: Number(value),
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

        {/* Members Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead
                        className="font-semibold cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {sortConfig.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Full Name</TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {sortConfig.key === "email" &&
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
                          {sortConfig.key === "createdAt" &&
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
                          {sortConfig.key === "updatedAt" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
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
                          <TableCell colSpan={6} className="text-center py-12">
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
                            colSpan={6}
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
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                  {member.avatar ? (
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={getAvatarUrl(member)}
                                      alt={member.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        // Fallback to icon if image fails to load
                                        e.currentTarget.style.display = "none";
                                        const parent =
                                          e.currentTarget.parentElement;
                                        if (parent) {
                                          const fallbackDiv =
                                            document.createElement("div");
                                          fallbackDiv.className =
                                            "h-10 w-10 rounded-full bg-secondary flex items-center justify-center";
                                          const icon =
                                            document.createElement("div");
                                          icon.innerHTML =
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-5 w-5 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                          fallbackDiv.appendChild(icon);
                                          parent.appendChild(fallbackDiv);
                                        }
                                      }}
                                    />
                                  )}
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
                                <span className="text-sm">{member.email}</span>
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
  );
}
