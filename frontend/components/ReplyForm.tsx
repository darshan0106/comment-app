"use client";
import { useState } from "react";
import { apiCreatePost, apiEditPost } from "@/lib/api";

interface ReplyFormProps {
  parentId?: string;
  initialContent?: string;
  replyId?: string;
  onCommentPosted: () => void;
  onCancel?: () => void;
}

export default function ReplyForm({
  parentId,
  initialContent = "",
  replyId,
  onCommentPosted,
  onCancel,
}: ReplyFormProps) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");
  const isEditing = !!replyId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Reply cannot be empty.");
      return;
    }
    try {
      if (isEditing) {
        await apiEditPost(replyId, { content });
      } else {
        await apiCreatePost({ content, parentId });
      }
      setContent("");
      onCommentPosted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="w-full p-2 border rounded-md"
        rows={3}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-1 rounded-md text-sm hover:bg-slate-900"
        >
          {isEditing ? "Save" : "Reply"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-200 text-slate-800 px-4 py-1 rounded-md text-sm hover:bg-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
