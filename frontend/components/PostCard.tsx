"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { apiDeletePost, apiEditPost } from "@/lib/api";
import { MessageCircle, Edit, Trash2 } from "lucide-react";

export default function PostCard({
  post,
  onAction,
}: {
  post: any;
  onAction: () => void;
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);

  const isAuthor = user && user.id === post.userId;
  const canEdit =
    isAuthor &&
    new Date().getTime() - new Date(post.createdAt).getTime() < 15 * 60 * 1000;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiEditPost(post.id, { content });
      setIsEditing(false);
      onAction();
    } catch (error) {
      alert("Failed to update post.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await apiDeletePost(post.id);
        onAction();
      } catch (error) {
        alert("Failed to delete post.");
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-sm">
          {post.user?.email || "Unknown User"}
        </p>
        <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
      </div>

      {!isEditing ? (
        <p className="text-slate-700">{post.content}</p>
      ) : (
        <form onSubmit={handleEdit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-slate-800 text-white px-3 py-1 text-sm rounded-md"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-200 px-3 py-1 text-sm rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-4 mt-4 pt-3 border-t">
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <MessageCircle size={14} /> View Replies
        </Link>
        {isAuthor && !isEditing && (
          <>
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
              >
                <Edit size={14} /> Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
