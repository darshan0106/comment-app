"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostView from '@/components/PostView';
import { apiGetPostById, apiGetRepliesForPost } from '@/lib/api';
import Link from 'next/link';

export default function SinglePostPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!postId) return;
    setIsLoading(true);
    setError('');
    try {
      // Fetch the main post and its replies in parallel
      const [postData, repliesData] = await Promise.all([
        apiGetPostById(postId),
        apiGetRepliesForPost(postId)
      ]);
      setPost(postData);
      setReplies(repliesData.data);
    } catch (err: any) {
      console.error("Failed to fetch post data", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  if (isLoading) {
    return <div className="text-center mt-10">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
        <Link href="/home" className="text-sm text-slate-600 hover:underline mb-4 inline-block">
            &larr; Back to Home Feed
        </Link>
        {post && <PostView post={post} initialReplies={replies} onAction={fetchData} />}
    </div>
  );
}