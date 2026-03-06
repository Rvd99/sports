import { useState, useEffect } from 'react';
import { fetchPolls, votePoll, getMyVote } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './PollWidget.css';

export default function PollWidget({ position = 'above-twitter' }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [voting, setVoting] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    fetchPolls({ sidebar: true, active: true })
      .then(data => {
        const filtered = data.filter(p => p.sidebarPosition === position);
        setPolls(filtered);
        if (user) {
          filtered.forEach(poll => {
            getMyVote(poll.id, user.id).then(r => {
              if (r.userVote) {
                setUserVotes(prev => ({ ...prev, [poll.id]: r.userVote }));
              }
            }).catch(() => {});
          });
        }
      })
      .catch(() => {});
  }, [user, position]);

  async function handleVote(pollId, optionId) {
    if (!user) {
      setError(prev => ({ ...prev, [pollId]: 'Log in to vote' }));
      return;
    }
    if (voting[pollId]) return;
    setVoting(prev => ({ ...prev, [pollId]: true }));
    setError(prev => ({ ...prev, [pollId]: '' }));
    try {
      const updated = await votePoll(pollId, optionId, user.id);
      setPolls(prev => prev.map(p => p.id === pollId ? { ...updated } : p));
      setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
    } catch (err) {
      setError(prev => ({ ...prev, [pollId]: err.message }));
    } finally {
      setVoting(prev => ({ ...prev, [pollId]: false }));
    }
  }

  if (polls.length === 0) return null;

  return (
    <>
      {polls.map(poll => {
        const voted = userVotes[poll.id] != null;
        const total = poll.totalVotes || 1;
        return (
          <div key={poll.id} className="poll-widget">
            <div className="poll-widget__header">
              <span className="poll-widget__icon">📊</span>
              <span className="poll-widget__label">Live Poll</span>
              {poll.active ? (
                <span className="poll-widget__badge poll-widget__badge--live">LIVE</span>
              ) : (
                <span className="poll-widget__badge poll-widget__badge--closed">CLOSED</span>
              )}
            </div>
            <p className="poll-widget__question">{poll.question}</p>
            <div className="poll-widget__options">
              {poll.options.map(opt => {
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                const isVoted = userVotes[poll.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`poll-widget__option${voted ? ' poll-widget__option--result' : ''}${isVoted ? ' poll-widget__option--mine' : ''}`}
                    onClick={() => !voted && handleVote(poll.id, opt.id)}
                    disabled={voted || voting[poll.id]}
                  >
                    <div className="poll-widget__option-top">
                      <span className="poll-widget__option-text">{opt.text}</span>
                      {voted && <span className="poll-widget__option-pct">{pct}%</span>}
                      {isVoted && <span className="poll-widget__option-check">✓</span>}
                    </div>
                    {voted && (
                      <div className="poll-widget__bar-wrap">
                        <div
                          className={`poll-widget__bar${isVoted ? ' poll-widget__bar--mine' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {error[poll.id] && (
              <p className="poll-widget__error">{error[poll.id]}</p>
            )}
            <div className="poll-widget__footer">
              <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
              {!user && <span className="poll-widget__login-hint">Log in to vote</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}
