import { Link } from 'react-router-dom';
import './TopStories.css';

const FALLBACK_STORIES = [
  { id: 1, image: 'https://picsum.photos/seed/story1/600/400', league: 'nhl', leagueColor: '#0066cc', headline: 'Connor McDavid Named Hart Trophy Finalist for Record Fifth Time', excerpt: 'The Oilers captain continues to rewrite the record books after a historic 150-point season.', time: '1 hour ago', author: 'Mike Johnson' },
  { id: 2, image: 'https://picsum.photos/seed/story2/600/400', league: 'nba', leagueColor: '#c8102e', headline: 'Shai Gilgeous-Alexander Wins NBA MVP in Landslide Vote', excerpt: 'The Thunder star becomes the first Canadian-born player to win the award.', time: '2 hours ago', author: 'Sarah Chen' },
  { id: 3, image: 'https://picsum.photos/seed/story3/600/400', league: 'mlb', leagueColor: '#002d72', headline: 'Blue Jays Acquire All-Star Closer in Blockbuster Trade Deadline Deal', excerpt: 'Toronto bolsters its bullpen with a proven closer as the team makes a serious push for the postseason.', time: '3 hours ago', author: 'Tom Williams' },
  { id: 4, image: 'https://picsum.photos/seed/story4/600/400', league: 'soccer', leagueColor: '#00a651', headline: 'TFC Signs Designated Player in Club-Record Transfer', excerpt: 'Toronto FC makes a statement signing as the club looks to return to MLS Cup contention.', time: '4 hours ago', author: 'Emma Davis' },
  { id: 5, image: 'https://picsum.photos/seed/story5/600/400', league: 'cfl', leagueColor: '#e03a3e', headline: 'Grey Cup Tickets Sell Out in Record 12 Minutes as Host City Announced', excerpt: 'Demand for the 111th Grey Cup reaches unprecedented levels as fans scramble for seats.', time: '5 hours ago', author: 'Chris Brown' },
];

const LEAGUE_COLORS = {
  nhl: '#0066cc', nba: '#c8102e', mlb: '#002d72',
  soccer: '#00a651', cfl: '#e03a3e', golf: '#2e7d32', tennis: '#f5a623',
};

function normalizeLeague(l = '') {
  return l.toUpperCase();
}

function getLeagueColor(league = '') {
  return LEAGUE_COLORS[league.toLowerCase()] || '#888';
}

