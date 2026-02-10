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
  ChevronUp,
  ChevronDown,
  RefreshCw,
  // Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
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
import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/utils/debounce";
import { notificationService } from "@/services/notificationService";
import type {
  MainNotification,
  MainNotificationFilters,
} from "@/types/notification";
import {
  containerVariants,
  itemVariants,
  rowVariants,
  headerVariants,
  buttonVariants,
} from "@/components/FramerVariants";

// Loading skeleton
const MainNotificationsSkeleton = () => {
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

        {/* Table Skeleton */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <TableHead key={i}>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
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

// Notification Type Badge
const NotificationTypeBadge = ({
  type,
}: {
  type: "good" | "normal" | "alert";
}) => {
  const variants = {
    good: "bg-green-100 text-green-800 hover:bg-green-100",
    normal: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    alert: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  const icons = {
    good: <CheckCircle className="h-3 w-3" />,
    normal: <Bell className="h-3 w-3" />,
    alert: <AlertCircle className="h-3 w-3" />,
  };

  const labels = {
    good: "Good",
    normal: "Normal",
    alert: "Alert",
  };

  return (
    <Badge className={`${variants[type]} font-medium flex items-center gap-1`}>
      {icons[type]}
      {labels[type]}
    </Badge>
  );
};

// Status Badge
const StatusBadge = ({ active }: { active: boolean }) => {
  return active ? (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
      Active
    </Badge>
  ) : (
    <Badge variant="outline">Inactive</Badge>
  );
};

// Main Notifications Page
export default function MainNotificationsPage() {
  const [notifications, setNotifications] = useState<MainNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [statistics, setStatistics] = useState({
  //   total: 0,
  //   active: 0,
  //   expired: 0,
  //   goodCount: 0,
  //   normalCount: 0,
  //   alertCount: 0,
  // });

  // Filter state
  const [filters, setFilters] = useState<MainNotificationFilters>({
    search: "",
    notificationType: "all",
    isActive: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Local state for immediate input values
  const [searchInput, setSearchInput] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MainNotification;
    direction: "asc" | "desc";
  } | null>({ key: "createdAt", direction: "desc" });

  // Create debounced filter function
  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  }, 300);

  // Handle input changes with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  // Format date
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
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

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getMainNotifications({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig?.key || "createdAt",
        sortOrder: sortConfig?.direction || "desc",
      });

      if (response.status) {
        console.log("Fetched notifications:", response.data.notifications);
        setNotifications(response.data.notifications);
        // setStatistics(response.data.statistics);
        setTotalItems(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);

        // Save to local storage
        notificationService.saveMainNotificationsToLocalStorage(
          response.data.notifications,
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);

      // Fallback to local storage
      const localNotifications =
        notificationService.getMainNotificationsFromLocalStorage();
      setNotifications(localNotifications.slice(0, itemsPerPage));
      setTotalItems(localNotifications.length);
      setTotalPages(Math.ceil(localNotifications.length / itemsPerPage));

      toast.error("Failed to fetch notifications", {
        description: "Using cached data as fallback",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [filters.search, filters.notificationType, filters.isActive]);

  // Handle filter changes
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
      notificationType: "all",
      isActive: "all",
      page: 1,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  // Clear specific filter
  const clearFilter = (filterName: keyof MainNotificationFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "notificationType" || filterName === "isActive"
          ? "all"
          : "",
      page: 1,
    }));

    if (filterName === "search") {
      setSearchInput("");
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort
  const handleSort = (key: keyof MainNotification) => {
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

  // Refresh data
  const handleRefresh = () => {
    fetchNotifications();
    toast.info("Refreshing notifications...");
  };

  // Calculate start and end index
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Active filters count
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      value !== "all" &&
      key !== "page" &&
      key !== "limit" &&
      key !== "sortBy" &&
      key !== "sortOrder",
  ).length;

  if (isLoading && notifications.length === 0) {
    return <MainNotificationsSkeleton />;
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
                Broadcast Notifications
              </h1>
              <motion.p
                className="text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                View and manage all broadcast notifications across your
                organization
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
                placeholder="Search notifications by title or description..."
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
                    clearFilter("search");
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>

            {/* Action Button */}
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
                      <Separator className="mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Notification Type Filter */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="notificationType"
                            className="text-sm font-medium"
                          >
                            Type
                          </Label>
                          <Select
                            value={filters.notificationType || "all"}
                            onValueChange={(value: any) =>
                              handleFilterChange("notificationType", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger id="notificationType">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="alert">Alert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="isActive"
                            className="text-sm font-medium"
                          >
                            Status
                          </Label>
                          <Select
                            value={filters.isActive || "all"}
                            onValueChange={(value: any) =>
                              handleFilterChange("isActive", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger id="isActive">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort Filter */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="sortOrder"
                            className="text-sm font-medium"
                          >
                            Sort Order
                          </Label>
                          <Select
                            value={filters.sortOrder || "desc"}
                            onValueChange={(value: any) => {
                              setFilters((prev) => ({
                                ...prev,
                                sortOrder: value,
                              }));
                              setSortConfig((prev) => ({
                                key: prev?.key || "createdAt",
                                direction: value,
                              }));
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger id="sortOrder">
                              <SelectValue placeholder="Select order" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">Newest First</SelectItem>
                              <SelectItem value="asc">Oldest First</SelectItem>
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
            Showing {startIndex} to {endIndex} of {totalItems} notifications
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

        {/* Notifications Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-1">
                          Title & Description
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer"
                        onClick={() => handleSort("notificationType")}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {sortConfig?.key === "notificationType" &&
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
                          Created
                          {sortConfig?.key === "createdAt" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Expires</TableHead>
                      <TableHead className="font-semibold">
                        Created By
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer"
                        onClick={() => handleSort("isActive")}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortConfig?.key === "isActive" &&
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
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center">
                              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">
                                Loading notifications...
                              </p>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ) : notifications.length === 0 ? (
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
                              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                              <p>
                                No notifications found matching your filters.
                              </p>
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
                        notifications.map((notification, index) => (
                          <motion.tr
                            key={notification.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            variants={rowVariants}
                            className="group border-b hover:bg-secondary/10 transition-colors"
                            layout
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Updated:{" "}
                                  {formatTimeAgo(notification.updatedAt)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <NotificationTypeBadge
                                type={notification.notificationType}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  {formatDateTime(notification.createdAt)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {notification.expiryDate ? (
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    {formatDateTime(notification.expiryDate)}
                                  </p>
                                  {new Date(notification.expiryDate) <
                                    new Date() && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Never
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {notification.createdBy ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {notification.createdBy.fullName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {notification.createdBy.email}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  System
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge active={notification.isActive} />
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
        {!isLoading && notifications.length > 0 && totalPages > 1 && (
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
