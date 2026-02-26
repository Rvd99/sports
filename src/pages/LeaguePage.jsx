import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ScoresTicker from '../components/ScoresTicker';
import TopStories from '../components/TopStories';
import VideoHighlights from '../components/VideoHighlights';
import Sidebar from '../components/Sidebar';
import FeaturedLeagues from '../components/FeaturedLeagues';
import Articles from '../components/Articles';
import { fetchNews, fetchScores, fetchVideos, fetchArticles } from '../api';
import './LeaguePage.css';

const LEAGUE_LABELS = {
  all: 'Top Sports News',
  nhl: 'NHL Hockey',
  nba: 'NBA Basketball',
  mlb: 'MLB Baseball',
  cfl: 'CFL Football',
  soccer: 'Soccer',
  golf: 'Golf',
  tennis: 'Tennis',
};

const LEAGUE_COLORS = {
  all: '#c8102e',
  nhl: '#0066cc',
  nba: '#c8102e',
  mlb: '#002d72',
  cfl: '#e03a3e',
  soccer: '#00a651',
  golf: '#2e7d32',
  tennis: '#f5a623',
};

export default function LeaguePage({ league }) {
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
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
    ])
      .then(([newsData, scoresData, videosData, articlesData]) => {
        setNews(newsData);
        setScores(scoresData);
        setVideos(videosData);
        setArticles(articlesData);
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

  return (
    <>
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

      {/* Hero Section */}
      <Hero news={news} articles={articles} loading={loading} />

      {/* Scores Ticker */}
      <ScoresTicker scores={scores} loading={loading} />

      {/* Offline warning */}
      {error === 'backend-offline' && (
        <div className="offline-banner">
          ⚠ Backend offline — showing cached data. Run <code>npm run dev:full</code> to enable live data.
        </div>
      )}

      {/* Main content */}
      <div className="league-page__content">
        <div className="league-page__content-inner">
          <div className="league-page__main-col">
            {/* Articles Section */}
            <Articles articles={articles} loading={loading} />
            
            {/* Top Stories */}
            <div className="league-page__section-gap">
              <TopStories news={news} articles={articles} loading={loading} />
            </div>
            
            {/* Video Highlights */}
            <div className="league-page__section-gap">
              <VideoHighlights videos={videos} loading={loading} />
            </div>
          </div>
          
          {/* Sidebar */}
          <Sidebar scores={scores} news={news} articles={articles} loading={loading} />
        </div>
      </div>

      {/* Featured leagues (homepage only) */}
      {league === 'all' && (
        <div className="app__full-width">
          <FeaturedLeagues />
        </div>
      )}
    </>
  );
}