export default function TopStories({ news = [], articles = [], loading = false, sectionTitle = 'Featured Stories' }) {
  // Combine top story articles + featured story articles with news
  const topStoryArticles = (articles || [])
    .filter(a => a.isTopStory || a.isFeaturedStory)
    .map(item => ({
      id: item.id,
      slug: item.slug,
      image: item.imageUrl,
      league: item.category,
      leagueColor: item.categoryColor,
      headline: item.title,
      excerpt: item.excerpt,
      time: item.time || 'Recently',
      author: item.author,
      isArticle: true
    }));
  
  const combined = [...topStoryArticles, ...news];
  const stories = combined.length > 0 ? combined : FALLBACK_STORIES;
  const featured = stories[0];
  const secondary = stories.slice(1, 5);
  const recent = stories.slice(5, 13);

  if (loading) {
    return (
      <div className="stories">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">{sectionTitle}</h2>
        </div>
        <div className="stories__skeleton-grid">
          {[1,2,3,4,5].map(i => <div key={i} className="stories__skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="stories">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">{sectionTitle}</h2>
        <a href="#" className="section-header__link">View All →</a>
      </div>

      {/* Featured + Grid */}
      {featured && (
        <div className="stories__grid">
          {/* Featured large card */}
          {featured.isArticle ? (
            <Link to={`/article/${featured.slug}`} className="stories__card stories__card--featured">
              <div className="stories__card-img-wrap">
                <img
                  src={featured.image || `https://picsum.photos/seed/${featured.id}/600/400`}
                  alt={featured.headline}
                  className="stories__card-img"
                  loading="lazy"
                />
                <span
                  className="stories__league-tag"
                  style={{ background: featured.leagueColor || getLeagueColor(featured.league) }}
                >
                  {normalizeLeague(featured.league)}
                </span>
              </div>
              <div className="stories__card-body">
                <h3 className="stories__card-headline stories__card-headline--lg">
                  {featured.headline}
                </h3>
                <p className="stories__card-excerpt">{featured.excerpt}</p>
                <div className="stories__card-meta">
                  <span className="stories__card-author">{featured.author || 'Staff'}</span>
                  <span className="stories__card-time">{featured.time}</span>
                </div>
              </div>
            </Link>
          ) : (
            <a href="#" className="stories__card stories__card--featured">
              <div className="stories__card-img-wrap">
                <img
                  src={featured.image || `https://picsum.photos/seed/${featured.id}/600/400`}
                  alt={featured.headline}
                  className="stories__card-img"
                  loading="lazy"
                />
                <span
                  className="stories__league-tag"
                  style={{ background: featured.leagueColor || getLeagueColor(featured.league) }}
                >
                  {normalizeLeague(featured.league)}
                </span>
              </div>
              <div className="stories__card-body">
                <h3 className="stories__card-headline stories__card-headline--lg">
                  {featured.headline}
                </h3>
                <p className="stories__card-excerpt">{featured.excerpt}</p>
                <div className="stories__card-meta">
                  <span className="stories__card-author">{featured.author || 'Staff'}</span>
                  <span className="stories__card-time">{featured.time}</span>
                </div>
              </div>
            </a>
          )}

          {/* Secondary cards */}
          <div className="stories__secondary">
            {secondary.map((story) => (
              story.isArticle ? (
                <Link key={story.id} to={`/article/${story.slug}`} className="stories__card stories__card--sm">
                  <div className="stories__card-img-wrap">
                    <img
                      src={story.image || `https://picsum.photos/seed/${story.id}/600/400`}
                      alt={story.headline}
                      className="stories__card-img"
                      loading="lazy"
                    />
                    <span
                      className="stories__league-tag"
                      style={{ background: story.leagueColor || getLeagueColor(story.league) }}
                    >
                      {normalizeLeague(story.league)}
                    </span>
                  </div>
                  <div className="stories__card-body">
                    <h3 className="stories__card-headline">{story.headline}</h3>
                    <div className="stories__card-meta">
                      <span className="stories__card-time">{story.time}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <a key={story.id} href="#" className="stories__card stories__card--sm">
                  <div className="stories__card-img-wrap">
                    <img
                      src={story.image || `https://picsum.photos/seed/${story.id}/600/400`}
                      alt={story.headline}
                      className="stories__card-img"
                      loading="lazy"
                    />
                    <span
                      className="stories__league-tag"
                      style={{ background: story.leagueColor || getLeagueColor(story.league) }}
                    >
                      {normalizeLeague(story.league)}
                    </span>
                  </div>
                  <div className="stories__card-body">
                    <h3 className="stories__card-headline">{story.headline}</h3>
                    <div className="stories__card-meta">
                      <span className="stories__card-time">{story.time}</span>
                    </div>
                  </div>
                </a>
              )
            ))}
          </div>
        </div>
      )}

      {/* Recent News Feed */}
      {recent.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: '36px' }}>
            <span className="section-header__bar" />
            <h2 className="section-header__title">Latest News</h2>
            <a href="#" className="section-header__link">View All →</a>
          </div>
          <div className="recent-feed">
            {recent.map((item) => (
              <a key={item.id} href="#" className="recent-feed__item">
                <span
                  className="recent-feed__league"
                  style={{ color: item.leagueColor || getLeagueColor(item.league) }}
                >
                  {normalizeLeague(item.league)}
                </span>
                <span className="recent-feed__headline">{item.headline}</span>
                <span className="recent-feed__time">{item.time}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
