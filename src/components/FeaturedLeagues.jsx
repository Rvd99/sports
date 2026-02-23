import './FeaturedLeagues.css';

const LEAGUES = [
  { id: 1, name: 'NHL', abbr: 'NHL', color: '#0066cc', bg: '#001a40', icon: '🏒', desc: 'National Hockey League' },
  { id: 2, name: 'NBA', abbr: 'NBA', color: '#c8102e', bg: '#2d0008', icon: '🏀', desc: 'National Basketball Assoc.' },
  { id: 3, name: 'MLB', abbr: 'MLB', color: '#002d72', bg: '#000d1f', icon: '⚾', desc: 'Major League Baseball' },
  { id: 4, name: 'CFL', abbr: 'CFL', color: '#e03a3e', bg: '#2d0002', icon: '🏈', desc: 'Canadian Football League' },
  { id: 5, name: 'MLS', abbr: 'MLS', color: '#00a651', bg: '#001a0d', icon: '⚽', desc: 'Major League Soccer' },
  { id: 6, name: 'PGA', abbr: 'GOLF', color: '#2e7d32', bg: '#001500', icon: '⛳', desc: 'PGA Tour' },
  { id: 7, name: 'ATP', abbr: 'TENNIS', color: '#f5a623', bg: '#1a0e00', icon: '🎾', desc: 'ATP / WTA Tour' },
  { id: 8, name: 'UFC', abbr: 'UFC', color: '#d4af37', bg: '#1a1500', icon: '🥊', desc: 'UFC / MMA' },
  { id: 9, name: 'F1', abbr: 'F1', color: '#e8002d', bg: '#2d0000', icon: '🏎', desc: 'Formula 1' },
  { id: 10, name: 'Olympics', abbr: 'OLY', color: '#0081c8', bg: '#001a2d', icon: '🏅', desc: '2026 Olympics' },
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
      {/* Featured Leagues Scroll */}
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Browse by League</h2>
      </div>

      <div className="leagues-scroll-wrap">
        <div className="leagues-scroll">
          {LEAGUES.map((league) => (
            <a
              key={league.id}
              href="#"
              className="league-pill"
              style={{ '--league-color': league.color, '--league-bg': league.bg }}
            >
              <span className="league-pill__icon">{league.icon}</span>
              <div className="league-pill__text">
                <span className="league-pill__abbr">{league.abbr}</span>
                <span className="league-pill__desc">{league.desc}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Must See Section */}
      <div className="section-header" style={{ marginTop: '40px' }}>
        <span className="section-header__bar" />
        <h2 className="section-header__title">Must See</h2>
        <a href="#" className="section-header__link">View All →</a>
      </div>

      <div className="must-see-grid">
        {MUST_SEE.map((item) => (
          <a key={item.id} href="#" className="must-see-card">
            <div className="must-see-card__img-wrap">
              <img
                src={item.image}
                alt={item.title}
                className="must-see-card__img"
                loading="lazy"
              />
              <span
                className="must-see-card__label"
                style={{ background: item.labelColor }}
              >
                {item.label}
              </span>
            </div>
            <div className="must-see-card__body">
              <h4 className="must-see-card__title">{item.title}</h4>
              <div className="must-see-card__meta">
                <span className="must-see-card__league">{item.league}</span>
                <span className="must-see-card__time">{item.time}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
