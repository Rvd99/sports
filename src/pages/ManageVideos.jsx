import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageVideos.css';

export default function ManageVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/videos');
      const data = await response.json();
      
      console.log('ManageVideos - Total videos from API:', data.length);
      console.log('ManageVideos - All videos:', data);
      
      // Filter to show only uploaded videos (not mock data)
      const uploadedOnly = data.filter(v => v.categories && Array.isArray(v.categories));
      
      console.log('ManageVideos - Uploaded videos only:', uploadedOnly.length);
      console.log('ManageVideos - Uploaded videos:', uploadedOnly);
      
      setVideos(uploadedOnly);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId, videoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }

    setDeleteLoading(videoId);
    setError('');

    try {
      const userRole = localStorage.getItem('userRole');
      const response = await fetch(`http://localhost:5001/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole || 'admin'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete video');
      }

      // Remove from local state
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="manage-videos">
        <div className="manage-videos__inner">
          <div className="manage-videos__loading">⏳ Loading videos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-videos">
      <div className="manage-videos__inner">
        <div className="manage-videos__breadcrumb">
          <Link to="/" className="manage-videos__breadcrumb-link">Home</Link>
          <span className="manage-videos__breadcrumb-sep">›</span>
          <Link to="/admin/articles" className="manage-videos__breadcrumb-link">Admin</Link>
          <span className="manage-videos__breadcrumb-sep">›</span>
          <span>Manage Videos</span>
        </div>

        <div className="manage-videos__header">
          <div className="manage-videos__header-content">
            <div className="manage-videos__header-icon">🎥</div>
            <div>
              <h1 className="manage-videos__title">Manage Videos</h1>
              <p className="manage-videos__subtitle">
                View, edit, and delete video highlights
              </p>
            </div>
          </div>
          <Link to="/admin/add-video" className="manage-videos__add-btn">
            ➕ Add New Video
          </Link>
        </div>

        {error && (
          <div className="manage-videos__alert manage-videos__alert--error">
            ⚠️ {error}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="manage-videos__empty">
            <div className="manage-videos__empty-icon">📹</div>
            <h2 className="manage-videos__empty-title">No Videos Yet</h2>
            <p className="manage-videos__empty-text">
              Get started by adding your first video highlight
            </p>
            <Link to="/admin/add-video" className="manage-videos__empty-btn">
              ➕ Add Your First Video
            </Link>
          </div>
        ) : (
          <>
            <div className="manage-videos__stats">
              <div className="manage-videos__stat">
                <span className="manage-videos__stat-value">{videos.length}</span>
                <span className="manage-videos__stat-label">Total Videos</span>
              </div>
            </div>

            <div className="manage-videos__list">
              {videos.map(video => (
                <div key={video.id} className="manage-videos__card">
                  <div className="manage-videos__card-thumb">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="manage-videos__card-img"
                    />
                    {video.duration && (
                      <span className="manage-videos__card-duration">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="manage-videos__card-content">
                    <h3 className="manage-videos__card-title">{video.title}</h3>
                    
                    {video.description && (
                      <p className="manage-videos__card-desc">
                        {video.description}
                      </p>
                    )}

                    <div className="manage-videos__card-meta">
                      <span className="manage-videos__card-meta-item">
                        👤 {video.author || 'Admin'}
                      </span>
                      <span className="manage-videos__card-meta-item">
                        📅 {formatDate(video.createdAt)}
                      </span>
                      {video.views && (
                        <span className="manage-videos__card-meta-item">
                          👁️ {video.views} views
                        </span>
                      )}
                    </div>

                    <div className="manage-videos__card-categories">
                      {video.categories && video.categories.map(cat => (
                        <span key={cat} className="manage-videos__card-category">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="manage-videos__card-source">
                      {video.uploadedVideoPath ? (
                        <span className="manage-videos__card-source-badge manage-videos__card-source-badge--upload">
                          📤 Uploaded File
                        </span>
                      ) : (
                        <span className="manage-videos__card-source-badge manage-videos__card-source-badge--url">
                          🔗 External URL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="manage-videos__card-actions">
                    {video.videoUrl && (
                      <a 
                        href={video.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="manage-videos__card-btn manage-videos__card-btn--view"
                      >
                        ▶️ View
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(video.id, video.title)}
                      disabled={deleteLoading === video.id}
                      className="manage-videos__card-btn manage-videos__card-btn--delete"
                    >
                      {deleteLoading === video.id ? '⏳' : '🗑️'} Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="manage-videos__footer">
          <Link to="/admin/articles" className="manage-videos__back-btn">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
