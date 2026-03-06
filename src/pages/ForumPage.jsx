import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchForumThreads, createForumThread, likeForumThread } from '../api';
import './ForumPage.css';

const LEAGUES = [
  { id: 'all',      label: 'All',      icon: '🌐', color: '#64748b' },
  { id: 'nhl',      label: 'NHL',      icon: '🏒', color: '#0066cc' },
  { id: 'nba',      label: 'NBA',      icon: '🏀', color: '#c8102e' },
  { id: 'mlb',      label: 'MLB',      icon: '⚾', color: '#002d72' },
  { id: 'cfl',      label: 'CFL',      icon: '🏈', color: '#e03a3e' },
  { id: 'soccer',   label: 'Soccer',   icon: '⚽', color: '#00a651' },
  { id: 'cricket',  label: 'Cricket',  icon: '🏏', color: '#00a8cc' },
  { id: 'golf',     label: 'Golf',     icon: '⛳', color: '#2e7d32' },
  { id: 'tennis',   label: 'Tennis',   icon: '🎾', color: '#f5a623' },
  { id: 'ufc',      label: 'UFC',      icon: '🥊', color: '#d4af37' },
  { id: 'f1',       label: 'F1',       icon: '🏎', color: '#e8002d' },
  { id: 'olympics', label: 'Olympics', icon: '🏅', color: '#0081c8' },
  { id: 'general',  label: 'General',  icon: '💬', color: '#7c3aed' },
];

const SORTS = [
  { id: 'latest',       label: 'Latest' },
  { id: 'popular',      label: 'Popular' },
  { id: 'most-replied', label: 'Most Replied' },
];

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

function Avatar({ username, avatarUrl, size = 36 }) {
  const color = ['#1e3a8a','#7c3aed','#0f766e','#b91c1c','#0369a1','#15803d','#b45309'];
  let h = 0;
  for (let i = 0; i < (username||'').length; i++) h = (h * 31 + username.charCodeAt(i)) & 0xffffffff;
  const bg = color[Math.abs(h) % color.length];
  if (avatarUrl) return <img src={`http://localhost:5001${avatarUrl}`} alt={username} className="forum-avatar-img" style={{ width: size, height: size }} />;
  return <div className="forum-avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>{(username||'?').slice(0,2).toUpperCase()}</div>;
}

