import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HeroCards.css';

const FALLBACK_STORIES = [
  { 
    id: 1, 
    image: 'https://picsum.photos/seed/hero1/800/600', 
    league: 'NHL', 
    leagueColor: '#0066cc', 
    headline: 'Resignation replacing frustration as Maple Leafs drop fourth straight', 
    excerpt: 'Toronto struggles continue as playoff hopes dim with another disappointing loss',
    author: 'Luke Fox',
    time: '2 hours ago' 
  },
  { 
    id: 2, 
    image: 'https://picsum.photos/seed/hero2/800/600', 
    league: 'NHL', 
    leagueColor: '#0066cc', 
    headline: "Real Kyper's Trade Board 5.0: Setting up deadline week", 
    excerpt: 'Breaking down the biggest names and potential moves ahead of the trade deadline',
    author: 'Nick Kypreos',
    time: '3 hours ago' 
  },
  { 
    id: 3, 
    image: 'https://picsum.photos/seed/hero3/800/600', 
    league: 'MLB', 
    leagueColor: '#c8102e', 
    headline: 'Stress-testing the 2026 Blue Jays at each position', 
    excerpt: 'A comprehensive look at Toronto\'s roster construction for the upcoming season',
    author: 'Ben Nicholson-Smith',
    time: '4 hours ago' 
  },
  { 
    id: 4, 
    image: 'https://picsum.photos/seed/hero4/800/600', 
    league: 'NHL', 
    leagueColor: '#0066cc', 
    headline: "Canucks' uncompetitive deadline week continues with lopsided loss", 
    excerpt: 'Vancouver falls short again as trade speculation swirls around the team',
    author: 'Iain MacIntyre',
    time: '5 hours ago' 
  },
  { 
    id: 5, 
    image: 'https://picsum.photos/seed/hero5/800/600', 
    league: 'NBA', 
    leagueColor: '#c8102e', 
    headline: 'Raptors look to bounce back after tough road trip', 
    excerpt: 'Toronto returns home seeking to regain momentum in playoff push',
    author: 'Michael Grange',
    time: '6 hours ago' 
  },
];

const LEAGUE_COLORS = {
  nhl: '#0066cc', 
  nba: '#c8102e', 
  mlb: '#002d72',
  soccer: '#00a651', 
  cfl: '#e03a3e', 
  golf: '#2e7d32', 
  tennis: '#f5a623',
  cricket: '#1e3a8a',
  basketball: '#c8102e',
  hockey: '#0066cc',
  football: '#00a651',
  athletics: '#f5a623',
  domestic: '#8b4513',
  boxing: '#d4af37',
  rugby: '#0081c8',
};

function getLeagueColor(league = '') {
  return LEAGUE_COLORS[league.toLowerCase()] || '#888';
}

