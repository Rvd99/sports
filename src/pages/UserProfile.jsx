import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, fetchUserComments, fetchUserPredictions, fetchPolls, votePoll, getMyVote, uploadAvatar } from '../api';
import './UserProfile.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PredictionBadge({ pct }) {
  if (pct === null) return <span className="pred-badge pred-badge--none">No data yet</span>;
  const cls = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
  return <span className={`pred-badge pred-badge--${cls}`}>{pct}% correct</span>;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [activePolls, setActivePolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [voting, setVoting] = useState({});
  const [voteError, setVoteError] = useState({});
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchUserProfile(user.id),
      fetchUserComments(user.id),
      fetchUserPredictions(user.id),
      fetchPolls({ active: true }),
    ]).then(([prof, coms, preds, polls]) => {
      setProfile(prof);
      setComments(coms);
      setPredictions(preds);
      setActivePolls(polls.filter(p => p.active));
      // check existing votes on active polls
      polls.filter(p => p.active).forEach(poll => {
        getMyVote(poll.id, user.id).then(r => {
          if (r.userVote) setUserVotes(prev => ({ ...prev, [poll.id]: r.userVote }));
        }).catch(() => {});
      });
    }).catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarError('Max 2MB allowed'); return; }
    setAvatarUploading(true);
    setAvatarError('');
    try {
      const result = await uploadAvatar(user.id, file);
      setAvatarUrl(result.avatarUrl);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function handleVote(pollId, optionId) {
    if (!user || voting[pollId]) return;
    setVoting(prev => ({ ...prev, [pollId]: true }));
    setVoteError(prev => ({ ...prev, [pollId]: '' }));
    try {
      const updated = await votePoll(pollId, optionId, user.id);
      setActivePolls(prev => prev.map(p => p.id === pollId ? { ...updated } : p));
      setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
    } catch (err) {
      setVoteError(prev => ({ ...prev, [pollId]: err.message }));
    } finally {
      setVoting(prev => ({ ...prev, [pollId]: false }));
    }
  }

  if (!user) {
    return (
      <div className="user-profile user-profile--guest">
        <div className="user-profile__guest-card">
          <div className="user-profile__guest-icon">👤</div>
          <h2>You're not logged in</h2>
          <p>Log in to view your profile, predictions, and comment history.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="user-profile user-profile--loading"><div className="up-spinner" /></div>;
  if (error) return <div className="user-profile user-profile--error"><p>{error}</p></div>;

  const stats = profile?.stats || {};

  return (
    <div className="user-profile">
      <div className="user-profile__hero">
        <div className="user-profile__avatar-wrap">
          <div className="user-profile__avatar">
            {(avatarUrl || profile?.avatarUrl)
              ? <img src={avatarUrl || profile?.avatarUrl} alt={user.username} className="user-profile__avatar-img" />
              : (user.avatar || user.username?.slice(0,2).toUpperCase())
            }
          </div>
          <label className="user-profile__avatar-edit" title="Change avatar (max 2MB)">
            {avatarUploading ? '⏳' : '📷'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="user-profile__avatar-input"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
          {avatarError && <span className="user-profile__avatar-error">{avatarError}</span>}
        </div>
        <div className="user-profile__info">
          <h1 className="user-profile__name">{user.username || user.name}</h1>
          <p className="user-profile__role">{user.role === 'admin' ? '⚡ Admin' : user.role === 'editor' ? '✏️ Editor' : '🎯 Sports Fan'}</p>
          <div className="user-profile__badges">
            <PredictionBadge pct={stats.predictionPct} />
            <span className="up-badge">{stats.totalComments || 0} comments</span>
            <span className="up-badge">👍 {stats.totalLikes || 0}</span>
            <span className="up-badge">👎 {stats.totalDislikes || 0}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="user-profile__stats">
        <div className="up-stat">
          <span className="up-stat__val">{stats.predictionPct !== null && stats.predictionPct !== undefined ? `${stats.predictionPct}%` : '—'}</span>
          <span className="up-stat__label">Prediction %</span>
        </div>
        <div className="up-stat">
          <span className="up-stat__val">{stats.correctPredictions || 0}/{stats.totalPredictions || 0}</span>
          <span className="up-stat__label">Correct</span>
        </div>
        <div className="up-stat">
          <span className="up-stat__val">{stats.pendingPredictions || 0}</span>
          <span className="up-stat__label">Pending</span>
        </div>
        <div className="up-stat">
          <span className="up-stat__val">{stats.totalComments || 0}</span>
          <span className="up-stat__label">Comments</span>
        </div>
        <div className="up-stat">
          <span className="up-stat__val">{stats.totalLikes || 0}</span>
          <span className="up-stat__label">Likes received</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-profile__tabs">
        {['overview', 'polls', 'predictions', 'comments'].map(t => (
          <button
            key={t}
            className={`up-tab${tab === t ? ' up-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' && '🏠 Overview'}
            {t === 'polls' && `📊 Vote Now (${activePolls.length})`}
            {t === 'predictions' && `🎯 Predictions (${predictions.length})`}
            {t === 'comments' && `💬 My Comments (${comments.length})`}
          </button>
        ))}
      </div>

      <div className="user-profile__body">

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="up-overview">
            <div className="up-overview__col">
              <h3 className="up-section-title">Recent Comments</h3>
              {comments.length === 0 ? (
                <p className="up-empty">No comments yet.</p>
              ) : (
                <div className="up-comment-list">
                  {comments.slice(0, 5).map(c => (
                    <Link key={c.id} to={`/article/${c.articleSlug}`} className="up-comment-item">
                      <p className="up-comment-item__text">"{c.text}"</p>
                      <span className="up-comment-item__meta">
                        {c.articleSlug.replace(/-/g, ' ')} · {timeAgo(c.createdAt)} · 👍 {c.likes || 0}
                      </span>
                    </Link>
                  ))}
                  {comments.length > 5 && (
                    <button className="up-view-all" onClick={() => setTab('comments')}>
                      View all {comments.length} comments →
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="up-overview__col">
              <h3 className="up-section-title">Recent Predictions</h3>
              {predictions.length === 0 ? (
                <p className="up-empty">No predictions yet. Vote in polls to build your record!</p>
              ) : (
                <div className="up-pred-list">
                  {predictions.slice(0, 5).map(p => (
                    <div key={p.id} className={`up-pred-item up-pred-item--${p.isCorrect === true ? 'correct' : p.isCorrect === false ? 'wrong' : 'pending'}`}>
                      <span className="up-pred-item__status">
                        {p.isCorrect === true ? '✅' : p.isCorrect === false ? '❌' : '⏳'}
                      </span>
                      <div className="up-pred-item__body">
                        <p className="up-pred-item__q">{p.question}</p>
                        <p className="up-pred-item__answer">
                          Your pick: <strong>{p.userVoteText}</strong>
                          {p.correctOptionText && p.isCorrect === false && (
                            <> · Correct: <strong>{p.correctOptionText}</strong></>
                          )}
                          {p.isCorrect === null && <em className="up-pred-item__pending"> · Pending result</em>}
                        </p>
                      </div>
                    </div>
                  ))}
                  {predictions.length > 5 && (
                    <button className="up-view-all" onClick={() => setTab('predictions')}>
                      View all {predictions.length} predictions →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* POLLS TAB */}
        {tab === 'polls' && (
          <div className="up-polls">
            {activePolls.length === 0 ? (
              <p className="up-empty">No active polls right now. Check back soon!</p>
            ) : (
              activePolls.map(poll => {
                const voted = userVotes[poll.id] != null;
                const total = poll.totalVotes || 1;
                return (
                  <div key={poll.id} className="up-poll-card">
                    <div className="up-poll-card__header">
                      <span className="up-poll-card__live">LIVE POLL</span>
                      {poll.category && <span className="up-poll-card__cat">{poll.category}</span>}
                    </div>
                    <p className="up-poll-card__q">{poll.question}</p>
                    <div className="up-poll-card__options">
                      {poll.options.map(opt => {
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        const isVoted = userVotes[poll.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            className={`up-poll-opt${voted ? ' up-poll-opt--result' : ''}${isVoted ? ' up-poll-opt--mine' : ''}`}
                            onClick={() => !voted && handleVote(poll.id, opt.id)}
                            disabled={voted || voting[poll.id]}
                          >
                            <div className="up-poll-opt__top">
                              <span>{opt.text}</span>
                              {voted && <span className="up-poll-opt__pct">{pct}%</span>}
                              {isVoted && <span className="up-poll-opt__check">✓</span>}
                            </div>
                            {voted && (
                              <div className="up-poll-opt__bar-wrap">
                                <div className={`up-poll-opt__bar${isVoted ? ' up-poll-opt__bar--mine' : ''}`} style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {voteError[poll.id] && <p className="up-poll-card__error">{voteError[poll.id]}</p>}
                    <p className="up-poll-card__footer">{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PREDICTIONS TAB */}
        {tab === 'predictions' && (
          <div className="up-predictions">
            {predictions.length === 0 ? (
              <p className="up-empty">You haven't voted in any polls yet.</p>
            ) : (
              <>
                <div className="up-predictions__summary">
                  <span>Total: <strong>{predictions.length}</strong></span>
                  <span>Correct: <strong className="up-correct">{predictions.filter(p => p.isCorrect === true).length}</strong></span>
                  <span>Wrong: <strong className="up-wrong">{predictions.filter(p => p.isCorrect === false).length}</strong></span>
                  <span>Pending: <strong>{predictions.filter(p => p.isCorrect === null).length}</strong></span>
                </div>
                {predictions.map(p => (
                  <div key={p.id} className={`up-pred-card up-pred-card--${p.isCorrect === true ? 'correct' : p.isCorrect === false ? 'wrong' : 'pending'}`}>
                    <span className="up-pred-card__icon">
                      {p.isCorrect === true ? '✅' : p.isCorrect === false ? '❌' : '⏳'}
                    </span>
                    <div className="up-pred-card__body">
                      <p className="up-pred-card__q">{p.question}</p>
                      <p className="up-pred-card__detail">
                        Your pick: <strong>{p.userVoteText}</strong>
                        {p.correctOptionText && p.isCorrect === false && (
                          <> · Correct answer: <strong>{p.correctOptionText}</strong></>
                        )}
                      </p>
                      {p.isCorrect === null && (
                        <p className="up-pred-card__pending">Result pending — admin hasn't marked the correct answer yet</p>
                      )}
                      {p.category && <span className="up-pred-card__cat">{p.category}</span>}
                    </div>
                    <span className="up-pred-card__date">{timeAgo(p.createdAt)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* COMMENTS TAB */}
        {tab === 'comments' && (
          <div className="up-comments">
            {comments.length === 0 ? (
              <p className="up-empty">No comments yet. Join the conversation on an article!</p>
            ) : (
              comments.map(c => (
                <a key={c.id} href={`/article/${c.articleSlug}#comment-${c.id}`} className="up-comment-card">
                  <div className="up-comment-card__body">
                    <p className="up-comment-card__text">"{c.text}"</p>
                    <div className="up-comment-card__meta">
                      <span className="up-comment-card__article">{c.articleSlug.replace(/-/g, ' ')}</span>
                      <span className="up-comment-card__time">{timeAgo(c.createdAt)}</span>
                      <span className="up-comment-card__likes">👍 {c.likes || 0}</span>
                      {(c.dislikes || 0) > 0 && <span className="up-comment-card__dislikes">👎 {c.dislikes}</span>}
                    </div>
                  </div>
                  <span className="up-comment-card__arrow">→</span>
                </a>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
