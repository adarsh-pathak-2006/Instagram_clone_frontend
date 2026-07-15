'use client';

export default function PostModal({ post, onClose }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const attachmentUrl = post.attachment
    ? (post.attachment.startsWith('http') ? post.attachment : `${BASE_URL}${post.attachment}`)
    : null;

  const displayName = post.user?.user?.username || post.user?.name || 'Unknown User';
  const avatarUrl = post.user?.profile_picture || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: '16px', right: '20px',
          background: 'none', border: 'none',
          color: '#fff', fontSize: '32px', cursor: 'pointer', zIndex: 1001
        }}
      >✕</button>

      <div style={{
        display: 'flex',
        background: '#fff',
        borderRadius: '4px',
        overflow: 'hidden',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
      }}>
        {/* Media Panel */}
        <div style={{ flex: '0 0 55%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          {attachmentUrl ? (
            <img
              src={attachmentUrl}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '90vh' }}
            />
          ) : (
            <div style={{ color: '#fff', padding: '40px', textAlign: 'center', fontSize: '18px' }}>
              {post.title}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${displayName}`; }}
            />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{displayName}</span>
          </div>

          {/* Caption & Details */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <img
                src={avatarUrl}
                alt={displayName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <span style={{ fontWeight: 600, fontSize: '14px', marginRight: '8px' }}>{displayName}</span>
                <span style={{ fontSize: '14px' }}>{post.title}</span>
                {post.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{post.description}</p>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {new Date(post.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Likes */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{post.likes?.length || 0} likes</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {post.created && new Date(post.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
