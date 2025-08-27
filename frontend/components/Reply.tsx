"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import ReplyForm from './ReplyForm';
import { apiDeletePost, apiRestorePost } from '@/lib/api';
import { MessageCircle, Edit, Trash2, RotateCcw } from 'lucide-react';

export default function Reply({ reply, onAction }: { reply: any; onAction: () => void; }) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = user && user.id === reply.userId;
  const canEdit = isAuthor && (new Date().getTime() - new Date(reply.createdAt).getTime()) < 15 * 60 * 1000;
  const canDelete = isAuthor && !reply.isDeleted;
  const canRestore = isAuthor && reply.isDeleted && (new Date().getTime() - new Date(reply.deletedAt).getTime()) < 15 * 60 * 1000;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      await apiDeletePost(reply.id);
      onAction();
    }
  };

  const handleRestore = async () => {
    await apiRestorePost(reply.id);
    onAction();
  };

  if (isEditing) {
    return (
      <div className="p-4 border rounded-md bg-white">
        <ReplyForm
          replyId={reply.id}
          initialContent={reply.content}
          onCommentPosted={() => { setIsEditing(false); onAction(); }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-md ${reply.isDeleted ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
      <p className="font-semibold text-sm">{reply.user?.email || 'Unknown User'}</p>
      <p className="text-xs text-slate-500 mb-2">{formatDate(reply.createdAt)}</p>
      
      <p className={`text-slate-700 ${reply.isDeleted ? 'italic text-slate-500' : ''}`}>
        {reply.isDeleted ? 'This reply has been deleted.' : reply.content}
      </p>
      
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
        {!reply.isDeleted && user && (
          <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 hover:text-slate-900"><MessageCircle size={14} /> Reply</button>
        )}
        {canEdit && <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 hover:text-slate-900"><Edit size={14} /> Edit</button>}
        {canDelete && <button onClick={handleDelete} className="flex items-center gap-1 text-red-500 hover:text-red-700"><Trash2 size={14} /> Delete</button>}
        {canRestore && <button onClick={handleRestore} className="flex items-center gap-1 text-blue-500 hover:text-blue-700"><RotateCcw size={14} /> Restore</button>}
      </div>

      {isReplying && (
        <ReplyForm
          parentId={reply.id}
          onCommentPosted={() => { setIsReplying(false); onAction(); }}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {reply.children && reply.children.length > 0 && (
        <div className="ml-6 mt-4 space-y-4 border-l-2 pl-4">
          {reply.children.map((child: any) => (
            <Reply key={child.id} reply={child} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}