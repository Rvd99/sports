import { Link } from 'react-router-dom';
import './FeaturedLeagues.css';

const LEAGUES = [
  { id: 1, name: 'NHL',      abbr: 'NHL',    color: '#0066cc', bg: '#001a40', icon: '🏒', desc: 'National Hockey League',    slug: 'nhl' },
  { id: 2, name: 'NBA',      abbr: 'NBA',    color: '#c8102e', bg: '#2d0008', icon: '🏀', desc: 'National Basketball Assoc.', slug: 'nba' },
  { id: 3, name: 'MLB',      abbr: 'MLB',    color: '#002d72', bg: '#000d1f', icon: '⚾', desc: 'Major League Baseball',      slug: 'mlb' },
  { id: 4, name: 'CFL',      abbr: 'CFL',    color: '#e03a3e', bg: '#2d0002', icon: '🏈', desc: 'Canadian Football League',   slug: 'cfl' },
  { id: 5, name: 'Soccer',   abbr: 'SOCCER', color: '#00a651', bg: '#001a0d', icon: '⚽', desc: 'MLS & International',        slug: 'soccer' },
  { id: 6, name: 'Golf',     abbr: 'GOLF',   color: '#2e7d32', bg: '#001500', icon: '⛳', desc: 'PGA Tour',                   slug: 'golf' },
  { id: 7, name: 'Tennis',   abbr: 'TENNIS', color: '#f5a623', bg: '#1a0e00', icon: '🎾', desc: 'ATP / WTA Tour',             slug: 'tennis' },
  { id: 8, name: 'UFC',      abbr: 'UFC',    color: '#d4af37', bg: '#1a1500', icon: '🥊', desc: 'UFC / MMA',                  slug: 'ufc' },
  { id: 9, name: 'F1',       abbr: 'F1',     color: '#e8002d', bg: '#2d0000', icon: '🏎', desc: 'Formula 1',                  slug: 'f1' },
  { id: 10, name: 'Cricket', abbr: 'CRICKET',color: '#00a8cc', bg: '#001a22', icon: '🏏', desc: 'International Cricket',      slug: 'cricket' },
  { id: 11, name: 'Olympics',abbr: 'OLY',    color: '#0081c8', bg: '#001a2d', icon: '🏅', desc: '2026 Olympics',              slug: 'olympics' },
  { id: 12, name: 'General', abbr: 'GENERAL',color: '#7c3aed', bg: '#1a0d2d', icon: '💬', desc: 'All Sports Talk',            slug: 'general' },
];

const MUST_SEE = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/must1/400/260',
    label: 'EXCLUSIVE',
    labelColor: '#f5a623',
    title: 'Inside the Locker Room: Maple Leafs Playoff Preparation',
    league: 'NHL',
    time: 'Yesterday',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/must2/400/260',
    label: 'FEATURE',
    labelColor: '#0066cc',
    title: "SGA's Rise to MVP: The Oklahoma City Thunder Story",
    league: 'NBA',
    time: '2 days ago',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/must3/400/260',
    label: 'DOCUMENTARY',
    labelColor: '#00a651',
    title: "Canada's World Cup Journey: Road to 2026",
    league: 'SOCCER',
    time: '3 days ago',
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/must4/400/260',
    label: 'ANALYSIS',
    labelColor: '#c8102e',
    title: 'Blue Jays Trade Deadline: Winners and Losers',
    league: 'MLB',
    time: '4 days ago',
  },
];

export default function FeaturedLeagues() {
  return (
    <div className="featured-leagues-section">
      {/* Fan Forums / Browse by League */}
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Fan Forums</h2>
        <Link to="/forums" className="section-header__link">All Forums →</Link>
      </div>

      <div className="leagues-scroll-wrap">
        <div className="leagues-scroll">
          {LEAGUES.map((league) => (
            <Link
              key={league.id}
              to={`/forums/${league.slug}`}
              className="league-pill"
              style={{ '--league-color': league.color, '--league-bg': league.bg }}
            >
              <span className="league-pill__icon">{league.icon}</span>
              <div className="league-pill__text">
                <span className="league-pill__abbr">{league.abbr}</span>
                <span className="league-pill__desc">{league.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
