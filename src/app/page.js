'use client';
import { useEffect, useState } from 'react';
import { getPosts, getReels } from '@/utils/api';
import PostCard from '@/components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // We fetch posts from the Django backend
        const res = await getPosts();
        if (res.ok) {
          const data = await res.json();
          // Assuming backend returns an array of posts, or { results: [...] } for pagination
          const postsArray = Array.isArray(data) ? data : data.results || [];
          setPosts(postsArray);
        }
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeed();
  }, []);

  if (loading) {
    return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="container main-layout" style={{ marginTop: '30px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <h2>No posts found.</h2>
            <p>Follow some users to see their posts!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
      <div className="sidebar" style={{ display: 'none' /* Will add desktop sidebar later */ }}>
        {/* Recommended users could go here */}
      </div>
    </div>
  );
}
