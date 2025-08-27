"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { apiDeletePost, apiEditPost, apiRestorePost } from "@/lib/api";
import Reply from "./Reply";
import ReplyForm from "./ReplyForm";

export default function PostView({
  post,
  initialReplies,
  onAction,
}: {
  post: any;
  initialReplies: any[];
  onAction: () => void;
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);

  const isAuthor = user && user.id === post.userId;
  const canEdit =
    isAuthor &&
    !post.isDeleted &&
    new Date().getTime() - new Date(post.createdAt).getTime() < 15 * 60 * 1000;
  const canDelete = isAuthor && !post.isDeleted;
  const canRestore =
    isAuthor &&
    post.isDeleted &&
    new Date().getTime() - new Date(post.deletedAt).getTime() < 15 * 60 * 1000;

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

  const handleRestore = async () => {
    try {
      await apiRestorePost(post.id);
      onAction();
    } catch (error) {
      alert("Failed to restore post.");
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`p-6 border rounded-lg shadow-sm ${
          post.isDeleted ? "bg-red-50" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <p className="font-semibold">{post.user?.email || "Unknown User"}</p>
          <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
        </div>

        {!isEditing ? (
          <p
            className={`text-slate-800 whitespace-pre-wrap ${
              post.isDeleted ? "italic text-slate-500" : ""
            }`}
          >
            {post.isDeleted ? "This post has been deleted." : post.content}
          </p>
        ) : (
          <form onSubmit={handleEdit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={6}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-slate-800 text-white px-3 py-1 text-sm rounded-md"
              >
                Save Changes
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

        <div className="flex gap-4 mt-4 pt-3 border-t text-sm text-slate-600">
          {isAuthor && !isEditing && (
            <>
              {canEdit && (
                <button onClick={() => setIsEditing(true)}>Edit</button>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="text-red-500">
                  Delete
                </button>
              )}
              {canRestore && (
                <button onClick={handleRestore} className="text-blue-500">
                  Restore
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!post.isDeleted && user && (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="font-semibold text-sm mb-2">Leave a reply</p>
          <ReplyForm parentId={post.id} onCommentPosted={onAction} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">
          {initialReplies.length} Replies
        </h2>
        {initialReplies.length > 0 ? (
          initialReplies.map((reply: any) => (
            <Reply key={reply.id} reply={reply} onAction={onAction} />
          ))
        ) : (
          <p className="text-slate-500">No replies yet.</p>
        )}
      </div>
    </div>
  );
}