export default function ForumPage() {
  const { leagueId = 'all' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [likedSet, setLikedSet] = useState(new Set());
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newLeague, setNewLeague] = useState(leagueId === 'all' ? 'general' : leagueId);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  const activeLeague = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];

  useEffect(() => {
    setLoading(true);
    fetchForumThreads({ league: leagueId, sort })
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [leagueId, sort]);

  async function handleLike(e, threadId) {
    e.preventDefault();
    if (!user) return;
    try {
      const result = await likeForumThread(threadId, user.id);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, likes: result.likes } : t));
      setLikedSet(prev => {
        const next = new Set(prev);
        result.liked ? next.add(threadId) : next.delete(threadId);
        return next;
      });
    } catch {}
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!user) return;
    setPosting(true); setPostError(''); setPostSuccess('');
    try {
      const thread = await createForumThread({ league: newLeague, title: newTitle, body: newBody, userId: user.id });
      setNewTitle(''); setNewBody('');
      setShowNewThread(false);
      if (thread.status === 'approved') {
        setThreads(prev => [thread, ...prev]);
        setPostSuccess('Thread posted!');
      } else {
        setPostSuccess('Thread submitted! It will appear once approved by an admin.');
      }
      setTimeout(() => setPostSuccess(''), 4000);
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="forum-page">
      {/* Header */}
      <div className="forum-header">
        <div className="forum-header__inner">
          <div className="forum-header__title-row">
            <span className="forum-header__icon">💬</span>
            <div>
              <h1 className="forum-header__title">Fan Forums</h1>
              <p className="forum-header__sub">Discuss, debate, and connect with sports fans</p>
            </div>
          </div>
          {user && (
            <button className="forum-btn forum-btn--new" onClick={() => setShowNewThread(v => !v)}>
              {showNewThread ? '✕ Cancel' : '+ New Thread'}
            </button>
          )}
        </div>
      </div>

      <div className="forum-layout">
        {/* League sidebar */}
        <aside className="forum-sidebar">
          <div className="forum-sidebar__label">Leagues</div>
          {LEAGUES.map(l => (
            <Link
              key={l.id}
              to={l.id === 'all' ? '/forums' : `/forums/${l.id}`}
              className={`forum-sidebar__item${l.id === leagueId ? ' forum-sidebar__item--active' : ''}`}
              style={l.id === leagueId ? { '--league-col': l.color } : {}}
            >
              <span className="forum-sidebar__icon">{l.icon}</span>
              <span className="forum-sidebar__name">{l.label}</span>
              {l.id === leagueId && <span className="forum-sidebar__dot" style={{ background: l.color }} />}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="forum-main">
          {/* New thread form */}
          {showNewThread && user && (
            <div className="forum-new-thread">
              <h3 className="forum-new-thread__title">Start a New Thread</h3>
              <form onSubmit={handlePost} className="forum-new-thread__form">
                <div className="forum-new-thread__row">
                  <select
                    className="forum-select"
                    value={newLeague}
                    onChange={e => setNewLeague(e.target.value)}
                    required
                  >
                    {LEAGUES.filter(l => l.id !== 'all').map(l => (
                      <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                    ))}
                  </select>
                </div>
                <input
                  className="forum-input"
                  placeholder="Thread title (5–120 characters)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  maxLength={120}
                  required
                />
                <textarea
                  className="forum-textarea"
                  placeholder="Share your thoughts… (10–2000 characters)"
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  required
                />
                <div className="forum-new-thread__footer">
                  <span className="forum-new-thread__hint">
                    ⚠️ Threads require admin approval before appearing publicly.
                  </span>
                  <button type="submit" className="forum-btn forum-btn--submit" disabled={posting}>
                    {posting ? 'Posting…' : 'Submit Thread'}
                  </button>
                </div>
                {postError && <p className="forum-error">{postError}</p>}
              </form>
            </div>
          )}

          {postSuccess && <div className="forum-success">{postSuccess}</div>}

          {/* Toolbar */}
          <div className="forum-toolbar">
            <div className="forum-toolbar__left">
              <span className="forum-toolbar__league-badge" style={{ background: activeLeague.color }}>
                {activeLeague.icon} {activeLeague.label}
              </span>
              <span className="forum-toolbar__count">{threads.length} thread{threads.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="forum-toolbar__sorts">
              {SORTS.map(s => (
                <button
                  key={s.id}
                  className={`forum-sort-btn${sort === s.id ? ' forum-sort-btn--active' : ''}`}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thread list */}
          {loading ? (
            <div className="forum-loading">
              {[1,2,3,4,5].map(i => <div key={i} className="forum-skeleton" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="forum-empty">
              <div className="forum-empty__icon">💬</div>
              <p>No threads yet for this league.</p>
              {user
                ? <button className="forum-btn forum-btn--new" onClick={() => setShowNewThread(true)}>Be the first — Start a Thread</button>
                : <p className="forum-empty__sub">Log in to start the conversation.</p>
              }
            </div>
          ) : (
            <div className="forum-thread-list">
              {threads.map(t => {
                const league = LEAGUES.find(l => l.id === t.league) || LEAGUES[0];
                return (
                  <Link key={t.id} to={`/forums/thread/${t.id}`} className="forum-thread-card">
                    {t.pinned && <span className="forum-thread-card__pin">📌 Pinned</span>}
                    <div className="forum-thread-card__main">
                      <Avatar username={t.username} avatarUrl={t.avatarUrl} size={40} />
                      <div className="forum-thread-card__content">
                        <div className="forum-thread-card__meta">
                          <span className="forum-thread-card__league-tag" style={{ background: league.color }}>
                            {league.icon} {league.label}
                          </span>
                          <span className="forum-thread-card__author">{t.username}</span>
                          <span className="forum-thread-card__time">{timeAgo(t.createdAt)}</span>
                        </div>
                        <h3 className="forum-thread-card__title">{t.title}</h3>
                        <p className="forum-thread-card__preview">{t.body.length > 120 ? t.body.slice(0,120) + '…' : t.body}</p>
                      </div>
                    </div>
                    <div className="forum-thread-card__stats">
                      <button
                        className={`forum-thread-card__stat forum-thread-card__like${likedSet.has(t.id) ? ' forum-thread-card__like--active' : ''}`}
                        onClick={e => handleLike(e, t.id)}
                        title={user ? 'Like this thread' : 'Log in to like'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={likedSet.has(t.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {t.likes}
                      </button>
                      <span className="forum-thread-card__stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {t.replyCount}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!user && (
            <div className="forum-login-banner">
              🔒 <strong>Log in</strong> to start threads and join the conversation.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
