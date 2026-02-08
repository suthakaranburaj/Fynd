// hooks/useNotificationSSE.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import type { SSENotificationData } from "@/types/notification";

export const useNotificationSSE = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Get token from localStorage or cookies
    const getToken = () => {
      // Try to get token from localStorage first
      let token = localStorage.getItem("token") || "";

      // If no token in localStorage, try to get from cookies
      if (!token) {
        const cookies = document.cookie.split(";");
        const accessTokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("accessToken="),
        );
        if (accessTokenCookie) {
          token = accessTokenCookie.split("=")[1];
        }
      }

      return token;
    };

    const token = getToken();

    if (!token) {
      console.error("No token found for SSE connection");
      return;
    }

    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log("SSE connection already open");
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const sseConfig = notificationService.initializeSSE(token);

      console.log("Connecting to SSE:", sseConfig.url);

      // Create EventSource with token in URL
      const eventSource = new EventSource(sseConfig.url, {
        withCredentials: true, // Include cookies if using cookie-based auth
      });

      eventSource.onopen = () => {
        console.log("SSE connection opened successfully");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send initial connection event
        window.dispatchEvent(new CustomEvent("sse-connected"));
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("Server acknowledged connection");
              break;

            case "initial":
              if (data.unreadCount !== undefined) {
                setUnreadCount(data.unreadCount);
                console.log("Initial unread count:", data.unreadCount);
              }
              break;

            case "new-notification":
              const notificationData = data.data as SSENotificationData;
              console.log("New notification received:", notificationData);

              // Update unread count
              if (
                notificationData.type === "user-notification" &&
                !notificationData.data.isSeen
              ) {
                setUnreadCount((prev) => prev + 1);
              }

              // Dispatch custom event
              window.dispatchEvent(
                new CustomEvent("new-notification", {
                  detail: notificationData,
                }),
              );
              break;

            case "heartbeat":
              // Keep connection alive
              console.log("Heartbeat received");
              break;

            default:
              console.log("Unknown event type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000,
          );
          console.log(
            `Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
          window.dispatchEvent(new CustomEvent("sse-disconnected"));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Error creating SSE connection:", error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      console.log("SSE connection closed");
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Update unread count
  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  // Initialize connection
  useEffect(() => {
    // Wait a bit before connecting to ensure auth is ready
    const timer = setTimeout(() => {
      connect();
    }, 1000);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      disconnect();
      setTimeout(connect, 500);
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    unreadCount,
    updateUnreadCount,
    reconnect: connect,
    disconnect,
  };
};
