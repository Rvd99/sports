import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLiveScores } from '../api';
import './Sidebar.css';

const FALLBACK_SCORES = [
  { id: 1, league: 'cricket', home: 'IND', homeScore: 0, away: 'AUS', awayScore: 0, status: 'Scheduled', live: false, homeColor: '#1e3a8a', awayColor: '#991b1b' },
  { id: 2, league: 'nba', home: 'LAL', homeScore: 0, away: 'GSW', awayScore: 0, status: 'Scheduled', live: false, homeColor: '#c8102e', awayColor: '#0066cc' },
  { id: 3, league: 'cricket', home: 'ENG', homeScore: 0, away: 'PAK', awayScore: 0, status: 'Scheduled', live: false, homeColor: '#1e3a8a', awayColor: '#991b1b' },
  { id: 4, league: 'nba', home: 'BOS', homeScore: 0, away: 'MIA', awayScore: 0, status: 'Scheduled', live: false, homeColor: '#007a33', awayColor: '#98002e' },
];

const LEAGUE_COLORS = {
  nhl: '#0066cc', nba: '#c8102e', mlb: '#002d72',
  soccer: '#00a651', cfl: '#e03a3e', golf: '#2e7d32', tennis: '#f5a623',
  cricket: '#1e3a8a'
};

export default function Sidebar({ scores = [], news = [], articles = [], loading = false }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [liveScores, setLiveScores] = useState([]);

  useEffect(() => {
    const loadLiveScores = async () => {
      console.log('🔄 Sidebar: Loading live scores...');
      const data = await fetchLiveScores();
      if (data) {
        console.log('✅ Sidebar: Received live scores:', data);
        setLiveScores(data);
      } else {
        console.log('⚠️ Sidebar: No live scores received, using fallback');
      }
    };
    loadLiveScores();
    // Refresh scores every 30 seconds
    const interval = setInterval(loadLiveScores, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayScores = liveScores.length > 0 ? liveScores : (scores.length > 0 ? scores.slice(0, 6) : FALLBACK_SCORES);

  // Build trending from articles marked as trending + news
  const trendingArticles = (articles || []).filter(a => a.isTrending).map((item, i) => ({
    id: item.id,
    slug: item.slug,
    rank: i + 1,
    headline: item.title,
    league: (item.category || '').toUpperCase(),
    leagueColor: item.categoryColor || '#888',
    isArticle: true
  }));
  
  const trendingNews = news.slice(0, 7 - trendingArticles.length).map((item, i) => ({
    id: item.id,
    rank: trendingArticles.length + i + 1,
    headline: item.headline,
    league: (item.league || '').toUpperCase(),
    leagueColor: item.leagueColor || LEAGUE_COLORS[(item.league || '').toLowerCase()] || '#888',
  }));
  
  const trending = [...trendingArticles, ...trendingNews].slice(0, 7);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <aside className="sidebar">
      {/* Live Scores Widget */}
      <div className="sidebar__widget">
        <div className="sidebar__widget-header">
          <span className="sidebar__widget-dot" />
          <h3 className="sidebar__widget-title">Live &amp; Upcoming</h3>
        </div>
        <div className="sidebar__scores">
          {displayScores.map((game) => {
            const leagueKey = (game.league || '').toLowerCase();
            return (
              <a key={game.id} href="#" className={`sb-game${game.live ? ' sb-game--live' : ''}`}>
                <div className="sb-game__league">{leagueKey.toUpperCase()}</div>
                <div className="sb-game__matchup">
                  <div className="sb-game__team">
                    <span className="sb-game__dot" style={{ background: game.awayColor || '#555' }} />
                    <span className="sb-game__name">{game.away}</span>
                    {(game.live || game.status === 'FINAL' || game.status?.includes('OT')) && (
                      <span className="sb-game__score">{game.awayScore}</span>
                    )}
                  </div>
                  <div className="sb-game__team">
                    <span className="sb-game__dot" style={{ background: game.homeColor || '#555' }} />
                    <span className="sb-game__name">{game.home}</span>
                    {(game.live || game.status === 'FINAL' || game.status?.includes('OT')) && (
                      <span className="sb-game__score">{game.homeScore}</span>
                    )}
                  </div>
                </div>
                <div className={`sb-game__status${game.live ? ' sb-game__status--live' : ''}`}>
                  {game.live && <span className="sb-game__live-badge">LIVE</span>}
                  {game.status}
                </div>
              </a>
            );
          })}
        </div>
        <a href="#" className="sidebar__view-all">View All Scores →</a>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="sidebar__widget">
          <div className="sidebar__widget-header">
            <h3 className="sidebar__widget-title">🔥 Trending Now</h3>
          </div>
          <div className="sidebar__trending">
            {trending.map((item) => (
              item.isArticle ? (
                <Link key={item.id} to={`/article/${item.slug}`} className="trending-item">
                  <span className="trending-item__rank">{item.rank}</span>
                  <div className="trending-item__body">
                    <span className="trending-item__league" style={{ color: item.leagueColor }}>
                      {item.league}
                    </span>
                    <p className="trending-item__headline">{item.headline}</p>
                  </div>
                </Link>
              ) : (
                <a key={item.id} href="#" className="trending-item">
                  <span className="trending-item__rank">{item.rank}</span>
                  <div className="trending-item__body">
                    <span className="trending-item__league" style={{ color: item.leagueColor }}>
                      {item.league}
                    </span>
                    <p className="trending-item__headline">{item.headline}</p>
                  </div>
                </a>
              )
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="sidebar__widget sidebar__widget--newsletter">
        <div className="sidebar__newsletter-icon">✉</div>
        <h3 className="sidebar__newsletter-title">Stay in the Game</h3>
        <p className="sidebar__newsletter-desc">
          Get the latest sports news, scores and highlights delivered to your inbox every morning.
        </p>
        {subscribed ? (
          <div className="sidebar__newsletter-success">
            ✓ You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <form className="sidebar__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sidebar__newsletter-input"
              required
            />
            <button type="submit" className="sidebar__newsletter-btn">
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Ad Block */}
      <div className="sidebar__ad">
        <span className="sidebar__ad-label">Advertisement</span>
        <div className="sidebar__ad-block">
          <div className="sidebar__ad-inner">
            <span className="sidebar__ad-text">300 × 250</span>
            <span className="sidebar__ad-sub">Your Ad Here</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
