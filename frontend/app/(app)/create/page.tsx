"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiCreatePost } from '@/lib/api';

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    try {
      // For a top-level post, parentId is undefined
      await apiCreatePost({ content });
      router.push('/home'); // Redirect to home feed after successful creation
    } catch (err: any) {
      setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-2">
            Your thoughts:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded-md min-h-[150px]"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-slate-800 text-white p-2 rounded-md hover:bg-slate-900 disabled:bg-slate-400"
        >
          {isSubmitting ? 'Posting...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}