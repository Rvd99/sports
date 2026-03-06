import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchUserProfile } from '../api';
import './UserHoverCard.css';

const BANNER_COLORS = ['#1e3a8a','#7c3aed','#0f766e','#b91c1c','#0369a1','#15803d','#b45309'];
function bannerColor(username) {
  let h = 0;
  for (let i = 0; i < (username || '').length; i++) h = (h * 31 + username.charCodeAt(i)) & 0xffffffff;
  return BANNER_COLORS[Math.abs(h) % BANNER_COLORS.length];
}

function PredPill({ pct }) {
  if (pct === null || pct === undefined) {
    return <span className="uhc-pill uhc-pill--none">🎯 No predictions yet</span>;
  }
  const cls = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
  const icon = pct >= 70 ? '🔥' : pct >= 40 ? '🎯' : '📉';
  return <span className={`uhc-pill uhc-pill--${cls}`}>{icon} {pct}% Prediction Accuracy</span>;
}

export default function UserHoverCard({ userId, username, children }) {
  const [profile, setProfile] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, flip: false });
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const fetchedRef = useRef(false);
  const color = bannerColor(username);

  function showCard() {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const CARD_H = 270;
    const CARD_W = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < CARD_H + 10 && rect.top > CARD_H;
    const rawLeft = rect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - CARD_W - 8));
    const top = flip ? rect.top - CARD_H - 8 : rect.bottom + 6;
    setPos({ top, left, flip });
    setVisible(true);

    if (!fetchedRef.current && userId) {
      fetchedRef.current = true;
      setLoading(true);
      fetchUserProfile(userId)
        .then(data => { setProfile(data); setLoading(false); })
        .catch(() => { setProfile(null); setLoading(false); });
    }
  }

  function handleMouseEnter() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(showCard, 300);
  }

  function handleMouseLeave() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 200);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const cardContent = (
    <div
      className={`uhc-card${pos.flip ? ' uhc-card--flip' : ''}`}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999 }}
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <div className="uhc-loading">
          <div className="uhc-spinner" />
          <span className="uhc-loading-text">Loading profile…</span>
        </div>
      ) : profile ? (
        <>
          <div className="uhc-banner" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}66)` }} />
          <div className="uhc-avatar-wrap">
            {profile.avatarUrl ? (
              <img src={`http://localhost:5001${profile.avatarUrl}`} alt={profile.username} className="uhc-avatar uhc-avatar--img" />
            ) : (
              <div className="uhc-avatar" style={{ background: color }}>
                {(profile.username || username || '?').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="uhc-body">
            <div className="uhc-name-row">
              <span className="uhc-username">{profile.username}</span>
              {profile.role && profile.role !== 'user' && (
                <span className={`uhc-role-badge uhc-role-badge--${profile.role}`}>
                  {profile.role === 'admin' ? '⚡ Admin' : '✏️ Editor'}
                </span>
              )}
            </div>
            <PredPill pct={profile.stats?.predictionPct} />
            <div className="uhc-stats-row">
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">👍</span>
                <span className="uhc-stat-num">{profile.stats?.totalLikes ?? 0}</span>
                <span className="uhc-stat-lbl">Likes</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">👎</span>
                <span className="uhc-stat-num">{profile.stats?.totalDislikes ?? 0}</span>
                <span className="uhc-stat-lbl">Dislikes</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">💬</span>
                <span className="uhc-stat-num">{profile.stats?.totalComments ?? 0}</span>
                <span className="uhc-stat-lbl">Comments</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">🎯</span>
                <span className="uhc-stat-num">
                  {profile.stats?.totalPredictions ?? 0}
                </span>
                <span className="uhc-stat-lbl">Predictions</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="uhc-banner" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}44)` }} />
          <div className="uhc-avatar-wrap">
            <div className="uhc-avatar" style={{ background: color }}>
              {(username || '?').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="uhc-body">
            <div className="uhc-name-row">
              <span className="uhc-username">{username}</span>
            </div>
            <span className="uhc-pill uhc-pill--none">🎯 No predictions yet</span>
            <div className="uhc-stats-row">
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">👍</span>
                <span className="uhc-stat-num">0</span>
                <span className="uhc-stat-lbl">Likes</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">👎</span>
                <span className="uhc-stat-num">0</span>
                <span className="uhc-stat-lbl">Dislikes</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">💬</span>
                <span className="uhc-stat-num">0</span>
                <span className="uhc-stat-lbl">Comments</span>
              </div>
              <div className="uhc-stat-sep" />
              <div className="uhc-stat-item">
                <span className="uhc-stat-icon">🎯</span>
                <span className="uhc-stat-num">0</span>
                <span className="uhc-stat-lbl">Predictions</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <span
      className="uhc-trigger"
      ref={wrapRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && createPortal(cardContent, document.body)}
    </span>
  );
}
