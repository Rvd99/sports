import { useState, useEffect } from 'react';
import './VideoHighlights.css';

const LEAGUE_COLORS = {
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
  nhl: '#0066cc',
  nba: '#c8102e',
  mlb: '#002d72',
  soccer: '#00a651',
  cfl: '#e03a3e',
};

export default function VideoHighlights({ category = 'all' }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [category]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/videos?category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      console.log(`Fetched ${data.length} videos for category: ${category}`, data);
      setVideos(data.slice(0, 6)); // Show max 6 videos
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const displayVideos = videos.slice(0, 6);

  if (loading) {
    return (
      <div className="videos">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">Video Highlights</h2>
        </div>
        <div className="videos__grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="video-skeleton" />)}
        </div>
      </div>
    );
  }

  if (displayVideos.length === 0 && !loading) {
    return null; // Don't show section if no videos
  }

  return (
    <div className="videos">
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Video Highlights</h2>
      </div>

      <div className="videos__grid">
        {displayVideos.map((video) => {
          // Handle both uploaded videos (categories array) and mock videos (league field)
          const categoryKey = video.categories && video.categories.length > 0 
            ? video.categories[0].toLowerCase() 
            : (video.league || '').toLowerCase();
          const categoryColor = video.leagueColor || LEAGUE_COLORS[categoryKey] || '#888';
          const categoryLabel = categoryKey.toUpperCase();
          const thumb = video.thumbnailUrl || video.thumb || `https://picsum.photos/seed/v${video.id}/600/340`;
          const videoLink = video.videoUrl || '#';
          
          return (
            <a 
              key={video.id} 
              href={videoLink} 
              className="video-card"
              target={video.videoUrl ? "_blank" : "_self"}
              rel={video.videoUrl ? "noopener noreferrer" : ""}
            >
              <div className="video-card__thumb-wrap">
                <img
                  src={thumb}
                  alt={video.title}
                  className="video-card__thumb"
                  loading="lazy"
                />
                <div className="video-card__overlay">
                  <div className="video-card__play">
                    <PlayIcon />
                  </div>
                </div>
                <span className="video-card__duration">{video.duration || '—'}</span>
                <span className="video-card__league" style={{ background: categoryColor }}>
                  {categoryLabel}
                </span>
              </div>
              <div className="video-card__body">
                <h4 className="video-card__title">{video.title}</h4>
                <div className="video-card__meta">
                  <span className="video-card__views">{video.views || '—'} views</span>
                  <span className="video-card__time">{video.time || ''}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="12" fill="rgba(200,16,46,0.85)" />
      <polygon points="9.5,7 18,12 9.5,17" fill="white" />
    </svg>
  );
}
