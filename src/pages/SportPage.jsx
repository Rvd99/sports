import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticles, fetchNews, fetchScores, fetchVideos, fetchSections } from '../api';
import Hero from '../components/Hero';
import TopStories from '../components/TopStories';
import VideoHighlights from '../components/VideoHighlights';
import SectionContainer from '../components/SectionContainer';
import Sidebar from '../components/Sidebar';
import './SportPage.css';

const SPORT_CONFIG = {
  mls: { name: 'MLS', color: '#00a651', description: 'Major League Soccer' },
  'ufc-mma': { name: 'UFC/MMA', color: '#d4af37', description: 'Mixed Martial Arts' },
  nascar: { name: 'NASCAR', color: '#e8002d', description: 'Stock Car Racing' },
  'formula-1': { name: 'Formula 1', color: '#e8002d', description: 'Open Wheel Racing' },
  boxing: { name: 'Boxing', color: '#d4af37', description: 'Professional Boxing' },
  rugby: { name: 'Rugby', color: '#0081c8', description: 'Rugby Union & League' },
  olympics: { name: 'Olympics', color: '#0081c8', description: 'Olympic Games' },
  esports: { name: 'Esports', color: '#64748b', description: 'Competitive Gaming' },
};

export default function SportPage() {
  const { sport } = useParams();
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [videos, setVideos] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sportConfig = SPORT_CONFIG[sport] || { 
    name: sport?.charAt(0).toUpperCase() + sport?.slice(1) || 'Sport', 
    color: '#888888',
    description: 'Sports coverage and analysis'
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetchArticles(sport, 6),
      fetchNews(sport, 5),
      fetchScores(sport, 5),
      fetchVideos(sport, 4),
      fetchSections(),
    ])
      .then(([articlesData, newsData, scoresData, videosData, sectionsData]) => {
        setArticles(articlesData);
        setNews(newsData);
        setScores(scoresData);
        setVideos(videosData);
        setSections(sectionsData);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API unavailable, using fallback data:', err.message);
        setError('backend-offline');
        setLoading(false);
      });
  }, [sport]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Filter sections assigned to this sport page
  const pageSections = sections
    .filter(s => s.page === sport)
    .sort((a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0));

  const sectionsAt = (pos) => pageSections
    .filter(s => (s.position ?? 1) === pos)
    .map(section => (
      <div key={section.id} style={{ width: '100%' }}>
        <SectionContainer section={section} />
      </div>
    ));

  return (
    <div className="sport-page">
      {/* Position 0 — Above header */}
      {sectionsAt(0)}

      {/* Sport Header */}
      <div className="sport-header" style={{ borderBottomColor: sportConfig.color }}>
        <div className="sport-header__inner">
          <span className="sport-header__dot" style={{ background: sportConfig.color }} />
          <h1 className="sport-header__title" style={{ color: sportConfig.color }}>
            {sportConfig.name}
          </h1>
          <span className="sport-header__sub">{sportConfig.description}</span>
        </div>
      </div>

      {/* Hero Section */}
      <Hero news={news} loading={loading} />

      {/* Offline warning */}
      {error === 'backend-offline' && (
        <div className="offline-banner">
          ⚠ Backend offline — showing cached data. Run <code>npm run dev:full</code> to enable live data.
        </div>
      )}

      {/* Position 1 — After hero */}
      {sectionsAt(1)}

      {/* Main content */}
      <div className="sport-page__content">
        <div className="sport-page__content-inner">
          <div className="sport-page__main-col">
            {/* Videos Section — above Featured Stories */}
            <div className="sport-page__section-gap">
              <VideoHighlights videos={videos} loading={loading} />
            </div>

            {/* Position 2 — After Videos */}
            {sectionsAt(2)}

            {/* News Section */}
            <TopStories news={news} loading={loading} sectionTitle="Featured Stories" />

            {/* Position 3 — After Top Stories */}
            {sectionsAt(3)}
          </div>
          
          {/* Sidebar */}
          <Sidebar scores={scores} news={news} loading={loading} page={sport} />
        </div>
      </div>

      {/* Position 4 — Bottom of page */}
      {sectionsAt(4)}
    </div>
  );
}
