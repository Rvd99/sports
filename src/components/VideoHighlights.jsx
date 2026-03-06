import { useState, useEffect, useRef, useCallback } from 'react';
import VideoModal from './VideoModal';
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
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/videos?category=${category}`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [category]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener('scroll', updateArrows);
  }, [videos, updateArrows]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.video-card')?.offsetWidth || 320;
    const gap = 16;
    el.scrollBy({ left: dir * (cardWidth + gap) * 3, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="videos">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">Video Highlights</h2>
        </div>
        <div className="videos__carousel-wrap">
          <div className="videos__track">
            {[1,2,3,4,5,6].map(i => <div key={i} className="video-skeleton" />)}
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="videos">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">Video Highlights</h2>
        </div>
        <div className="videos__empty">
          <p>No video highlights available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="videos">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">Video Highlights</h2>
        </div>

        <div className="videos__carousel-wrap">
          {/* Prev Arrow */}
          <button
            className={`videos__arrow videos__arrow--prev${canPrev ? '' : ' videos__arrow--hidden'}`}
            onClick={() => scroll(-1)}
            aria-label="Previous videos"
          >
            <ChevronLeftIcon />
          </button>

          {/* Scrollable Track */}
          <div className="videos__track" ref={trackRef}>
            {videos.map((video) => {
              const categoryKey = video.categories && video.categories.length > 0
                ? video.categories[0].toLowerCase()
                : (video.league || '').toLowerCase();
              const categoryColor = video.leagueColor || LEAGUE_COLORS[categoryKey] || '#888';
              const categoryLabel = categoryKey.toUpperCase();
              const thumb = video.thumbnailUrl || video.thumb || `https://picsum.photos/seed/v${video.id}/600/340`;

              return (
                <button
                  key={video.id}
                  className="video-card"
                  onClick={() => setSelectedVideo(video)}
                  type="button"
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
                </button>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            className={`videos__arrow videos__arrow--next${canNext ? '' : ' videos__arrow--hidden'}`}
            onClick={() => scroll(1)}
            aria-label="Next videos"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
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

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