export default function HeroCards({ news = [], articles = [], loading = false, showTopNewsLabel = false }) {
  const stories = useMemo(() => {
    // Combine featured/top story articles with news
    const featuredArticles = (articles || [])
      .filter(a => a.isFeatured || a.isTopStory)
      .map(item => ({
        id: item.id,
        slug: item.slug,
        image: item.imageUrl,
        league: (item.category || 'NEWS').toUpperCase(),
        leagueColor: item.categoryColor || getLeagueColor(item.category),
        headline: item.title,
        excerpt: item.excerpt,
        author: item.author || 'Staff',
        time: item.time || 'Recently',
        isArticle: true
      }));
    
    const featuredNews = (news || [])
      .filter(n => n.featured)
      .map(item => ({
        id: item.id,
        image: item.image,
        league: (item.league || 'NEWS').toUpperCase(),
        leagueColor: item.leagueColor || getLeagueColor(item.league),
        headline: item.headline,
        excerpt: item.excerpt,
        author: item.author || 'Staff',
        time: item.time || 'Recently',
        isArticle: false
      }));
    
    const combined = [...featuredArticles, ...featuredNews];
    
    if (combined.length === 0) return FALLBACK_STORIES;
    return combined.slice(0, 5);
  }, [news, articles]);

  const headlines = useMemo(() => {
    const allArticles = (articles || []).map(item => ({
      id: `a-${item.id}`,
      slug: item.slug,
      headline: item.title,
      league: (item.category || 'NEWS').toUpperCase(),
      leagueColor: item.categoryColor || getLeagueColor(item.category),
      isArticle: true,
    }));
    const allNews = (news || []).map(item => ({
      id: `n-${item.id}`,
      headline: item.headline,
      league: (item.league || 'NEWS').toUpperCase(),
      leagueColor: item.leagueColor || getLeagueColor(item.league),
      isArticle: false,
    }));
    const combined = [...allArticles, ...allNews];
    if (combined.length === 0) {
      return [
        { id: 'h1', headline: 'Oilers acquire defenceman Connor Murphy', league: 'NHL', leagueColor: '#0066cc' },
        { id: 'h2', headline: 'Questions swirl around Canadian women', league: 'CAN', leagueColor: '#c8102e' },
        { id: 'h3', headline: 'Gushue shines in battle of The Rock', league: 'CRL', leagueColor: '#555' },
        { id: 'h4', headline: 'Canada names Josh Naylor captain for WBC', league: 'MLB', leagueColor: '#002d72' },
        { id: 'h5', headline: 'Stars reach franchise-high win streak', league: 'NHL', leagueColor: '#0066cc' },
        { id: 'h6', headline: 'Knight, Hughes brothers appear on Fallon', league: 'NHL', leagueColor: '#0066cc' },
        { id: 'h7', headline: 'Kornet asks Hawks to cancel promotion', league: 'NBA', leagueColor: '#c8102e' },
        { id: 'h8', headline: 'Young ejected before making Wizards debut', league: 'NBA', leagueColor: '#c8102e' },
      ];
    }
    return combined.slice(0, 8);
  }, [news, articles]);

  if (loading) {
    return (
      <div className="hero-cards">
        <div className="hero-cards__container">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="hero-card hero-card--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const [featured, ...sideStories] = stories;
  const displaySideStories = sideStories.slice(0, 3);

  return (
    <div className="hero-cards">
      {showTopNewsLabel && (
        <div className="hero-cards__heading-bar">
          <div className="hero-cards__heading-inner">
            <span className="hero-cards__heading-bar-line" />
            <h2 className="hero-cards__heading-title">Top News</h2>
          </div>
        </div>
      )}
      <div className="hero-cards__container">
        {/* Large Featured Card (Left) */}
        {featured && (() => {
          const CardWrapper = featured.isArticle ? Link : 'a';
          const cardProps = featured.isArticle 
            ? { to: `/article/${featured.slug}` }
            : { href: '#' };

          return (
            <CardWrapper
              {...cardProps}
              className="hero-card hero-card--large"
            >
              {/* Background Image */}
              <div 
                className="hero-card__image"
                style={{ backgroundImage: `url(${featured.image || `https://picsum.photos/seed/${featured.id}/800/600`})` }}
              />
              
              {/* Content */}
              <div className="hero-card__content">
                <div className="hero-card__author">
                  <span 
                    className="hero-card__badge"
                    style={{ backgroundColor: featured.leagueColor }}
                  >
                    {featured.league}
                  </span>
                  {featured.author}
                </div>
                <h3 className="hero-card__headline">
                  {featured.headline}
                </h3>
              </div>
            </CardWrapper>
          );
        })()}

        {/* Small Cards Stack (Right) */}
        <div className="hero-cards__side">
          {displaySideStories.map((story) => {
            const CardWrapper = story.isArticle ? Link : 'a';
            const cardProps = story.isArticle 
              ? { to: `/article/${story.slug}` }
              : { href: '#' };

            return (
              <CardWrapper
                key={story.id}
                {...cardProps}
                className="hero-card hero-card--small"
              >
                {/* Small Thumbnail Image */}
                <div 
                  className="hero-card__thumb"
                  style={{ backgroundImage: `url(${story.image || `https://picsum.photos/seed/${story.id}/400/300`})` }}
                />
                
                {/* Text Content */}
                <div className="hero-card__text">
                  <div className="hero-card__text-top">
                    <span 
                      className="hero-card__badge hero-card__badge--small"
                      style={{ backgroundColor: story.leagueColor }}
                    >
                      {story.league}
                    </span>
                    <span className="hero-card__author--small">
                      {story.author}
                    </span>
                  </div>
                  <h4 className="hero-card__headline hero-card__headline--small">
                    {story.headline}
                  </h4>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* HEADLINES Column (Right) */}
        <div className="hero-headlines">
          <div className="hero-headlines__title">Headlines</div>
          <ul className="hero-headlines__list">
            {headlines.map((item) => {
              const ItemWrapper = item.isArticle && item.slug ? Link : 'a';
              const itemProps = item.isArticle && item.slug
                ? { to: `/article/${item.slug}` }
                : { href: '#' };
              return (
                <ItemWrapper key={item.id} {...itemProps} className="hero-headlines__item">
                  <div
                    className="hero-headlines__icon-fallback"
                    style={{ background: item.leagueColor, color: '#fff' }}
                  >
                    {item.league.slice(0, 3)}
                  </div>
                  <span className="hero-headlines__text">{item.headline}</span>
                </ItemWrapper>
              );
            })}
          </ul>
          <div className="hero-headlines__ad">Advertisement</div>
        </div>

      </div>
    </div>
  );
}
