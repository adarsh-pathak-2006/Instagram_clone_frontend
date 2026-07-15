'use client';
import { useEffect, useState } from 'react';
import { getPosts, getReels } from '@/utils/api';
import PostCard from '@/components/PostCard';
import SuggestionSidebar from '@/components/SuggestionSidebar';

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
      <div className="feed-column">
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <h2>No posts yet.</h2>
            <p style={{ marginTop: '8px' }}>Follow some users to see their posts!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
      <div className="sidebar-column">
        <SuggestionSidebar />
      </div>
    </div>
  );
}
