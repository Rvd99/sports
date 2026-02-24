import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPost } from '../api';
import './AdminAddPost.css';

const LEAGUES = ['NHL', 'NBA', 'MLB', 'CFL', 'Soccer', 'Golf', 'Tennis'];

export default function AdminAddPost() {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    league: 'NHL',
    image: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await createPost({
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        league: form.league.toLowerCase(),
        image: form.image.trim() || undefined,
      });
      setStatus('success');
      setForm({ title: '', excerpt: '', content: '', league: 'NHL', image: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Is the backend running?');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__inner">
        {/* Breadcrumb */}
        <div className="admin-page__breadcrumb">
          <Link to="/" className="admin-page__breadcrumb-link">Home</Link>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span>Admin</span>
          <span className="admin-page__breadcrumb-sep">›</span>
          <span>Add Post</span>
        </div>

        <div className="admin-page__header">
          <div className="admin-page__header-icon">✏</div>
          <div>
            <h1 className="admin-page__title">Add New Post</h1>
            <p className="admin-page__subtitle">
              Create a new article that will appear on the site immediately.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {status === 'success' && (
          <div className="admin-alert admin-alert--success">
            <span className="admin-alert__icon">✓</span>
            <div>
              <strong>Post published successfully!</strong>
              <p>Your article is now live on the site. Visit the homepage or the relevant league page to see it.</p>
            </div>
            <button className="admin-alert__close" onClick={() => setStatus(null)}>✕</button>
          </div>
        )}

        {/* Error Banner */}
        {status === 'error' && (
          <div className="admin-alert admin-alert--error">
            <span className="admin-alert__icon">✕</span>
            <div>
              <strong>Failed to publish post</strong>
              <p>{errorMsg}</p>
            </div>
            <button className="admin-alert__close" onClick={() => setStatus(null)}>✕</button>
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            {/* Left column */}
            <div className="admin-form__main">
              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="title">
                  Headline <span className="admin-form__required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="admin-form__input"
                  placeholder="Enter a compelling headline..."
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={200}
                />
                <span className="admin-form__hint">{form.title.length}/200 characters</span>
              </div>

              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="excerpt">
                  Excerpt / Summary <span className="admin-form__required">*</span>
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  className="admin-form__textarea"
                  placeholder="Write a short summary that appears in the news feed (1–2 sentences)..."
                  value={form.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                  maxLength={400}
                />
                <span className="admin-form__hint">{form.excerpt.length}/400 characters</span>
              </div>

              <div className="admin-form__field">
                <label className="admin-form__label" htmlFor="content">
                  Full Article Content <span className="admin-form__optional">(optional)</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  className="admin-form__textarea admin-form__textarea--tall"
                  placeholder="Write the full article body here..."
                  value={form.content}
                  onChange={handleChange}
                  rows={10}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="admin-form__sidebar">
              <div className="admin-form__panel">
                <h3 className="admin-form__panel-title">Publish Settings</h3>

                <div className="admin-form__field">
                  <label className="admin-form__label" htmlFor="league">
                    League <span className="admin-form__required">*</span>
                  </label>
                  <select
                    id="league"
                    name="league"
                    className="admin-form__select"
                    value={form.league}
                    onChange={handleChange}
                    required
                  >
                    {LEAGUES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form__field">
                  <label className="admin-form__label" htmlFor="image">
                    Image URL <span className="admin-form__optional">(optional)</span>
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    className="admin-form__input"
                    placeholder="https://example.com/image.jpg"
                    value={form.image}
                    onChange={handleChange}
                  />
                  <span className="admin-form__hint">Leave blank to auto-generate a placeholder image.</span>
                </div>

                {/* Image preview */}
                {form.image && (
                  <div className="admin-form__preview">
                    <img
                      src={form.image}
                      alt="Preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-form__submit"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="admin-form__spinner" />
                      Publishing...
                    </>
                  ) : (
                    '⚡ Publish Post'
                  )}
                </button>

                <Link to="/" className="admin-form__cancel">
                  ← Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
