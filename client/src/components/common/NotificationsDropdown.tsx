import { useState, useRef, useEffect } from "react";
import { Bell, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notificationService";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { toast } from "sonner";
import type { UserNotification } from "@/types/notification";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { updateUnreadCount } = useNotificationSSE();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getUserNotifications({
        sortBy: "createdAt",
        sortOrder: "desc",
        limit: 10,
      });

      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.summary.unread);
        updateUnreadCount(response.data.summary.unread);

        // Save to localStorage
        notificationService.saveUserNotificationsToLocalStorage(
          response.data.notifications,
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);

      // Fallback to local storage
      const localNotifications =
        notificationService.getUserNotificationsFromLocalStorage();
      setNotifications(localNotifications);

      // Calculate unread count from local storage
      const localUnread = localNotifications.filter((n) => !n.isSeen).length;
      setUnreadCount(localUnread);

      toast.error("Failed to fetch notifications", {
        description: "Using cached data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Listen for new notifications via SSE
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notificationData = event.detail.data;

      // Add new notification to state
      const newNotification: UserNotification = {
        id: notificationData.id,
        title: notificationData.title,
        description: notificationData.description,
        notificationType: notificationData.notificationType,
        isSeen: false,
        user: "", // Will be populated from backend
        organization: "", // Will be populated from backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      updateUnreadCount(unreadCount + 1);

      // Show toast notification
      toast.info(notificationData.title, {
        description: notificationData.description,
        duration: 5000,
      });
    };

    window.addEventListener(
      "new-notification",
      handleNewNotification as EventListener,
    );

    return () => {
      window.removeEventListener(
        "new-notification",
        handleNewNotification as EventListener,
      );
    };
  }, [unreadCount, updateUnreadCount]);

  const markAsRead = async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isSeen: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        updateUnreadCount(Math.max(0, unreadCount - 1));

        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isSeen: true })));
        setUnreadCount(0);
        updateUnreadCount(0);

        toast.success(
          `Marked ${response.data.updatedCount} notifications as read`,
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "good":
        return <Check className="h-4 w-4 text-green-600" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "good":
        return "Good";
      case "alert":
        return "Alert";
      default:
        return "Info";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 bg-accent"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 border shadow-lg z-50">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {notifications.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-7 text-xs"
                        disabled={isLoading || unreadCount === 0}
                      >
                        Mark all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchNotifications}
                        className="h-7 text-xs"
                        disabled={isLoading}
                      >
                        Refresh
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
                  <p className="text-muted-foreground">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-secondary/30 transition-colors cursor-pointer border-b last:border-0 group",
                      !notification.isSeen && "bg-secondary/10",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                          notification.notificationType === "good"
                            ? "bg-green-100"
                            : notification.notificationType === "alert"
                              ? "bg-yellow-100"
                              : "bg-blue-100",
                        )}
                      >
                        {getIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs h-5">
                              {getTypeLabel(notification.notificationType)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </span>
                          {!notification.isSeen && (
                            <span className="text-xs font-medium text-blue-600">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No notifications</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're all caught up
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page
                    window.location.href = "/notifications";
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
