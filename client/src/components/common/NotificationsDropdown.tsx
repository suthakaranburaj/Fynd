import { useState, useRef, useEffect } from "react";
import { Bell, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  time: string;
  read: boolean;
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Task Completed",
      message: "Dashboard Redesign was marked as completed",
      type: "success",
      time: "10m ago",
      read: false,
    },
    {
      id: "2",
      title: "New Task",
      message: "You were assigned to API Integration",
      type: "info",
      time: "1h ago",
      read: false,
    },
    {
      id: "3",
      title: "Deadline Soon",
      message: "Mobile App UI is due tomorrow",
      type: "warning",
      time: "2h ago",
      read: true,
    },
    {
      id: "4",
      title: "Project Update",
      message: "New features added to Infrastructure",
      type: "info",
      time: "1d ago",
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
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
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-100 border shadow-lg z-50">
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
                      >
                        Mark all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-7 text-xs text-red-600"
                      >
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-secondary/30 transition-colors cursor-pointer border-b last:border-0",
                      !notification.read && "bg-secondary/10",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          notification.type === "success"
                            ? "bg-green-100"
                            : notification.type === "warning"
                              ? "bg-yellow-100"
                              : "bg-blue-100",
                        )}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-11" />
                    )}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
