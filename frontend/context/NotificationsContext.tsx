"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiGetUnreadNotifications } from "@/lib/api";

interface NotificationsContextType {
  unreadCount: number;
  fetchUnreadCount: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType>({
  unreadCount: 0,
  fetchUnreadCount: () => {},
});

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (user) {
      try {
        const response = await apiGetUnreadNotifications();
        setUnreadCount(response.data.length); // Assuming the API returns an array of unread notifications
      } catch (error) {
        console.error("Failed to fetch unread notifications count", error);
        setUnreadCount(0);
      }
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount(); // Fetch on initial load or when user changes

    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchUnreadCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};
