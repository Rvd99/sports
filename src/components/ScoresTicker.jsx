import { useState, useEffect } from 'react';
import { fetchLiveScores } from '../api';
import './ScoresTicker.css';

const FALLBACK_SCORES = [
  { id: 1, league: 'NBA', home: 'LAL', homeScore: 0, away: 'GSW', awayScore: 0, status: 'Scheduled', homeColor: '#552583', awayColor: '#1d428a', upcoming: true },
  { id: 2, league: 'NBA', home: 'BOS', homeScore: 0, away: 'MIA', awayScore: 0, status: 'Scheduled', homeColor: '#007a33', awayColor: '#98002e', upcoming: true },
  { id: 3, league: 'CRICKET', home: 'IND', homeScore: 0, away: 'AUS', awayScore: 0, status: 'Scheduled', homeColor: '#1e3a8a', awayColor: '#991b1b', upcoming: true },
  { id: 4, league: 'CRICKET', home: 'ENG', homeScore: 0, away: 'PAK', awayScore: 0, status: 'Scheduled', homeColor: '#1e3a8a', awayColor: '#991b1b', upcoming: true },
];

export default function ScoresTicker({ scores = [], loading = false }) {
  const [liveScores, setLiveScores] = useState([]);

  useEffect(() => {
    const loadLiveScores = async () => {
      console.log('🎯 ScoresTicker: Fetching live scores...');
      const data = await fetchLiveScores();
      if (data) {
        console.log('✅ ScoresTicker: Received live scores:', data);
        setLiveScores(data);
      }
    };
    loadLiveScores();
    // Refresh every 30 seconds
    const interval = setInterval(loadLiveScores, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayScores = liveScores.length > 0
    ? liveScores.map(s => ({ ...s, league: (s.league || '').toUpperCase() }))
    : (scores.length > 0
      ? scores.map(s => ({ ...s, league: (s.league || '').toUpperCase() }))
      : FALLBACK_SCORES);

  const doubled = [...displayScores, ...displayScores];

  return (
    <div className="ticker">
      <div className="ticker__label">
        <span className="ticker__label-live">● LIVE</span>
        <span className="ticker__label-scores">SCORES</span>
      </div>
      <div className="ticker__scroll-wrap">
        <div className="ticker__track" style={{ animationPlayState: loading ? 'paused' : 'running' }}>
          {doubled.map((game, idx) => (
            <ScoreCard key={`${game.id}-${idx}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ game }) {
  const showScore = game.live || (!game.upcoming && game.homeScore !== undefined);
  return (
    <a
      href="#"
      className={`ticker__card${game.live ? ' ticker__card--live' : ''}${game.upcoming ? ' ticker__card--upcoming' : ''}`}
    >
      <div className="ticker__league">{game.league}</div>
      <div className="ticker__teams">
        <div className="ticker__team">
          <span className="ticker__team-dot" style={{ background: game.awayColor || '#555' }} />
          <span className="ticker__team-name">{game.away}</span>
          {showScore && <span className="ticker__score">{game.awayScore}</span>}
        </div>
        <div className="ticker__team">
          <span className="ticker__team-dot" style={{ background: game.homeColor || '#555' }} />
          <span className="ticker__team-name">{game.home}</span>
          {showScore && <span className="ticker__score">{game.homeScore}</span>}
        </div>
      </div>
      <div className={`ticker__status${game.live ? ' ticker__status--live' : ''}${game.upcoming ? ' ticker__status--upcoming' : ''}`}>
        {game.live && <span className="ticker__live-dot">●</span>}
        {game.status}
      </div>
    </a>
  );
}
