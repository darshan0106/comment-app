"use client";
import { useEffect, useState } from 'react';
import PostCard from '@/components/PostCard';
import { apiGetTopLevelPosts } from '@/lib/api';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetTopLevelPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Home Feed</h1>
      {isLoading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} onAction={fetchPosts} />
            ))
          ) : (
            <p>No posts yet. Be the first to create one!</p>
          )}
        </div>
      )}
    </div>
  );
}