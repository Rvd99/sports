import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AddVideo.css';

export default function AddVideo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoSource: 'url', // 'url' or 'upload'
    videoUrl: '',
    videoFile: null,
    thumbnailSource: 'upload', // 'url' or 'upload' - default to upload for easier desktop image selection
    thumbnailUrl: '',
    thumbnailFile: null,
    categories: []
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const availableCategories = [
    'Homepage',
    'Cricket',
    'Basketball',
    'Hockey',
    'Football',
    'Athletics',
    'Domestic',
    'Tennis',
    'Golf',
    'Boxing',
    'Rugby'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, videoFile: file }));
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnailFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    setThumbnailPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    if (formData.videoSource === 'url' && !formData.videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }

    if (formData.videoSource === 'upload' && !formData.videoFile) {
      setError('Please select a video file to upload');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categories', JSON.stringify(formData.categories));

      // Add video source
      if (formData.videoSource === 'url') {
        formDataToSend.append('videoUrl', formData.videoUrl);
      } else if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile);
      }

      // Add thumbnail
      if (formData.thumbnailSource === 'url' && formData.thumbnailUrl) {
        formDataToSend.append('thumbnailUrl', formData.thumbnailUrl);
      } else if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      const userRole = localStorage.getItem('userRole');
      const response = await fetch('http://localhost:5001/api/videos', {
        method: 'POST',
        headers: {
          'x-user-role': userRole || 'admin'
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video');
      }

      setSuccess('Video created successfully!');
      setTimeout(() => {
        navigate('/admin/videos');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-video">
      <div className="add-video__inner">
        <div className="add-video__breadcrumb">
          <Link to="/" className="add-video__breadcrumb-link">Home</Link>
          <span className="add-video__breadcrumb-sep">›</span>
          <Link to="/admin/articles" className="add-video__breadcrumb-link">Admin</Link>
          <span className="add-video__breadcrumb-sep">›</span>
          <Link to="/admin/videos" className="add-video__breadcrumb-link">Manage Videos</Link>
          <span className="add-video__breadcrumb-sep">›</span>
          <span>Add Video</span>
        </div>

        <div className="add-video__header">
          <div className="add-video__header-icon">🎥</div>
          <div>
            <h1 className="add-video__title">Add New Video</h1>
            <p className="add-video__subtitle">Upload or link to video highlights</p>
          </div>
        </div>

        {error && (
          <div className="add-video__alert add-video__alert--error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="add-video__alert add-video__alert--success">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-video__form">
          {/* Title */}
          <div className="add-video__field">
            <label className="add-video__label">
              Video Title <span className="add-video__required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Matthews OT Winner — Full Highlight Package"
              className="add-video__input"
              required
            />
          </div>

          {/* Description */}
          <div className="add-video__field">
            <label className="add-video__label">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the video..."
              className="add-video__textarea"
              rows="3"
            />
          </div>

          {/* Video Source */}
          <div className="add-video__field">
            <label className="add-video__label">
              Video Source <span className="add-video__required">*</span>
            </label>
            <div className="add-video__radio-group">
              <label className="add-video__radio">
                <input
                  type="radio"
                  name="videoSource"
                  value="url"
                  checked={formData.videoSource === 'url'}
                  onChange={handleInputChange}
                />
                <span>URL (YouTube/Embed)</span>
              </label>
              <label className="add-video__radio">
                <input
                  type="radio"
                  name="videoSource"
                  value="upload"
                  checked={formData.videoSource === 'upload'}
                  onChange={handleInputChange}
                />
                <span>Upload File</span>
              </label>
            </div>
          </div>

          {/* Video URL or File */}
          {formData.videoSource === 'url' ? (
            <div className="add-video__field">
              <label className="add-video__label">Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="add-video__input"
              />
              <p className="add-video__hint">
                Paste YouTube, Vimeo, or direct video URL
              </p>
            </div>
          ) : (
            <div className="add-video__field">
              <label className="add-video__label">Upload Video File</label>
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                onChange={handleVideoFileChange}
                className="add-video__file-input"
              />
              {formData.videoFile && (
                <p className="add-video__file-name">
                  Selected: {formData.videoFile.name}
                </p>
              )}
              <p className="add-video__hint">
                Supported formats: MP4, MOV, AVI, MKV, WebM (max 500MB)
              </p>
            </div>
          )}

          {/* Thumbnail Source */}
          <div className="add-video__field">
            <label className="add-video__label">
              Thumbnail Image <span className="add-video__required">*</span>
            </label>
            <p className="add-video__hint" style={{ marginBottom: '0.75rem' }}>
              Choose how to add the video thumbnail image
            </p>
            <div className="add-video__radio-group">
              <label className="add-video__radio">
                <input
                  type="radio"
                  name="thumbnailSource"
                  value="upload"
                  checked={formData.thumbnailSource === 'upload'}
                  onChange={handleInputChange}
                />
                <span>📤 Upload from Computer</span>
              </label>
              <label className="add-video__radio">
                <input
                  type="radio"
                  name="thumbnailSource"
                  value="url"
                  checked={formData.thumbnailSource === 'url'}
                  onChange={handleInputChange}
                />
                <span>🔗 Use Image URL</span>
              </label>
            </div>
          </div>

          {/* Thumbnail URL or File */}
          {formData.thumbnailSource === 'url' ? (
            <div className="add-video__field">
              <label className="add-video__label">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleThumbnailUrlChange}
                placeholder="https://example.com/thumbnail.jpg"
                className="add-video__input"
              />
            </div>
          ) : (
            <div className="add-video__field">
              <label className="add-video__label">Upload Thumbnail</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleThumbnailFileChange}
                className="add-video__file-input"
              />
              {formData.thumbnailFile && (
                <p className="add-video__file-name">
                  Selected: {formData.thumbnailFile.name}
                </p>
              )}
            </div>
          )}

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="add-video__preview">
              <label className="add-video__label">Thumbnail Preview</label>
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                className="add-video__preview-img"
              />
            </div>
          )}

          {/* Categories */}
          <div className="add-video__field">
            <label className="add-video__label">
              Categories <span className="add-video__required">*</span>
            </label>
            <p className="add-video__hint">
              Select where this video should appear (select multiple)
            </p>
            <div className="add-video__categories">
              {availableCategories.map(category => (
                <label key={category} className="add-video__checkbox">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <div className="add-video__selected-cats">
                <strong>Selected:</strong> {formData.categories.join(', ')}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="add-video__actions">
            <button
              type="submit"
              disabled={loading}
              className="add-video__submit"
            >
              {loading ? '⏳ Creating...' : '✓ Create Video'}
            </button>
            <Link to="/admin/videos" className="add-video__cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
