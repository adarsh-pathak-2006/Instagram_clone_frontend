export default function PostCard({ post }) {
  // Check if attachment exists and ensure it has a proper host if it's relative
  const attachmentUrl = post.attachment 
    ? (post.attachment.startsWith('http') ? post.attachment : `http://127.0.0.1:8000${post.attachment}`)
    : null;

  return (
    <article className="card">
      <div className="flex-between" style={{ padding: '14px' }}>
        <div className="flex-center" style={{ gap: '10px' }}>
          <div className="avatar-brand-ring" style={{ width: '36px', height: '36px' }}>
            <img 
              src={post.user?.profile_picture || '/default-avatar.png'} 
              alt={post.user?.username} 
              style={{ width: '100%', height: '100%', display: 'block' }} 
            />
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {post.user?.username || 'Unknown User'}
          </span>
        </div>
      </div>
      
      {attachmentUrl && (
        <div style={{ width: '100%', backgroundColor: '#000' }}>
          <img 
            src={attachmentUrl} 
            alt={post.title} 
            style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block' }} 
          />
        </div>
      )}
      
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
          <button className="animate-heart">
            <svg aria-label="Like" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.29-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174.98 1.514 1.118 1.514s.278-.34 1.118-1.514a4.21 4.21 0 0 1 3.675-1.941z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
          <button>
            <svg aria-label="Comment" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
        </div>
        
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
          {post.likes?.length || 0} likes
        </div>
        
        <div style={{ fontSize: '14px' }}>
          <span style={{ fontWeight: 600, marginRight: '8px' }}>
            {post.user?.username || 'Unknown User'}
          </span>
          {post.title}
        </div>
        
        {post.description && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {post.description}
          </div>
        )}
      </div>
    </article>
  );
}
