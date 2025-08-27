"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetAllNotifications, apiMarkNotificationAsRead } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications"; // Import the hook
import { Check } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchUnreadCount } = useNotifications(); // Get the refetch function from context

  const fetchNotifications = async () => {
    try {
      const response = await apiGetAllNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiMarkNotificationAsRead(id);
      await fetchNotifications(); // Refresh the list on this page
      await fetchUnreadCount(); // **CRUCIAL:** Refresh the global count for the header
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif: any) => (
              <div
                key={notif.id}
                className={`p-4 border rounded-lg flex justify-between items-start ${
                  notif.isRead ? "bg-white/70" : "bg-white shadow-sm"
                }`}
              >
                <Link href={`/post/${notif.commentId}`} className="flex-grow">
                  <p
                    className={
                      notif.isRead ? "text-slate-500" : "text-slate-800"
                    }
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(notif.createdAt)}
                  </p>
                </Link>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="ml-4 flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 whitespace-nowrap"
                  >
                    <Check size={14} /> Mark as Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 bg-white rounded-lg border">
              You have no notifications.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
