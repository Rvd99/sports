import { useEffect, useRef } from 'react';
import './VideoModal.css';

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isDirectVideo(url) {
  return url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function VideoModal({ video, onClose }) {
  const overlayRef = useRef(null);
  const ytId = video?.videoUrl ? extractYouTubeId(video.videoUrl) : null;
  const isDirect = video?.videoUrl ? isDirectVideo(video.videoUrl) : false;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!video) return null;

  return (
    <div className="vmodal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="vmodal">
        <button className="vmodal__close" onClick={onClose} aria-label="Close video">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="vmodal__player">
          {ytId ? (
            <iframe
              className="vmodal__iframe"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirect ? (
            <video
              className="vmodal__video"
              src={video.videoUrl}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="vmodal__unsupported">
              <p>This video format cannot be played inline.</p>
              {video.videoUrl && (
                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="vmodal__ext-link">
                  Open video ↗
                </a>
              )}
            </div>
          )}
        </div>

        <div className="vmodal__info">
          <h3 className="vmodal__title">{video.title}</h3>
          <div className="vmodal__meta">
            {video.views && <span>{video.views} views</span>}
            {video.time && <span>· {video.time}</span>}
            {video.duration && <span>· {video.duration}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
