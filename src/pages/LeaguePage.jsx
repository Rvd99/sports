import { useState, useEffect } from 'react';
import HeroCards from '../components/HeroCards';
import TopStories from '../components/TopStories';
import SectionContainer from '../components/SectionContainer';
import VideoHighlights from '../components/VideoHighlights';
import Sidebar from '../components/Sidebar';
import FeaturedLeagues from '../components/FeaturedLeagues';
import { fetchNews, fetchScores, fetchVideos, fetchArticles, fetchSections } from '../api';
import './LeaguePage.css';

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

      {/* Hero Cards Section */}
      <HeroCards news={news} articles={articles} loading={loading} showTopNewsLabel={league === 'all'} />

      {/* Offline warning */}
      {error === 'backend-offline' && (
        <div className="offline-banner">
          ⚠ Backend offline — showing cached data. Run <code>npm run dev:full</code> to enable live data.
        </div>
      )}

      {/* Position 1 — After hero */}
      {sectionsAt(1)}

      {/* Main content */}
      <div className="league-page__content">
        <div className="league-page__content-inner">
          <div className="league-page__main-col">
            {/* Video Highlights — above Featured Stories */}
            <div className="league-page__section-gap">
              <VideoHighlights category={league} />
            </div>

            {/* Position 2 — After Videos */}
            {sectionsAt(2)}

            {/* Top Stories */}
            <TopStories news={news} articles={articles} loading={loading} />

            {/* Position 3 — After Top Stories */}
            {sectionsAt(3)}
          </div>
          
          {/* Sidebar */}
          <Sidebar scores={scores} news={news} articles={articles} loading={loading} page={pageKey} />
        </div>
      </div>

      {/* Position 4 — Bottom of page */}
      {sectionsAt(4)}

      {/* Featured leagues section */}
      <div className="app__full-width">
        <FeaturedLeagues />
      </div>
    </>
  );
}
