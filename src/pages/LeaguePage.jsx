import { useState, useEffect } from 'react';
import HeroCards from '../components/HeroCards';
import TopStories from '../components/TopStories';
import SectionContainer from '../components/SectionContainer';
import VideoHighlights from '../components/VideoHighlights';
import Sidebar from '../components/Sidebar';
import FeaturedLeagues from '../components/FeaturedLeagues';
import { fetchNews, fetchScores, fetchVideos, fetchArticles, fetchSections, fetchArticlesByPlacement } from '../api';
import './LeaguePage.css';

const MUST_SEE_FALLBACK = [
  { id: 1, image: 'https://picsum.photos/seed/must1/400/260', label: 'EXCLUSIVE', labelColor: '#f5a623', title: 'Inside the Locker Room: Maple Leafs Playoff Preparation', league: 'NHL', time: 'Yesterday', slug: null },
  { id: 2, image: 'https://picsum.photos/seed/must2/400/260', label: 'FEATURE', labelColor: '#0066cc', title: "SGA's Rise to MVP: The Oklahoma City Thunder Story", league: 'NBA', time: '2 days ago', slug: null },
  { id: 3, image: 'https://picsum.photos/seed/must3/400/260', label: 'DOCUMENTARY', labelColor: '#00a651', title: "Canada's World Cup Journey: Road to 2026", league: 'SOCCER', time: '3 days ago', slug: null },
  { id: 4, image: 'https://picsum.photos/seed/must4/400/260', label: 'ANALYSIS', labelColor: '#c8102e', title: 'Blue Jays Trade Deadline: Winners and Losers', league: 'MLB', time: '4 days ago', slug: null },
];

const LEAGUE_LABELS = {
  all: 'Top Sports News',
  cricket: 'Cricket',
  basketball: 'Basketball',
  hockey: 'Hockey',
  football: 'Football',
  athletics: 'Athletics',
  domestic: 'Domestic Sports',
  tennis: 'Tennis',
  golf: 'Golf',
  boxing: 'Boxing',
  rugby: 'Rugby',
};

const LEAGUE_COLORS = {
  all: '#c8102e',
  cricket: '#1e3a8a',
  basketball: '#c8102e',
  hockey: '#0066cc',
  football: '#00a651',
  athletics: '#f5a623',
  domestic: '#8b4513',
  tennis: '#9c27b0',
  golf: '#2e7d32',
  boxing: '#d4af37',
  rugby: '#0081c8',
};

