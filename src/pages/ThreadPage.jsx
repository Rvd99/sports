import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchForumThread, fetchForumReplies, createForumReply,
  likeForumThread, likeForumReply
} from '../api';
import UserHoverCard from '../components/UserHoverCard';
import './ThreadPage.css';

const LEAGUES = {
  nhl: { label: 'NHL', icon: '🏒', color: '#0066cc' },
  nba: { label: 'NBA', icon: '🏀', color: '#c8102e' },
  mlb: { label: 'MLB', icon: '⚾', color: '#002d72' },
  cfl: { label: 'CFL', icon: '🏈', color: '#e03a3e' },
  soccer: { label: 'Soccer', icon: '⚽', color: '#00a651' },
  cricket: { label: 'Cricket', icon: '🏏', color: '#00a8cc' },
  golf: { label: 'Golf', icon: '⛳', color: '#2e7d32' },
  tennis: { label: 'Tennis', icon: '🎾', color: '#f5a623' },
  ufc: { label: 'UFC', icon: '🥊', color: '#d4af37' },
  f1: { label: 'F1', icon: '🏎', color: '#e8002d' },
  olympics: { label: 'Olympics', icon: '🏅', color: '#0081c8' },
  general: { label: 'General', icon: '💬', color: '#7c3aed' },
  football: { label: 'Football', icon: '🏈', color: '#e8112d' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({ username, avatarUrl, size = 40 }) {
  const colors = ['#1e3a8a','#7c3aed','#0f766e','#b91c1c','#0369a1','#15803d','#b45309'];
  let h = 0;
  for (let i = 0; i < (username||'').length; i++) h = (h * 31 + username.charCodeAt(i)) & 0xffffffff;
  const bg = colors[Math.abs(h) % colors.length];
  if (avatarUrl) {
    return <img src={`http://localhost:5001${avatarUrl}`} alt={username} className="tp-avatar-img" style={{ width: size, height: size }} />;
  }
  return (
    <div className="tp-avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {(username||'?').slice(0,2).toUpperCase()}
    </div>
  );
}

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const replyRef = useRef(null);

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [threadLiked, setThreadLiked] = useState(false);
  const [likedReplies, setLikedReplies] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchForumThread(threadId),
      fetchForumReplies(threadId),
    ]).then(([t, r]) => {
      setThread(t);
      setReplies(r);
    }).catch(err => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [threadId]);

  async function handleThreadLike() {
    if (!user || !thread) return;
    try {
      const result = await likeForumThread(thread.id, user.id);
      setThread(prev => ({ ...prev, likes: result.likes }));
      setThreadLiked(result.liked);
    } catch {}
  }

  async function handleReplyLike(replyId) {
    if (!user) return;
    try {
      const result = await likeForumReply(replyId, user.id);
      setReplies(prev => prev.map(r => r.id === replyId ? { ...r, likes: result.likes } : r));
      setLikedReplies(prev => {
        const next = new Set(prev);
        result.liked ? next.add(replyId) : next.delete(replyId);
        return next;
      });
    } catch {}
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setPosting(true); setReplyError('');
    try {
      const reply = await createForumReply(thread.id, { userId: user.id, text: replyText });
      setReplies(prev => [...prev, reply]);
      setThread(prev => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
      setReplyText('');
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="tp-page">
        <div className="tp-container">
          <div className="tp-loading">
            <div className="tp-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="tp-page">
        <div className="tp-container">
          <div className="tp-error">
            <h2>Thread not found</h2>
            <p>{error || 'This thread may have been removed or is pending approval.'}</p>
            <Link to="/forums" className="tp-back-btn">← Back to Forums</Link>
          </div>
        </div>
      </div>
    );
  }

  const league = LEAGUES[thread.league] || { label: thread.league, icon: '💬', color: '#64748b' };

  return (
    <div className="tp-page">
      <div className="tp-container">

        {/* Breadcrumb */}
        <div className="tp-breadcrumb">
          <Link to="/forums" className="tp-breadcrumb__link">Fan Forums</Link>
          <span className="tp-breadcrumb__sep">›</span>
          <Link to={`/forums/${thread.league}`} className="tp-breadcrumb__link">
            {league.icon} {league.label}
          </Link>
          <span className="tp-breadcrumb__sep">›</span>
          <span className="tp-breadcrumb__current">{thread.title.length > 50 ? thread.title.slice(0,50)+'…' : thread.title}</span>
        </div>

        {/* Thread post */}
        <div className="tp-thread">
          {thread.pinned && <div className="tp-pinned">📌 Pinned Thread</div>}

          <div className="tp-thread__header">
            <span className="tp-league-tag" style={{ background: league.color }}>
              {league.icon} {league.label}
            </span>
            {thread.pinned && <span className="tp-pin-badge">📌 Pinned</span>}
          </div>

          <h1 className="tp-thread__title">{thread.title}</h1>

          <div className="tp-thread__author-row">
            <Avatar username={thread.username} avatarUrl={thread.avatarUrl} size={44} />
            <div className="tp-thread__author-info">
              <UserHoverCard userId={thread.userId} username={thread.username}>
                <span className="tp-username">{thread.username}</span>
              </UserHoverCard>
              <span className="tp-thread__time">{timeAgo(thread.createdAt)}</span>
            </div>
          </div>

          <div className="tp-thread__body">{thread.body}</div>

          <div className="tp-thread__actions">
            <button
              className={`tp-like-btn${threadLiked ? ' tp-like-btn--active' : ''}`}
              onClick={handleThreadLike}
              disabled={!user}
              title={user ? 'Like this thread' : 'Log in to like'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={threadLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {thread.likes} {thread.likes === 1 ? 'Like' : 'Likes'}
            </button>
            <span className="tp-reply-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {thread.replyCount} {thread.replyCount === 1 ? 'Reply' : 'Replies'}
            </span>
            {user && (
              <button className="tp-reply-shortcut" onClick={() => replyRef.current?.focus()}>
                ↩ Reply
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="tp-replies">
            <div className="tp-replies__header">
              <span className="tp-replies__bar" />
              <h2 className="tp-replies__title">Replies</h2>
              <span className="tp-replies__count">{replies.length}</span>
            </div>

            <div className="tp-replies__list">
              {replies.map((reply, idx) => (
                <div key={reply.id} className="tp-reply" id={`reply-${reply.id}`}>
                  <div className="tp-reply__num">#{idx + 1}</div>
                  <Avatar username={reply.username} avatarUrl={reply.avatarUrl} size={36} />
                  <div className="tp-reply__body">
                    <div className="tp-reply__meta">
                      <UserHoverCard userId={reply.userId} username={reply.username}>
                        <span className="tp-username">{reply.username}</span>
                      </UserHoverCard>
                      <span className="tp-reply__time">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="tp-reply__text">{reply.text}</p>
                    <button
                      className={`tp-reply-like${likedReplies.has(reply.id) ? ' tp-reply-like--active' : ''}`}
                      onClick={() => handleReplyLike(reply.id)}
                      disabled={!user}
                      title={user ? 'Like' : 'Log in to like'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={likedReplies.has(reply.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {reply.likes > 0 && reply.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        <div className="tp-reply-form-wrap">
          <div className="tp-replies__header">
            <span className="tp-replies__bar" />
            <h2 className="tp-replies__title">Leave a Reply</h2>
          </div>

          {user ? (
            <form className="tp-reply-form" onSubmit={handleReply}>
              <div className="tp-reply-form__top">
                <Avatar username={user.username || user.name} avatarUrl={null} size={36} />
                <textarea
                  ref={replyRef}
                  className="tp-reply-form__input"
                  placeholder="Share your thoughts on this thread…"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
              </div>
              <div className="tp-reply-form__footer">
                <span className="tp-reply-form__count">{replyText.length}/1000</span>
                <button
                  type="submit"
                  className="tp-submit-btn"
                  disabled={posting || !replyText.trim()}
                >
                  {posting ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
              {replyError && <p className="tp-reply-error">{replyError}</p>}
            </form>
          ) : (
            <div className="tp-login-prompt">
              🔒 <strong>Log in</strong> to join the conversation and post replies.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
