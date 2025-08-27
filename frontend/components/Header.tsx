"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications"; // Import the new hook
import { Bell, PlusSquare } from "lucide-react";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const { unreadCount } = useNotifications(); // Get the unread count from context

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto max-w-5xl p-4 flex justify-between items-center">
        <Link
          href={user ? "/home" : "/"}
          className="text-xl font-bold text-slate-800"
        >
          PostThread
        </Link>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
          ) : user ? (
            <>
              <Link
                href="/create"
                className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-slate-900"
              >
                <PlusSquare size={16} /> Create Post
              </Link>

              {/* --- UPDATED NOTIFICATION BELL --- */}
              <Link
                href="/notifications"
                className="relative text-slate-600 hover:text-slate-900"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Link>
              {/* --- END OF UPDATE --- */}

              <button
                onClick={logout}
                className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-sm hover:bg-slate-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-slate-800 text-white px-3 py-1 rounded-md text-sm hover:bg-slate-900"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