export default function LeaguePage({ league }) {
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sections, setSections] = useState([]);
  const [mustSeeArticles, setMustSeeArticles] = useState([]);
  const [latestNewsArticles, setLatestNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchNews(league),
      fetchScores(league),
      fetchVideos(league),
      fetchArticles(league === 'all' ? 'all' : league, 6, league === 'all'),
      fetchSections(),
    ])
      .then(([newsData, scoresData, videosData, articlesData, sectionsData]) => {
        setNews(newsData);
        setScores(scoresData);
        setVideos(videosData);
        setArticles(articlesData);
        setSections(sectionsData);
        fetchArticlesByPlacement('isMustSee', { limit: 4 }).then(setMustSeeArticles).catch(() => {});
        fetchArticlesByPlacement('isLatestNews', { limit: 10 }).then(setLatestNewsArticles).catch(() => {});
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API unavailable, using fallback data:', err.message);
        setError('backend-offline');
        setLoading(false);
      });
  }, [league]);

  const label = LEAGUE_LABELS[league] || league.toUpperCase();
  const color = LEAGUE_COLORS[league] || '#c8102e';

  // Map league prop to page key used in sections
  const pageKey = league === 'all' ? 'home' : league;

  // Filter sections for this page, sorted by position
  const pageSections = sections
    .filter(s => (s.page || 'home') === pageKey)
    .sort((a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0));

  const sectionsAt = (pos) => pageSections
    .filter(s => (s.position ?? 1) === pos)
    .map(section => (
      <div key={section.id} className="league-page__section-container">
        <SectionContainer section={section} />
      </div>
    ));

  return (
    <>
      {/* Position 0 — Above hero */}
      {sectionsAt(0)}

      {/* League page banner (non-homepage) */}
      {league !== 'all' && (
        <div className="league-banner" style={{ borderBottomColor: color }}>
          <div className="league-banner__inner">
            <span className="league-banner__dot" style={{ background: color }} />
            <h1 className="league-banner__title" style={{ color }}>
              {label}
            </h1>
            <span className="league-banner__sub">Latest News, Scores &amp; Highlights</span>
          </div>
        </div>
      )}

      {/* Offline warning */}
      {error === 'backend-offline' && (
        <div className="offline-banner">
          ⚠ Backend offline — showing cached data. Run <code>npm run dev:full</code> to enable live data.
        </div>
      )}

      {/* Full-page grid: main column + sidebar spans entire page */}
      <div className="league-page__page-grid">
        <div className="league-page__page-main">

          {/* Hero Cards Section */}
          <HeroCards news={news} articles={articles} loading={loading} showTopNewsLabel={league === 'all'} />

          {/* Featured leagues / Fan Forums section */}
          <div className="league-page__featured-leagues">
            <FeaturedLeagues />
          </div>

          {/* Latest News strip — shows articles marked isLatestNews, falls back to news feed */}
          {(latestNewsArticles.length > 0 || news.length > 0) && (
            <div className="latest-news-strip">
              <div className="latest-news-strip__inner">
                <div className="latest-news-strip__header">
                  <span className="latest-news-strip__bar" />
                  <h2 className="latest-news-strip__title">Latest News</h2>
                  <a href="#" className="latest-news-strip__link">View All →</a>
                </div>
                <div className="latest-news-strip__feed">
                  {latestNewsArticles.length > 0
                    ? latestNewsArticles.map((item) => (
                        <a key={item.id} href={`/article/${item.slug}`} className="latest-news-strip__item">
                          <span
                            className="latest-news-strip__league"
                            style={{ color: item.categoryColor || '#888' }}
                          >
                            {(item.category || 'NEWS').toUpperCase()}
                          </span>
                          <span className="latest-news-strip__headline">{item.title}</span>
                          <span className="latest-news-strip__time">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                          </span>
                        </a>
                      ))
                    : news.slice(0, 10).map((item) => (
                        <a key={item.id} href="#" className="latest-news-strip__item">
                          <span
                            className="latest-news-strip__league"
                            style={{ color: item.leagueColor || '#888' }}
                          >
                            {(item.league || 'NEWS').toUpperCase()}
                          </span>
                          <span className="latest-news-strip__headline">{item.headline}</span>
                          <span className="latest-news-strip__time">{item.time}</span>
                        </a>
                      ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Position 1 — After hero */}
          {sectionsAt(1)}

          {/* Video Highlights */}
          <div className="league-page__section-gap">
            <VideoHighlights category={league} />
          </div>

          {/* Position 2 — After Videos */}
          {sectionsAt(2)}

          {/* Top Stories */}
          <TopStories news={news} articles={articles} loading={loading} />

          {/* Position 3 — After Top Stories */}
          {sectionsAt(3)}

          {/* Position 4 — Bottom of main col */}
          {sectionsAt(4)}

          {/* Must See — bottom of page */}
          {(() => {
            const items = mustSeeArticles.length > 0
              ? mustSeeArticles.map(a => ({
                  id: a.id,
                  image: a.imageUrl,
                  label: (a.category || 'NEWS').toUpperCase(),
                  labelColor: a.categoryColor || '#888',
                  title: a.title,
                  league: (a.category || '').toUpperCase(),
                  time: a.time || (a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''),
                  slug: a.slug,
                }))
              : MUST_SEE_FALLBACK;
            return (
              <div className="league-page__must-see">
                <div className="section-header">
                  <span className="section-header__bar" />
                  <h2 className="section-header__title">Must See</h2>
                  <a href="#" className="section-header__link">View All →</a>
                </div>
                <div className="must-see-grid">
                  {items.map(item => (
                    item.slug
                      ? <a key={item.id} href={`/article/${item.slug}`} className="must-see-card">
                          <div className="must-see-card__img-wrap">
                            <img src={item.image} alt={item.title} className="must-see-card__img" loading="lazy" />
                            <span className="must-see-card__label" style={{ background: item.labelColor }}>{item.label}</span>
                          </div>
                          <div className="must-see-card__body">
                            <h4 className="must-see-card__title">{item.title}</h4>
                            <div className="must-see-card__meta">
                              <span className="must-see-card__league">{item.league}</span>
                              <span className="must-see-card__time">{item.time}</span>
                            </div>
                          </div>
                        </a>
                      : <a key={item.id} href="#" className="must-see-card">
                          <div className="must-see-card__img-wrap">
                            <img src={item.image} alt={item.title} className="must-see-card__img" loading="lazy" />
                            <span className="must-see-card__label" style={{ background: item.labelColor }}>{item.label}</span>
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
          })()}

        </div>

        {/* Sidebar — spans full height */}
        <div className="league-page__page-sidebar">
          <Sidebar scores={scores} news={news} articles={articles} loading={loading} page={pageKey} />
        </div>
      </div>
    </>
  );
}
