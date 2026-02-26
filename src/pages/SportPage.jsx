import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticles, fetchNews, fetchScores, fetchVideos } from '../api';
import Hero from '../components/Hero';
import ScoresTicker from '../components/ScoresTicker';
import TopStories from '../components/TopStories';
import VideoHighlights from '../components/VideoHighlights';
import Sidebar from '../components/Sidebar';
import Articles from '../components/Articles';
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
    ])
      .then(([articlesData, newsData, scoresData, videosData]) => {
        setArticles(articlesData);
        setNews(newsData);
        setScores(scoresData);
        setVideos(videosData);
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

  return (
    <div className="sport-page">
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

      {/* Scores Ticker */}
      <ScoresTicker scores={scores} loading={loading} />

      {/* Offline warning */}
      {error === 'backend-offline' && (
        <div className="offline-banner">
          ⚠ Backend offline — showing cached data. Run <code>npm run dev:full</code> to enable live data.
        </div>
      )}

      {/* Main content */}
      <div className="sport-page__content">
        <div className="sport-page__content-inner">
          <div className="sport-page__main-col">
            {/* Articles Section */}
            <Articles articles={articles} loading={loading} />
            
            {/* News Section */}
            <div className="sport-page__section-gap">
              <TopStories news={news} loading={loading} />
            </div>
            
            {/* Videos Section */}
            <div className="sport-page__section-gap">
              <VideoHighlights videos={videos} loading={loading} />
            </div>
          </div>
          
          {/* Sidebar */}
          <Sidebar scores={scores} news={news} loading={loading} />
        </div>
      </div>
    </div>
  );
}
