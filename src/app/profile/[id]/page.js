'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProfile, getMyProfile, toggleFollow } from '@/utils/api';
import EditProfileModal from '@/components/EditProfileModal';
import PostModal from '@/components/PostModal';

export default function Profile() {
  const params = useParams();
  const { id } = params;

  const [profile, setProfile] = useState(null);
  const [myProfileId, setMyProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const isOwnProfile = id === 'me';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Always fetch own profile ID so we know if this is our own page
        const meRes = await getMyProfile();
        if (meRes.ok) {
          const me = await meRes.json();
          setMyProfileId(me.id);
        }

        let res;
        if (isOwnProfile) {
          res = await getMyProfile();
        } else {
          res = await getProfile(id);
        }

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const res = await toggleFollow(profile.id);
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setProfile({
          ...profile,
          followers_count: isFollowing
            ? profile.followers_count - 1
            : profile.followers_count + 1,
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  const handleProfileSave = (updated) => {
    setProfile(updated);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-secondary)' }}>Loading...</div>;
  if (!profile) return <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-secondary)' }}>Profile not found.</div>;

  const username = profile.user?.username || profile.name || 'User';
  const avatarUrl = profile.profile_picture || `https://ui-avatars.com/api/?name=${username}&background=random&size=200`;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return (
    <>
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileSave}
        />
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <div className="container" style={{ maxWidth: '935px', marginTop: '30px' }}>

        {/* Profile Header */}
        <header style={{ display: 'flex', gap: '40px', padding: '0 20px', marginBottom: '44px', alignItems: 'flex-start' }}>
          
          {/* Avatar */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <img
              src={avatarUrl}
              alt="avatar"
              className="avatar"
              style={{ width: '150px', height: '150px' }}
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${username}&size=200`; }}
            />
            {isOwnProfile && (
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  position: 'absolute', bottom: '6px', right: '6px',
                  background: 'var(--text-color)', color: '#fff',
                  border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px',
                  fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Change profile photo"
              >
                ✏️
              </button>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 400 }}>{username}</h2>

              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '6px 16px', borderRadius: '8px' }}
                >
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={isFollowing ? 'btn btn-secondary' : 'btn btn-brand'}
                  style={{ fontSize: '14px', padding: '6px 16px' }}
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
              <h1 style={{ fontWeight: 600, fontSize: '15px' }}>{profile.name}</h1>
              {profile.bio && (
                <p style={{ marginTop: '6px', fontSize: '14px', whiteSpace: 'pre-wrap', maxWidth: '500px' }}>
                  {profile.bio}
                </p>
              )}
              {!profile.bio && isOwnProfile && (
                <p
                  onClick={() => setShowEditModal(true)}
                  style={{ marginTop: '6px', fontSize: '14px', color: 'var(--accent-color)', cursor: 'pointer' }}
                >
                  + Add a bio
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Divider with tabs */}
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', borderTop: '1px solid var(--text-color)', marginTop: '-1px' }}>
            POSTS
          </div>
        </div>

        {/* Post Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', marginTop: '4px', padding: '0 20px' }}>
          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map(post => {
              const imgSrc = post.attachment
                ? (post.attachment.startsWith('http') ? post.attachment : `${BASE_URL}${post.attachment}`)
                : null;
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  style={{
                    width: '100%', aspectRatio: '1/1',
                    backgroundColor: '#000', overflow: 'hidden',
                    cursor: 'pointer', position: 'relative',
                  }}
                  className="post-grid-item"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="post"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s, opacity 0.2s' }}
                      className="post-grid-img"
                    />
                  ) : (
                    <div
                      className="flex-center"
                      style={{ width: '100%', height: '100%', color: 'white', padding: '12px', textAlign: 'center', fontSize: '13px' }}
                    >
                      {post.title}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="post-grid-overlay" style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '20px', color: '#fff', fontWeight: 700, fontSize: '15px',
                    transition: 'background 0.2s',
                    opacity: 0,
                  }}>
                    <span>❤️ {post.likes?.length || 0}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .post-grid-item:hover .post-grid-img {
          opacity: 0.7;
          transform: scale(1.03);
        }
        .post-grid-item:hover .post-grid-overlay {
          background: rgba(0,0,0,0.3) !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
