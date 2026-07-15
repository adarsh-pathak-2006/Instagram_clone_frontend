'use client';
import { useState, useEffect } from 'react';
import { likePost, getPostComments, addPostComment, addPostReply, getMyProfile } from '@/utils/api';

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [myProfileId, setMyProfileId] = useState(null);

  useEffect(() => {
    // Check if the current user has liked the post
    const checkLikeStatus = async () => {
      try {
        const res = await getMyProfile();
        if (res.ok) {
          const profile = await res.json();
          setMyProfileId(profile.id);
          const hasLiked = post.likes?.some(like => like.id === profile.id);
          setIsLiked(hasLiked);
        }
      } catch (err) {}
    };
    checkLikeStatus();
  }, [post.likes]);

  const handleLike = async () => {
    const previousState = isLiked;
    const previousCount = likeCount;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await likePost(post.id);
      if (!res.ok) throw new Error('Failed to toggle like');
    } catch (err) {
      // Revert on failure
      setIsLiked(previousState);
      setLikeCount(previousCount);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await getPostComments(post.id);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await addPostComment(post.id, newComment);
      if (res.ok) {
        setNewComment('');
        fetchComments(); // Refresh comments
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    const textToSend = replyText.trim();
    if (!textToSend) return;
    
    // Clear UI immediately so the user knows their action was received
    setReplyText('');
    setReplyingTo(null);
    
    try {
      const res = await addPostReply(post.id, commentId, textToSend);
      if (res.ok) {
        // Now refresh comments to show the new reply from the server
        await fetchComments();
      } else {
        console.error('Failed to post reply, status:', res.status);
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const attachmentUrl = post.attachment 
    ? (post.attachment.startsWith('http') ? post.attachment : `http://127.0.0.1:8000${post.attachment}`)
    : null;

  const displayName = post.user?.user?.username || post.user?.name || 'Unknown User';
  const avatarUrl = post.user?.profile_picture || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  return (
    <article className="card">
      <div className="flex-between" style={{ padding: '14px' }}>
        <div className="flex-center" style={{ gap: '10px' }}>
          <div className="avatar-brand-ring" style={{ width: '36px', height: '36px' }}>
            <img 
              src={avatarUrl} 
              alt={displayName} 
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} 
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${displayName}`; }}
            />
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {displayName}
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
          <button 
            className="animate-heart" 
            onClick={handleLike}
            style={{ color: isLiked ? '#ed4956' : 'currentColor', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg aria-label="Like" fill={isLiked ? "#ed4956" : "currentColor"} height="24" role="img" viewBox="0 0 24 24" width="24">
              {isLiked ? (
                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.29-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174.98 1.514 1.118 1.514s.278-.34 1.118-1.514a4.21 4.21 0 0 1 3.675-1.941z"></path>
              ) : (
                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.29-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174.98 1.514 1.118 1.514s.278-.34 1.118-1.514a4.21 4.21 0 0 1 3.675-1.941z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
              )}
            </svg>
          </button>
          <button onClick={handleToggleComments} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'currentColor' }}>
            <svg aria-label="Comment" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
        </div>
        
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
          {likeCount} likes
        </div>
        
        <div style={{ fontSize: '14px' }}>
          <span style={{ fontWeight: 600, marginRight: '8px' }}>
            {displayName}
          </span>
          {post.title}
        </div>
        
        {post.description && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {post.description}
          </div>
        )}

        {/* Comment Section Toggle */}
        <div 
          style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', cursor: 'pointer' }}
          onClick={handleToggleComments}
        >
          {showComments ? 'Hide comments' : 'View all comments'}
        </div>

        {/* Comments Box */}
        {showComments && (
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            {loadingComments ? (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading comments...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.length === 0 && <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No comments yet. Be the first!</div>}
                
                {comments.map((comment) => {
                  const commentUser = Array.isArray(comment.user) ? comment.user[0] : comment.user;
                  const commentDisplayName = commentUser?.user?.username || commentUser?.name || 'User';
                  
                  return (
                  <div key={comment.id || Math.random()} style={{ fontSize: '14px' }}>
                    <span style={{ fontWeight: 600, marginRight: '8px' }}>
                      {commentDisplayName}
                    </span>
                    {comment.comment}
                    
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span>{new Date(comment.created).toLocaleDateString()}</span>
                      <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comment.replies.map(reply => {
                          const replyUser = Array.isArray(reply.user) ? reply.user[0] : reply.user;
                          const replyDisplayName = replyUser?.user?.username || replyUser?.name || 'User';
                          
                          return (
                          <div key={reply.id || Math.random()} style={{ fontSize: '14px' }}>
                            <span style={{ fontWeight: 600, marginRight: '8px' }}>
                              {replyDisplayName}
                            </span>
                            {reply.reply}
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleAddReply(e, comment.id)} style={{ display: 'flex', marginTop: '8px', marginLeft: '24px' }}>
                        <input 
                          type="text" 
                          placeholder="Write a reply..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', outline: 'none', padding: '4px 0', fontSize: '14px' }}
                          autoFocus
                        />
                        <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', padding: '0 8px' }}>Post</button>
                      </form>
                    )}
                  </div>
                )})}
              </div>
            )}

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-color)', outline: 'none', fontSize: '14px' }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', opacity: newComment.trim() ? 1 : 0.5 }}>
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
