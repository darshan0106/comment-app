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
        setUnreadCount(response.data.length);
      } catch (error) {
        console.error("Failed to fetch unread notifications count", error);
        setUnreadCount(0);
      }
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};
