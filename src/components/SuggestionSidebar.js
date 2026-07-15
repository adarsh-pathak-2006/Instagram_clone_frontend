'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSuggestions, toggleFollow } from '@/utils/api';

export default function SuggestionSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await getSuggestions();
        if (res.ok) {
          const data = await res.json();
          // Assuming data is an array of profiles
          const profiles = Array.isArray(data) ? data : data.results || [];
          setSuggestions(profiles.map(p => ({ ...p, isFollowing: false })));
        }
      } catch (err) {
        console.error("Failed to load suggestions", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);

  const handleFollowToggle = async (profileId) => {
    try {
      const res = await toggleFollow(profileId);
      if (res.ok) {
        setSuggestions(suggestions.map(s => 
          (s.user?.id || s.id) === profileId 
            ? { ...s, isFollowing: !s.isFollowing } 
            : s
        ));
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
    }
  };

  if (loading) return null; // Don't show anything while loading
  
  if (suggestions.length === 0) return (
    <div style={{ padding: '20px 0', color: 'var(--text-secondary)' }}>
      <p style={{ fontWeight: 600, marginBottom: '10px' }}>Suggestions For You</p>
      <p style={{ fontSize: '14px' }}>No new suggestions right now.</p>
    </div>
  );

  return (
    <div style={{ padding: '20px 0' }}>
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Suggestions For You
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {suggestions.map(profile => {
          const profileId = profile.id;
          const displayName = profile.user?.username || profile.name || 'User';
          const avatarUrl = profile.profile_picture || `https://ui-avatars.com/api/?name=${displayName}&background=random`;
          
          return (
            <div key={profile.id || profile.user?.username} className="flex-between">
              <Link href={`/profile/${profileId}`} className="flex-center" style={{ gap: '10px' }}>
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="avatar" 
                  style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${displayName}`; }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-color)' }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Suggested for you
                  </span>
                </div>
              </Link>
              <button 
                onClick={() => handleFollowToggle(profileId)}
                style={{ 
                  color: profile.isFollowing ? 'var(--text-color)' : 'var(--accent-color)', 
                  fontWeight: 600, 
                  fontSize: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
