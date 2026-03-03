import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createArticle, fetchSections } from '../api';
import './CreateArticle.css';

const CATEGORIES = [
  'Cricket',
  'Football (ISL)',
  'Kabaddi',
  'Hockey',
  'Badminton',
  'Tennis',
  'NBA',
  'IPL',
  'Other'
];

const CATEGORY_PAGE_MAP = {
  'NHL': '/nhl',
  'NBA': '/nba',
  'MLB': '/mlb',
  'CFL': '/cfl',
  'Soccer': '/soccer',
  'Golf': '/golf',
  'Tennis': '/tennis',
  'Cricket': '/',
  'Football': '/',
  'Kabaddi': '/',
  'IPL': '/',
  'ISL': '/',
  'Other': '/'
};

export default function CreateArticle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    customSlug: '',
    subheadline: '',
    category: 'Cricket',
    author: 'Editorial Team',
    excerpt: '',
    content: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    status: 'published',
    publishDate: '',
    isPublished: true,
    isFeatured: false,
    isTopStory: false,
    isFeaturedStory: false,
    isTrending: false,
    isLatestNews: true,
    showOnHomepage: false,
    sectionIds: [],
  });
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSec, setAddingSec] = useState(false);
  const [showAddSec, setShowAddSec] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchSections().then(setSections).catch(() => {});
  }, []);

  async function handleAddSection(e) {
    e.preventDefault();
    const title = newSectionTitle.trim();
    if (!title) return;
    setAddingSec(true);
    try {
      const { createSection } = await import('../api');
      const created = await createSection({ title });
      setSections(prev => [...prev, created]);
      setForm(prev => ({ ...prev, sectionIds: [...prev.sectionIds, created.id] }));
      setNewSectionTitle('');
      setShowAddSec(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create section');
    } finally {
      setAddingSec(false);
    }
  }

  const getVisibilityInfo = () => {
    const category = form.category;
    const hasSpecificPage = CATEGORY_PAGE_MAP[category] !== '/';
    
    if (hasSpecificPage) {
      return {
        pages: ['Homepage (All Sports)', `${category} Page`],
        primary: `${category} Page`,
        route: CATEGORY_PAGE_MAP[category]
      };
    } else {
      return {
        pages: ['Homepage (All Sports)'],
        primary: 'Homepage',
        route: '/'
      };
    }
  };

  // Auto-generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-generate slug when title changes (unless user has manually edited slug)
    if (name === 'title' && !form.customSlug) {
      setForm((prev) => ({
        ...prev,
        title: value,
        customSlug: generateSlug(value),
        metaTitle: prev.metaTitle || value, // Auto-fill metaTitle if empty
      }));
    } else if (name === 'excerpt' && !form.metaDescription) {
      // Auto-fill metaDescription from excerpt if empty
      setForm((prev) => ({
        ...prev,
        excerpt: value,
        metaDescription: value.substring(0, 160),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        setStatus('error');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image file size must be less than 10MB');
        setStatus('error');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      if (status === 'error') {
        setStatus(null);
        setErrorMsg('');
      }
    }
  };

  const autoGenerateExcerpt = () => {
    if (form.content && !form.excerpt) {
      const plainText = form.content.replace(/<[^>]*>/g, '').trim();
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      setForm((prev) => ({ ...prev, excerpt }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('customSlug', form.customSlug.trim());
      formData.append('subheadline', form.subheadline.trim());
      formData.append('category', form.category);
      formData.append('excerpt', form.excerpt.trim());
      formData.append('content', form.content.trim());
      formData.append('tags', form.tags.trim());
      formData.append('metaTitle', form.metaTitle.trim() || form.title.trim());
      formData.append('metaDescription', form.metaDescription.trim() || form.excerpt.trim().substring(0, 160));
      formData.append('status', form.status);
      formData.append('publishDate', form.publishDate);
      formData.append('isPublished', form.status === 'published');
      
      // Add placement options
      formData.append('isFeatured', form.isFeatured);
      formData.append('isTopStory', form.isTopStory);
      formData.append('isFeaturedStory', form.isFeaturedStory);
      formData.append('isTrending', form.isTrending);
      formData.append('isLatestNews', form.isLatestNews);
      formData.append('showOnHomepage', form.showOnHomepage);
      formData.append('sectionIds', JSON.stringify(form.sectionIds));
      
      // Add image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const article = await createArticle(formData);
      setStatus('success');
      
      setTimeout(() => {
        navigate(`/article/${article.slug}`);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to create article. Is the backend running?');
    }
  };

  return (
    <div className="create-article-page">
      <div className="create-article-page__inner">
        <div className="create-article-page__breadcrumb">
          <Link to="/" className="create-article-page__breadcrumb-link">Home</Link>
          <span className="create-article-page__breadcrumb-sep">›</span>
          <span>Admin</span>
          <span className="create-article-page__breadcrumb-sep">›</span>
          <span>Create Article</span>
        </div>

        <div className="create-article-page__header">
          <div className="create-article-page__header-icon">📝</div>
          <div>
            <h1 className="create-article-page__title">Create New Article</h1>
            <p className="create-article-page__subtitle">
              Write a professional sports news article for DEGEN Sports
            </p>
          </div>
        </div>

        <div className="create-article-info-banner">
          <div className="create-article-info-banner__icon">ℹ️</div>
          <div className="create-article-info-banner__content">
            <h3 className="create-article-info-banner__title">Where will my article appear?</h3>
            <p className="create-article-info-banner__text">
              Articles appear on their category page based on the sport you select. 
              If you select a category with a dedicated page (NHL, NBA, MLB, CFL, Soccer, Golf, Tennis), 
              your article will appear on that specific league page. 
              <strong> To also show the article on the Homepage, check the "Show on Homepage" option below.</strong>
            </p>
          </div>
        </div>

        {status === 'success' && (
          <div className="article-alert article-alert--success">
            <span className="article-alert__icon">✓</span>
            <div>
              <strong>Article published successfully!</strong>
              <p>Redirecting to homepage...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="article-alert article-alert--error">
            <span className="article-alert__icon">✕</span>
            <div>
              <strong>Failed to publish article</strong>
              <p>{errorMsg}</p>
            </div>
            <button className="article-alert__close" onClick={() => setStatus(null)}>✕</button>
          </div>
        )}

        {previewMode ? (
          <div className="article-preview">
            <div className="article-preview__header">
              <button 
                className="article-preview__back"
                onClick={() => setPreviewMode(false)}
              >
                ✏️ Back to Edit
              </button>
              <h2 className="article-preview__title-label">Article Preview</h2>
            </div>
            
            <div className="article-preview__content">
              <div className="article-preview__meta">
                <span className="article-preview__category" style={{ background: '#0066cc' }}>
                  {form.category.toUpperCase()}
                </span>
              </div>
              
              <h1 className="article-preview__title">{form.title || 'Untitled Article'}</h1>
              
              {form.subheadline && (
                <p className="article-preview__subheadline">{form.subheadline}</p>
              )}
              
              <p className="article-preview__excerpt">{form.excerpt || 'No excerpt provided'}</p>
              
              <div className="article-preview__author-meta">
                <span>By {form.author}</span>
                <span>•</span>
                <span>Just now</span>
              </div>
              
              {imagePreview && (
                <div className="article-preview__image-wrap">
                  <img src={imagePreview} alt="Preview" className="article-preview__image" />
                </div>
              )}
              
              <div className="article-preview__body">
                {form.content ? (
                  <div dangerouslySetInnerHTML={{ __html: form.content.replace(/\n/g, '<br>') }} />
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No content yet...</p>
                )}
              </div>
              
              {form.tags && (
                <div className="article-preview__tags">
                  <strong>Tags:</strong> {form.tags}
                </div>
              )}
            </div>
            
            <div className="article-preview__actions">
              <button
                type="button"
                className="article-form__submit"
                onClick={handleSubmit}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Publishing...' : '⚡ Publish Article'}
              </button>
              <button
                type="button"
                className="article-form__preview-btn"
                onClick={() => setPreviewMode(false)}
              >
                ✏️ Edit Article
              </button>
            </div>
          </div>
        ) : (
          <form className="article-form" onSubmit={handleSubmit}>
          <div className="article-form__grid">
            <div className="article-form__main">
              <div className="article-form__field">
                <label className="article-form__label" htmlFor="title">
                  Article Title <span className="article-form__required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="article-form__input"
                  placeholder="Enter a compelling headline..."
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={200}
                />
                <span className="article-form__hint">{form.title.length}/200 characters</span>
              </div>

              <div className="article-form__field">
                <label className="article-form__label" htmlFor="subheadline">
                  Subheadline (Optional)
                </label>
                <input
                  id="subheadline"
                  name="subheadline"
                  type="text"
                  className="article-form__input"
                  placeholder="A catchy secondary headline..."
                  value={form.subheadline}
                  onChange={handleChange}
                  maxLength={150}
                />
                <span className="article-form__hint">Appears below the main title • {form.subheadline.length}/150 characters</span>
              </div>

              <div className="article-form__field">
                <label className="article-form__label" htmlFor="customSlug">
                  URL Slug
                </label>
                <input
                  id="customSlug"
                  name="customSlug"
                  type="text"
                  className="article-form__input"
                  placeholder="article-url-slug"
                  value={form.customSlug}
                  onChange={handleChange}
                  pattern="[a-z0-9-]+"
                />
                <span className="article-form__hint">
                  Auto-generated from title. Use lowercase letters, numbers, and hyphens only.
                </span>
              </div>

              <div className="article-form__field">
                <label className="article-form__label" htmlFor="excerpt">
                  Excerpt / Summary <span className="article-form__required">*</span>
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  className="article-form__textarea"
                  placeholder="Write a brief summary (100-200 characters)..."
                  value={form.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                  maxLength={200}
                />
                <div className="article-form__hint-row">
                  <span>{form.excerpt.length}/200 characters</span>
                  <button
                    type="button"
                    className="article-form__auto-btn"
                    onClick={autoGenerateExcerpt}
                  >
                    Auto-generate from content
                  </button>
                </div>
              </div>

              <div className="article-form__field">
                <label className="article-form__label" htmlFor="content">
                  Article Content <span className="article-form__required">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  className="article-form__textarea article-form__textarea--tall"
                  placeholder="Write the full article body here. You can use basic HTML formatting if needed..."
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={15}
                />
                <span className="article-form__hint">
                  Tip: Use paragraphs to structure your content. Basic HTML tags are supported.
                </span>
              </div>
            </div>

            <div className="article-form__sidebar">
              <div className="article-form__panel">
                <h3 className="article-form__panel-title">Publish Settings</h3>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="category">
                    Category / Sport <span className="article-form__required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="article-form__select"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <div className="article-form__visibility-info">
                    <div className="article-form__visibility-header">
                      <span className="article-form__visibility-icon">👁️</span>
                      <strong>Article will appear on:</strong>
                    </div>
                    <ul className="article-form__visibility-list">
                      {getVisibilityInfo().pages.map((page, index) => (
                        <li key={index} className="article-form__visibility-item">
                          {page}
                          {page === getVisibilityInfo().primary && (
                            <span className="article-form__visibility-badge">Primary</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="article-form__visibility-note">
                      💡 Tip: Check "Show on Homepage" below to display this article on the homepage.
                      {getVisibilityInfo().route !== '/' && (
                        <> This article will appear on the <Link to={getVisibilityInfo().route} className="article-form__visibility-link">{form.category} page</Link>.</>
                      )}
                    </p>
                    
                    <div className="article-form__field" style={{ marginTop: '1rem' }}>
                      <label className="article-form__checkbox-label">
                        <input
                          type="checkbox"
                          name="showOnHomepage"
                          checked={form.showOnHomepage}
                          onChange={handleChange}
                          className="article-form__checkbox"
                        />
                        <span>✓ Show on Homepage</span>
                      </label>
                      <span className="article-form__hint">Check this to display the article on the homepage</span>
                    </div>
                  </div>
                </div>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="author">
                    Author Name
                  </label>
                  <input
                    id="author"
                    name="author"
                    type="text"
                    className="article-form__input"
                    placeholder="Your name"
                    value={form.author}
                    onChange={handleChange}
                  />
                </div>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="image">
                    Featured Image
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="article-form__file-input"
                    onChange={handleImageChange}
                  />
                  <span className="article-form__hint">
                    Upload an image (JPEG, PNG, GIF, WebP - max 10MB). Images will be automatically resized to 1200x675px (16:9 landscape format).
                  </span>
                  {imageFile && (
                    <div className="article-form__file-info">
                      ✓ Image selected: <strong>{imageFile.name}</strong> ({(imageFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                {imagePreview && (
                  <div className="article-form__preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                    />
                  </div>
                )}

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="tags">
                    Tags
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    className="article-form__input"
                    placeholder="playoffs, breaking news, analysis"
                    value={form.tags}
                    onChange={handleChange}
                  />
                  <span className="article-form__hint">Comma-separated tags</span>
                </div>

              </div>

              <div className="article-form__panel">
                <h3 className="article-form__panel-title">🔍 SEO & Meta Tags</h3>
                <p className="article-form__panel-desc">
                  Optimize your article for search engines
                </p>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="metaTitle">
                    Meta Title
                  </label>
                  <input
                    id="metaTitle"
                    name="metaTitle"
                    type="text"
                    className="article-form__input"
                    placeholder="SEO-optimized title (defaults to article title)"
                    value={form.metaTitle}
                    onChange={handleChange}
                    maxLength={60}
                  />
                  <span className="article-form__hint">{form.metaTitle.length}/60 characters (optimal for Google)</span>
                </div>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="metaDescription">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    className="article-form__textarea"
                    placeholder="SEO description (defaults to excerpt)"
                    value={form.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    maxLength={160}
                  />
                  <span className="article-form__hint">{form.metaDescription.length}/160 characters (optimal for Google)</span>
                </div>
              </div>

              <div className="article-form__panel">
                <h3 className="article-form__panel-title">📅 Publishing Options</h3>
                <p className="article-form__panel-desc">
                  Control when and how your article is published
                </p>

                <div className="article-form__field">
                  <label className="article-form__label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="article-form__select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {form.status === 'scheduled' && (
                  <div className="article-form__field">
                    <label className="article-form__label" htmlFor="publishDate">
                      Publish Date & Time
                    </label>
                    <input
                      id="publishDate"
                      name="publishDate"
                      type="datetime-local"
                      className="article-form__input"
                      value={form.publishDate}
                      onChange={handleChange}
                    />
                    <span className="article-form__hint">Article will be published at this date/time</span>
                  </div>
                )}
              </div>

              <div className="article-form__panel">
                <h3 className="article-form__panel-title">📍 Article Placement</h3>
                <p className="article-form__panel-desc">
                  Choose where this article will appear on the homepage and category pages
                </p>

                <div className="article-form__placement-options">
                  <label className="article-form__placement-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="article-form__checkbox"
                    />
                    <div className="article-form__placement-info">
                      <span className="article-form__placement-name">⭐ Featured</span>
                      <span className="article-form__placement-desc">Hero carousel (main spotlight)</span>
                    </div>
                  </label>

                  <label className="article-form__placement-label">
                    <input
                      type="checkbox"
                      name="isTopStory"
                      checked={form.isTopStory}
                      onChange={handleChange}
                      className="article-form__checkbox"
                    />
                    <div className="article-form__placement-info">
                      <span className="article-form__placement-name">🔥 Top Stories</span>
                      <span className="article-form__placement-desc">Top stories section</span>
                    </div>
                  </label>

                  <label className="article-form__placement-label">
                    <input
                      type="checkbox"
                      name="isFeaturedStory"
                      checked={form.isFeaturedStory}
                      onChange={handleChange}
                      className="article-form__checkbox"
                    />
                    <div className="article-form__placement-info">
                      <span className="article-form__placement-name">🌟 Featured Stories</span>
                      <span className="article-form__placement-desc">Featured Stories section</span>
                    </div>
                  </label>

                  <label className="article-form__placement-label">
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={form.isTrending}
                      onChange={handleChange}
                      className="article-form__checkbox"
                    />
                    <div className="article-form__placement-info">
                      <span className="article-form__placement-name">📈 Trending</span>
                      <span className="article-form__placement-desc">Trending sidebar widget</span>
                    </div>
                  </label>

                  <label className="article-form__placement-label">
                    <input
                      type="checkbox"
                      name="isLatestNews"
                      checked={form.isLatestNews}
                      onChange={handleChange}
                      className="article-form__checkbox"
                    />
                    <div className="article-form__placement-info">
                      <span className="article-form__placement-name">📰 Latest News</span>
                      <span className="article-form__placement-desc">Latest news feed (default)</span>
                    </div>
                  </label>

                  <div className="article-form__placement-divider">
                    Custom Sections
                    <button
                      type="button"
                      className="article-form__add-section-btn"
                      onClick={() => setShowAddSec(v => !v)}
                    >
                      {showAddSec ? '✕ Cancel' : '+ Add Section'}
                    </button>
                  </div>

                  {showAddSec && (
                    <form className="article-form__new-section" onSubmit={handleAddSection}>
                      <input
                        className="article-form__new-section-input"
                        type="text"
                        placeholder="Section title (e.g. Weekend Recap)"
                        value={newSectionTitle}
                        onChange={e => setNewSectionTitle(e.target.value)}
                        maxLength={60}
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        className="article-form__new-section-submit"
                        disabled={addingSec || !newSectionTitle.trim()}
                      >
                        {addingSec ? '…' : 'Create'}
                      </button>
                    </form>
                  )}

                  {sections.map(section => {
                    const checked = form.sectionIds.includes(section.id);
                    return (
                      <label key={section.id} className="article-form__placement-label">
                        <input
                          type="checkbox"
                          className="article-form__checkbox"
                          checked={checked}
                          onChange={() => {
                            setForm(prev => ({
                              ...prev,
                              sectionIds: checked
                                ? prev.sectionIds.filter(id => id !== section.id)
                                : [...prev.sectionIds, section.id],
                            }));
                          }}
                        />
                        <div className="article-form__placement-info">
                          <span className="article-form__placement-name">📂 {section.title}</span>
                          <span className="article-form__placement-desc">
                            {section.description || `Appears under "${section.title}" on the homepage`}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="article-form__panel">
                <div className="article-form__button-group">
                  <button
                    type="button"
                    className="article-form__preview-btn"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? '✏️ Edit' : '👁️ Preview'}
                  </button>
                  <button
                    type="submit"
                    className="article-form__submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="article-form__spinner" />
                        Publishing...
                      </>
                    ) : (
                      '⚡ Publish Article'
                    )}
                  </button>
                </div>

                <Link to="/" className="article-form__cancel">
                  ← Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
