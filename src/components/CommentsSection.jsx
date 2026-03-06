import { useState, useEffect, useRef } from 'react';
import { fetchComments, postComment, likeComment, dislikeComment } from '../api';
import { useAuth } from '../contexts/AuthContext';
import UserHoverCard from './UserHoverCard';
import './CommentsSection.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentsSection({ articleSlug }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [likedSet, setLikedSet] = useState(new Set());
  const [dislikedSet, setDislikedSet] = useState(new Set());

  useEffect(() => {
    if (!articleSlug) return;
    fetchComments(articleSlug).then(data => {
      setComments(data);
      // scroll to deep-linked comment after render
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        setTimeout(() => {
          const el = document.getElementById(hash.slice(1));
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('comment--highlight');
            setTimeout(() => el.classList.remove('comment--highlight'), 2500);
          }
        }, 300);
      }
    }).catch(() => {});
  }, [articleSlug]);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setPosting(true);
    setError('');
    try {
      const newComment = await postComment({ articleSlug, userId: user.id, text });
      setComments(prev => [newComment, ...prev]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(commentId) {
    if (!user) return;
    try {
      const result = await likeComment(commentId, user.id);
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, likes: result.likes } : c)
      );
      setLikedSet(prev => {
        const next = new Set(prev);
        result.liked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      if (result.liked) {
        setDislikedSet(prev => { const n = new Set(prev); n.delete(commentId); return n; });
      }
    } catch {}
  }

  async function handleDislike(commentId) {
    if (!user) return;
    try {
      const result = await dislikeComment(commentId, user.id);
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, likes: result.likes, dislikes: result.dislikes } : c)
      );
      setDislikedSet(prev => {
        const next = new Set(prev);
        result.disliked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      if (result.disliked) {
        setLikedSet(prev => { const n = new Set(prev); n.delete(commentId); return n; });
      }
    } catch {}
  }

  return (
    <div className="comments-section">
      <div className="comments-section__header">
        <span className="comments-section__bar" />
        <h3 className="comments-section__title">Comments</h3>
        <span className="comments-section__count">{comments.length}</span>
      </div>

      {/* Post form */}
      {user ? (
        <form className="comments-section__form" onSubmit={handlePost}>
          <div className="comments-section__form-avatar">{user.name ? user.name.slice(0,2).toUpperCase() : user.email.slice(0,2).toUpperCase()}</div>
          <div className="comments-section__form-right">
            <textarea
              className="comments-section__textarea"
              placeholder="Share your thoughts on this story…"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="comments-section__form-actions">
              <span className="comments-section__char-count">{text.length}/500</span>
              <button
                type="submit"
                className="comments-section__submit"
                disabled={posting || !text.trim()}
              >
                {posting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
            {error && <p className="comments-section__error">{error}</p>}
          </div>
        </form>
      ) : (
        <div className="comments-section__login-prompt">
          <span>🔒</span>
          <span>
            <strong>Log in</strong> to join the conversation and post comments.
          </span>
        </div>
      )}

      {/* Comments list */}
      <div className="comments-section__list">
        {comments.length === 0 ? (
          <p className="comments-section__empty">Be the first to comment on this story.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} id={`comment-${c.id}`} className="comment">
              <div className="comment__avatar">
                {c.avatarUrl
                  ? <img src={c.avatarUrl} alt={c.username} className="comment__avatar-img" />
                  : (c.username || 'U').slice(0,2).toUpperCase()
                }
              </div>
              <div className="comment__body">
                <div className="comment__meta">
                  <UserHoverCard userId={c.userId} username={c.username}>
                    <span className="comment__username">{c.username}</span>
                  </UserHoverCard>
                  <span className="comment__time">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="comment__text">{c.text}</p>
                <div className="comment__actions">
                  <button
                    className={`comment__like${likedSet.has(c.id) ? ' comment__like--active' : ''}`}
                    onClick={() => handleLike(c.id)}
                    disabled={!user}
                    title="Like"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={likedSet.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {c.likes > 0 && <span>{c.likes}</span>}
                  </button>
                  <button
                    className={`comment__dislike${dislikedSet.has(c.id) ? ' comment__dislike--active' : ''}`}
                    onClick={() => handleDislike(c.id)}
                    disabled={!user}
                    title="Dislike"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={dislikedSet.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                    {(c.dislikes || 0) > 0 && <span>{c.dislikes}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
