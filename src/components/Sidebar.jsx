import { useState } from 'react';
import './Sidebar.css';

const LIVE_GAMES = [
  { id: 1, league: 'NBA', home: 'BOS', homeScore: 98, away: 'MIA', awayScore: 101, status: 'Q4 2:34', live: true, homeColor: '#007a33', awayColor: '#98002e' },
  { id: 2, league: 'MLB', home: 'LAD', homeScore: 3, away: 'SF', awayScore: 3, status: 'BOT 7th', live: true, homeColor: '#005a9c', awayColor: '#fd5a1e' },
  { id: 3, league: 'NHL', home: 'MTL', homeScore: 0, away: 'OTT', awayScore: 0, status: '7:00 PM ET', live: false, homeColor: '#af1e2d', awayColor: '#c52032' },
  { id: 4, league: 'NBA', home: 'DEN', homeScore: 0, away: 'OKC', awayScore: 0, status: '9:30 PM ET', live: false, homeColor: '#0e2240', awayColor: '#007ac1' },
  { id: 5, league: 'MLB', home: 'NYY', homeScore: 0, away: 'BOS', awayScore: 0, status: '7:05 PM ET', live: false, homeColor: '#003087', awayColor: '#bd3039' },
];

const TRENDING = [
  { id: 1, rank: 1, headline: 'McDavid Wins Hart Trophy for Record Fifth Time', league: 'NHL', views: '142K' },
  { id: 2, rank: 2, headline: 'SGA Named NBA MVP in Landslide Vote', league: 'NBA', views: '98K' },
  { id: 3, rank: 3, headline: 'Canada Qualifies for 2026 World Cup', league: 'SOCCER', views: '87K' },
  { id: 4, rank: 4, headline: 'Blue Jays Acquire All-Star Closer at Deadline', league: 'MLB', views: '65K' },
  { id: 5, rank: 5, headline: 'Andreescu Returns to Top 20 After Comeback', league: 'TENNIS', views: '54K' },
  { id: 6, rank: 6, headline: 'Grey Cup Tickets Sell Out in 12 Minutes', league: 'CFL', views: '43K' },
  { id: 7, rank: 7, headline: 'Conners Leads Canadian Open After Round 2', league: 'GOLF', views: '38K' },
];

const LEAGUE_COLORS = {
  NHL: '#0066cc', NBA: '#c8102e', MLB: '#002d72',
  SOCCER: '#00a651', CFL: '#e03a3e', GOLF: '#2e7d32', TENNIS: '#f5a623',
};

export default function Sidebar() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
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
          {LIVE_GAMES.map((game) => (
            <a key={game.id} href="#" className={`sb-game${game.live ? ' sb-game--live' : ''}`}>
              <div className="sb-game__league">{game.league}</div>
              <div className="sb-game__matchup">
                <div className="sb-game__team">
                  <span className="sb-game__dot" style={{ background: game.awayColor }} />
                  <span className="sb-game__name">{game.away}</span>
                  {game.live && <span className="sb-game__score">{game.awayScore}</span>}
                </div>
                <div className="sb-game__team">
                  <span className="sb-game__dot" style={{ background: game.homeColor }} />
                  <span className="sb-game__name">{game.home}</span>
                  {game.live && <span className="sb-game__score">{game.homeScore}</span>}
                </div>
              </div>
              <div className={`sb-game__status${game.live ? ' sb-game__status--live' : ''}`}>
                {game.live && <span className="sb-game__live-badge">LIVE</span>}
                {game.status}
              </div>
            </a>
          ))}
        </div>
        <a href="#" className="sidebar__view-all">View All Scores →</a>
      </div>

      {/* Trending */}
      <div className="sidebar__widget">
        <div className="sidebar__widget-header">
          <h3 className="sidebar__widget-title">🔥 Trending Now</h3>
        </div>
        <div className="sidebar__trending">
          {TRENDING.map((item) => (
            <a key={item.id} href="#" className="trending-item">
              <span className="trending-item__rank">{item.rank}</span>
              <div className="trending-item__body">
                <span
                  className="trending-item__league"
                  style={{ color: LEAGUE_COLORS[item.league] || '#888' }}
                >
                  {item.league}
                </span>
                <span className="trending-item__headline">{item.headline}</span>
              </div>
              <span className="trending-item__views">{item.views}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="sidebar__widget sidebar__widget--newsletter">
        <div className="sidebar__newsletter-icon">✉</div>
        <h3 className="sidebar__newsletter-title">Stay in the Game</h3>
        <p className="sidebar__newsletter-desc">
          Get the latest sports news, scores and highlights delivered to your inbox every morning.
        </p>
        {subscribed ? (
          <div className="sidebar__newsletter-success">
            ✓ You're subscribed! Check your inbox.
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

      {/* Ad Block 1 */}
      <div className="sidebar__ad">
        <span className="sidebar__ad-label">Advertisement</span>
        <div className="sidebar__ad-block">
          <div className="sidebar__ad-inner">
            <span className="sidebar__ad-text">300 × 250</span>
            <span className="sidebar__ad-sub">Your Ad Here</span>
          </div>
        </div>
      </div>

      {/* Ad Block 2 */}
      <div className="sidebar__ad">
        <span className="sidebar__ad-label">Advertisement</span>
        <div className="sidebar__ad-block sidebar__ad-block--tall">
          <div className="sidebar__ad-inner">
            <span className="sidebar__ad-text">300 × 600</span>
            <span className="sidebar__ad-sub">Your Ad Here</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
