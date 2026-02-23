import './TopStories.css';

const STORIES = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/story1/600/400',
    league: 'NHL',
    leagueColor: '#0066cc',
    headline: 'Connor McDavid Named Hart Trophy Finalist for Record Fifth Time',
    excerpt: 'The Oilers captain continues to rewrite the record books as he earns another MVP nomination after a historic 150-point season.',
    time: '1 hour ago',
    author: 'Mike Johnson',
    featured: true,
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/story2/600/400',
    league: 'NBA',
    leagueColor: '#c8102e',
    headline: 'Shai Gilgeous-Alexander Wins NBA MVP in Landslide Vote',
    excerpt: 'The Thunder star becomes the first Canadian-born player to win the award, capping a dominant season.',
    time: '2 hours ago',
    author: 'Sarah Chen',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/story3/600/400',
    league: 'MLB',
    leagueColor: '#002d72',
    headline: 'Blue Jays Acquire All-Star Closer in Blockbuster Trade Deadline Deal',
    excerpt: 'Toronto bolsters its bullpen with a proven closer as the team makes a serious push for the postseason.',
    time: '3 hours ago',
    author: 'Tom Williams',
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/story4/600/400',
    league: 'SOCCER',
    leagueColor: '#00a651',
    headline: 'TFC Signs Designated Player in Club-Record Transfer',
    excerpt: 'Toronto FC makes a statement signing as the club looks to return to MLS Cup contention.',
    time: '4 hours ago',
    author: 'Emma Davis',
  },
  {
    id: 5,
    image: 'https://picsum.photos/seed/story5/600/400',
    league: 'CFL',
    leagueColor: '#e03a3e',
    headline: 'Grey Cup Tickets Sell Out in Record 12 Minutes as Host City Announced',
    excerpt: 'Demand for the 111th Grey Cup reaches unprecedented levels as fans scramble for seats.',
    time: '5 hours ago',
    author: 'Chris Brown',
  },
  {
    id: 6,
    image: 'https://picsum.photos/seed/story6/600/400',
    league: 'GOLF',
    leagueColor: '#2e7d32',
    headline: 'Corey Conners Shoots 63 to Lead Canadian Open After Round Two',
    excerpt: "Canada's top golfer is in prime position to claim his home country's biggest tournament.",
    time: '6 hours ago',
    author: 'Lisa Park',
  },
];

const RECENT = [
  { id: 7, league: 'NHL', headline: 'Senators Fire Head Coach After Five-Game Losing Streak', time: '30 min ago' },
  { id: 8, league: 'NBA', headline: 'Raptors Select French Phenom with 4th Overall Pick in NBA Draft', time: '45 min ago' },
  { id: 9, league: 'MLB', headline: 'Shohei Ohtani Hits 30th Homer of Season in Dodgers Win', time: '1 hour ago' },
  { id: 10, league: 'SOCCER', headline: 'Canada Women Advance to Olympic Gold Medal Match', time: '1.5 hours ago' },
  { id: 11, league: 'CFL', headline: 'Riders Release Veteran Quarterback After Contract Dispute', time: '2 hours ago' },
  { id: 12, league: 'TENNIS', headline: 'Bianca Andreescu Returns to Top 20 After Injury Comeback', time: '2.5 hours ago' },
  { id: 13, league: 'NHL', headline: 'Leafs Sign Defenceman to Five-Year Extension Worth $35M', time: '3 hours ago' },
  { id: 14, league: 'NBA', headline: 'Warriors Announce Klay Thompson Retirement Ceremony Date', time: '3.5 hours ago' },
];

const LEAGUE_COLORS = {
  NHL: '#0066cc',
  NBA: '#c8102e',
  MLB: '#002d72',
  SOCCER: '#00a651',
  CFL: '#e03a3e',
  GOLF: '#2e7d32',
  TENNIS: '#f5a623',
};

export default function TopStories() {
  return (
    <div className="stories">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Top Stories</h2>
        <a href="#" className="section-header__link">View All →</a>
      </div>

      {/* Featured + Grid */}
      <div className="stories__grid">
        {/* Featured large card */}
        <a href="#" className="stories__card stories__card--featured">
          <div className="stories__card-img-wrap">
            <img
              src={STORIES[0].image}
              alt={STORIES[0].headline}
              className="stories__card-img"
              loading="lazy"
            />
            <span
              className="stories__league-tag"
              style={{ background: STORIES[0].leagueColor }}
            >
              {STORIES[0].league}
            </span>
          </div>
          <div className="stories__card-body">
            <h3 className="stories__card-headline stories__card-headline--lg">
              {STORIES[0].headline}
            </h3>
            <p className="stories__card-excerpt">{STORIES[0].excerpt}</p>
            <div className="stories__card-meta">
              <span className="stories__card-author">{STORIES[0].author}</span>
              <span className="stories__card-time">{STORIES[0].time}</span>
            </div>
          </div>
        </a>

        {/* Secondary cards */}
        <div className="stories__secondary">
          {STORIES.slice(1, 5).map((story) => (
            <a key={story.id} href="#" className="stories__card stories__card--sm">
              <div className="stories__card-img-wrap">
                <img
                  src={story.image}
                  alt={story.headline}
                  className="stories__card-img"
                  loading="lazy"
                />
                <span
                  className="stories__league-tag"
                  style={{ background: story.leagueColor }}
                >
                  {story.league}
                </span>
              </div>
              <div className="stories__card-body">
                <h3 className="stories__card-headline">{story.headline}</h3>
                <div className="stories__card-meta">
                  <span className="stories__card-time">{story.time}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent News Feed */}
      <div className="section-header" style={{ marginTop: '36px' }}>
        <span className="section-header__bar" />
        <h2 className="section-header__title">Latest News</h2>
        <a href="#" className="section-header__link">View All →</a>
      </div>

      <div className="recent-feed">
        {RECENT.map((item) => (
          <a key={item.id} href="#" className="recent-feed__item">
            <span
              className="recent-feed__league"
              style={{ color: LEAGUE_COLORS[item.league] || '#888' }}
            >
              {item.league}
            </span>
            <span className="recent-feed__headline">{item.headline}</span>
            <span className="recent-feed__time">{item.time}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
