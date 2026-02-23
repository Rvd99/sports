import './ScoresTicker.css';

const SCORES = [
  { id: 1, league: 'NHL', home: 'TOR', homeScore: 3, away: 'NYR', awayScore: 2, status: 'FINAL/OT', homeColor: '#00205b', awayColor: '#0038a8' },
  { id: 2, league: 'NHL', home: 'EDM', homeScore: 5, away: 'VAN', awayScore: 1, status: 'FINAL', homeColor: '#041e42', awayColor: '#00843d' },
  { id: 3, league: 'NBA', home: 'LAL', homeScore: 112, away: 'GSW', awayScore: 108, status: 'FINAL', homeColor: '#552583', awayColor: '#1d428a' },
  { id: 4, league: 'NBA', home: 'BOS', homeScore: 98, away: 'MIA', awayScore: 101, status: 'Q4 2:34', homeColor: '#007a33', awayColor: '#98002e', live: true },
  { id: 5, league: 'MLB', home: 'TOR', homeScore: 7, away: 'NYY', awayScore: 4, status: 'FINAL', homeColor: '#134a8e', awayColor: '#003087' },
  { id: 6, league: 'MLB', home: 'LAD', homeScore: 3, away: 'SF', awayScore: 3, status: 'BOT 7th', homeColor: '#005a9c', awayColor: '#fd5a1e', live: true },
  { id: 7, league: 'NHL', home: 'MTL', homeScore: 0, away: 'OTT', awayScore: 0, status: '7:00 PM', homeColor: '#af1e2d', awayColor: '#c52032', upcoming: true },
  { id: 8, league: 'CFL', home: 'WPG', homeScore: 34, away: 'CGY', awayScore: 17, status: 'FINAL', homeColor: '#003087', awayColor: '#c8102e' },
  { id: 9, league: 'NBA', home: 'DEN', homeScore: 0, away: 'OKC', awayScore: 0, status: '9:30 PM', homeColor: '#0e2240', awayColor: '#007ac1', upcoming: true },
  { id: 10, league: 'MLB', home: 'CHC', homeScore: 5, away: 'STL', awayScore: 6, status: 'FINAL', homeColor: '#0e3386', awayColor: '#c41e3a' },
];

export default function ScoresTicker() {
  return (
    <div className="ticker">
      <div className="ticker__label">
        <span className="ticker__label-live">● LIVE</span>
        <span className="ticker__label-scores">SCORES</span>
      </div>
      <div className="ticker__scroll-wrap">
        <div className="ticker__track">
          {[...SCORES, ...SCORES].map((game, idx) => (
            <ScoreCard key={`${game.id}-${idx}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ game }) {
  return (
    <a href="#" className={`ticker__card${game.live ? ' ticker__card--live' : ''}${game.upcoming ? ' ticker__card--upcoming' : ''}`}>
      <div className="ticker__league">{game.league}</div>
      <div className="ticker__teams">
        <div className="ticker__team">
          <span className="ticker__team-dot" style={{ background: game.awayColor }} />
          <span className="ticker__team-name">{game.away}</span>
          {!game.upcoming && <span className="ticker__score">{game.awayScore}</span>}
        </div>
        <div className="ticker__team">
          <span className="ticker__team-dot" style={{ background: game.homeColor }} />
          <span className="ticker__team-name">{game.home}</span>
          {!game.upcoming && <span className="ticker__score">{game.homeScore}</span>}
        </div>
      </div>
      <div className={`ticker__status${game.live ? ' ticker__status--live' : ''}${game.upcoming ? ' ticker__status--upcoming' : ''}`}>
        {game.live && <span className="ticker__live-dot">●</span>}
        {game.status}
      </div>
    </a>
  );
}
