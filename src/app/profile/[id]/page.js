'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProfile, getMyProfile, toggleFollow } from '@/utils/api';
import PostCard from '@/components/PostCard';

export default function Profile() {
  const params = useParams();
  const { id } = params;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false); // In a real app, backend should return this

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (id === 'me') {
          res = await getMyProfile();
        } else {
          res = await getProfile(id);
        }
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const res = await toggleFollow(profile.user.id || id);
      if (res.ok) {
        // Optimistic UI update
        setIsFollowing(!isFollowing);
        setProfile({
          ...profile,
          followers_count: isFollowing 
            ? profile.followers_count - 1 
            : profile.followers_count + 1
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading...</div>;
  if (!profile) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Profile not found.</div>;

  return (
    <div className="container" style={{ maxWidth: '935px', marginTop: '30px' }}>
      
      {/* Profile Header */}
      <header style={{ display: 'flex', gap: '40px', padding: '0 20px', marginBottom: '44px', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: '150px', height: '150px' }}>
          <img 
            src={profile.profile_picture || '/default-avatar.png'} 
            alt="avatar" 
            className="avatar" 
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 400 }}>{profile.user?.username || profile.name}</h2>
            
            {id !== 'me' && (
              <button 
                onClick={handleFollowToggle} 
                className={isFollowing ? "btn btn-secondary" : "btn btn-brand"}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          
          <ul style={{ display: 'flex', gap: '40px', listStyle: 'none', padding: 0, marginBottom: '20px', fontSize: '16px' }}>
            <li><span style={{ fontWeight: 600 }}>{profile.posts?.length || 0}</span> posts</li>
            <li><span style={{ fontWeight: 600 }}>{profile.followers_count || 0}</span> followers</li>
            <li><span style={{ fontWeight: 600 }}>{profile.following_count || 0}</span> following</li>
          </ul>
          
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '16px' }}>{profile.name}</h1>
            <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{profile.bio || 'Welcome to my profile!'}</p>
          </div>
        </div>
      </header>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 20px' }}></div>

      {/* Post Grid (Simplistic for now, using PostCard for layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '20px' }}>
        {profile.posts && profile.posts.length > 0 ? (
          profile.posts.map(post => (
             <div key={post.id} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden' }}>
               {post.attachment ? (
                 <img src={post.attachment} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div className="flex-center" style={{ width: '100%', height: '100%', color: 'white', padding: '20px', textAlign: 'center' }}>
                   {post.title}
                 </div>
               )}
             </div>
          ))
        ) : (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            No posts yet.
          </div>
        )}
      </div>

    </div>
  );
}
