import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSections, createSection, deleteSection, updateSection, fetchTwitterPosts, addTwitterPost, deleteTwitterPost } from '../api';
import './ManageSections.css';

const PAGE_OPTIONS = [
  { value: 'home',       label: '🏠 Homepage' },
  { value: 'cricket',   label: '🏏 Cricket' },
  { value: 'basketball',label: '🏀 Basketball' },
  { value: 'hockey',    label: '🏒 Hockey' },
  { value: 'football',  label: '⚽ Football' },
  { value: 'tennis',    label: '🎾 Tennis' },
  { value: 'golf',      label: '⛳ Golf' },
  { value: 'athletics', label: '🏃 Athletics' },
  { value: 'boxing',    label: '🥊 Boxing' },
  { value: 'rugby',     label: '🏉 Rugby' },
  { value: 'mls',       label: '⚽ MLS' },
  { value: 'formula-1', label: '🏎 Formula 1' },
  { value: 'nascar',    label: '🏁 NASCAR' },
  { value: 'ufc-mma',   label: '🥋 UFC/MMA' },
  { value: 'olympics',  label: '🏅 Olympics' },
  { value: 'esports',   label: '🎮 Esports' },
];

const POSITION_OPTIONS = [
  { value: 0, label: 'Top — Above Hero' },
  { value: 1, label: 'After Hero' },
  { value: 2, label: 'After Top Stories' },
  { value: 3, label: 'After Videos' },
  { value: 4, label: 'Bottom of Page' },
];

export default function ManageSections() {
  const [activeTab, setActiveTab] = useState('sections');

  // Sections state
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPage, setNewPage] = useState('home');
  const [newPosition, setNewPosition] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Twitter posts state
  const [twitterPosts, setTwitterPosts] = useState([]);
  const [twitterLoading, setTwitterLoading] = useState(true);
  const [newTweetUrl, setNewTweetUrl] = useState('');
  const [newTweetLabel, setNewTweetLabel] = useState('');
  const [newTweetPages, setNewTweetPages] = useState(['all']);
  const [addingTweet, setAddingTweet] = useState(false);
  const [twitterError, setTwitterError] = useState('');
  const [twitterSuccess, setTwitterSuccess] = useState('');

  useEffect(() => {
    loadSections();
    loadTwitterPosts();
  }, []);

  async function loadSections() {
    try {
      const data = await fetchSections();
      setSections(data);
    } catch {
      setError('Failed to load sections. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const created = await createSection({
        title: newTitle.trim(),
        description: newDesc.trim(),
        page: newPage,
        position: newPosition,
      });
      setSections(prev => [...prev, created]);
      setNewTitle('');
      setNewDesc('');
      setNewPage('home');
      setNewPosition(1);
      setSuccess(`Section "${created.title}" created on ${PAGE_OPTIONS.find(p => p.value === created.page)?.label || created.page}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(section) {
    if (!window.confirm(`Delete section "${section.title}"? Articles will no longer appear under it.`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteSection(section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
      setSuccess(`Section "${section.title}" deleted.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadTwitterPosts() {
    try {
      const data = await fetchTwitterPosts();
      setTwitterPosts(data);
    } catch {
      setTwitterError('Failed to load Twitter posts. Is the backend running?');
    } finally {
      setTwitterLoading(false);
    }
  }

  function toggleTweetPage(val) {
    if (val === 'all') {
      setNewTweetPages(['all']);
      return;
    }
    setNewTweetPages(prev => {
      const without = prev.filter(p => p !== 'all');
      return without.includes(val)
        ? without.filter(p => p !== val) || ['all']
        : [...without, val];
    });
  }

  async function handleAddTweet(e) {
    e.preventDefault();
    if (!newTweetUrl.trim()) return;
    setAddingTweet(true);
    setTwitterError('');
    setTwitterSuccess('');
    try {
      const pages = newTweetPages.length === 0 ? ['all'] : newTweetPages;
      const created = await addTwitterPost({ url: newTweetUrl.trim(), label: newTweetLabel.trim(), pages });
      setTwitterPosts(prev => [created, ...prev]);
      setNewTweetUrl('');
      setNewTweetLabel('');
      setNewTweetPages(['all']);
      const pageNames = pages.includes('all') ? 'all pages' : pages.join(', ');
      setTwitterSuccess(`Tweet added — visible on ${pageNames}.`);
    } catch (err) {
      setTwitterError(err.message);
    } finally {
      setAddingTweet(false);
    }
  }

  async function handleDeleteTweet(post) {
    if (!window.confirm('Remove this tweet from the sidebar?')) return;
    setTwitterError('');
    setTwitterSuccess('');
    try {
      await deleteTwitterPost(post.id);
      setTwitterPosts(prev => prev.filter(p => p.id !== post.id));
      setTwitterSuccess('Tweet removed from sidebar.');
    } catch (err) {
      setTwitterError(err.message);
    }
  }

  return (
    <div className="manage-sections">
      <div className="manage-sections__inner">
        <div className="manage-sections__breadcrumb">
          <Link to="/" className="manage-sections__breadcrumb-link">Home</Link>
          <span className="manage-sections__breadcrumb-sep">›</span>
          <span>Admin</span>
          <span className="manage-sections__breadcrumb-sep">›</span>
          <span>Manage Sections</span>
        </div>

        <div className="manage-sections__header">
          <div className="manage-sections__header-icon">📋</div>
          <div>
            <h1 className="manage-sections__title">Manage Sections</h1>
            <p className="manage-sections__subtitle">
              Create content containers for any page, and manage Twitter/X posts for the sidebar.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="manage-sections__tabs">
          <button
            className={`manage-sections__tab${activeTab === 'sections' ? ' manage-sections__tab--active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            📋 Content Sections
          </button>
          <button
            className={`manage-sections__tab${activeTab === 'twitter' ? ' manage-sections__tab--active' : ''}`}
            onClick={() => setActiveTab('twitter')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:'middle',marginRight:4}}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Trending Now Posts
          </button>
        </div>

        {/* Sections tab alerts */}
        {activeTab === 'sections' && error && (
          <div className="manage-sections__alert manage-sections__alert--error">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
        {activeTab === 'sections' && success && (
          <div className="manage-sections__alert manage-sections__alert--success">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        {/* Twitter tab alerts */}
        {activeTab === 'twitter' && twitterError && (
          <div className="manage-sections__alert manage-sections__alert--error">
            <span>⚠ {twitterError}</span>
            <button onClick={() => setTwitterError('')}>✕</button>
          </div>
        )}
        {activeTab === 'twitter' && twitterSuccess && (
          <div className="manage-sections__alert manage-sections__alert--success">
            <span>✓ {twitterSuccess}</span>
            <button onClick={() => setTwitterSuccess('')}>✕</button>
          </div>
        )}

        <div className="manage-sections__grid" style={{ display: activeTab === 'sections' ? undefined : 'none' }}>
          {/* Create Form */}
          <div className="manage-sections__panel">
            <h2 className="manage-sections__panel-title">➕ Add New Section</h2>
            <p className="manage-sections__panel-desc">
              Give your section a title. This title will appear as the header on the homepage container.
              When assigning articles, select this section under Article Placement.
            </p>
            <form className="manage-sections__form" onSubmit={handleCreate}>
              <div className="manage-sections__field">
                <label className="manage-sections__label" htmlFor="sec-title">
                  Container Title <span className="manage-sections__required">*</span>
                </label>
                <input
                  id="sec-title"
                  className="manage-sections__input"
                  type="text"
                  placeholder="e.g. Weekend Recap, Top NHL Stories"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  maxLength={60}
                />
                <span className="manage-sections__hint">{newTitle.length}/60 characters</span>
              </div>

              <div className="manage-sections__field">
                <label className="manage-sections__label" htmlFor="sec-page">
                  Page <span className="manage-sections__required">*</span>
                </label>
                <select
                  id="sec-page"
                  className="manage-sections__input manage-sections__select"
                  value={newPage}
                  onChange={e => setNewPage(e.target.value)}
                >
                  {PAGE_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <span className="manage-sections__hint">Which page this container appears on</span>
              </div>

              <div className="manage-sections__field">
                <label className="manage-sections__label" htmlFor="sec-position">
                  Position on Page
                </label>
                <select
                  id="sec-position"
                  className="manage-sections__input manage-sections__select"
                  value={newPosition}
                  onChange={e => setNewPosition(Number(e.target.value))}
                >
                  {POSITION_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="manage-sections__field">
                <label className="manage-sections__label" htmlFor="sec-desc">
                  Description (optional)
                </label>
                <input
                  id="sec-desc"
                  className="manage-sections__input"
                  type="text"
                  placeholder="Short description for admin reference"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  maxLength={120}
                />
              </div>

              <button
                type="submit"
                className="manage-sections__btn manage-sections__btn--primary"
                disabled={creating || !newTitle.trim()}
              >
                {creating ? 'Creating…' : '➕ Create Container'}
              </button>
            </form>
          </div>

          {/* Sections List */}
          <div className="manage-sections__panel">
            <h2 className="manage-sections__panel-title">
              📋 Existing Sections
              <span className="manage-sections__count">{sections.length}</span>
            </h2>

            {loading ? (
              <div className="manage-sections__loading">Loading sections…</div>
            ) : sections.length === 0 ? (
              <div className="manage-sections__empty">
                No sections yet. Create your first section above.
              </div>
            ) : (
              <ul className="manage-sections__list">
                {sections.map(section => {
                  const pageLabel = PAGE_OPTIONS.find(p => p.value === section.page)?.label || section.page || 'Homepage';
                  const posLabel = POSITION_OPTIONS.find(p => p.value === section.position)?.label || `Position ${section.position}`;
                  return (
                    <li key={section.id} className="manage-sections__item">
                      <div className="manage-sections__item-info">
                        <div className="manage-sections__item-title">{section.title}</div>
                        <div className="manage-sections__item-tags">
                          <span className="manage-sections__tag manage-sections__tag--page">{pageLabel}</span>
                          <span className="manage-sections__tag manage-sections__tag--pos">{posLabel}</span>
                        </div>
                        {section.description && (
                          <div className="manage-sections__item-desc">{section.description}</div>
                        )}
                        <div className="manage-sections__item-meta">
                          slug: <code className="manage-sections__slug">{section.slug}</code>
                        </div>
                      </div>
                      <button
                        className="manage-sections__btn manage-sections__btn--delete"
                        onClick={() => handleDelete(section)}
                        title={`Delete "${section.title}"`}
                      >
                        🗑 Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Twitter Posts Tab */}
        {activeTab === 'twitter' && (
          <div className="manage-sections__grid">
            {/* Add Tweet Form */}
            <div className="manage-sections__panel">
              <h2 className="manage-sections__panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:'middle',marginRight:6}}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Add Twitter/X Post
              </h2>
              <p className="manage-sections__panel-desc">
                Paste a Twitter/X post URL and choose which pages show it in the Trending Now sidebar.
              </p>
              <form className="manage-sections__form" onSubmit={handleAddTweet}>
                <div className="manage-sections__field">
                  <label className="manage-sections__label" htmlFor="tweet-url">
                    Tweet URL <span className="manage-sections__required">*</span>
                  </label>
                  <input
                    id="tweet-url"
                    className="manage-sections__input"
                    type="url"
                    placeholder="https://twitter.com/user/status/1234567890"
                    value={newTweetUrl}
                    onChange={e => setNewTweetUrl(e.target.value)}
                    required
                  />
                  <span className="manage-sections__hint">
                    Supports twitter.com and x.com post URLs
                  </span>
                </div>
                <div className="manage-sections__field">
                  <label className="manage-sections__label" htmlFor="tweet-label">
                    Label (optional)
                  </label>
                  <input
                    id="tweet-label"
                    className="manage-sections__input"
                    type="text"
                    placeholder="e.g. Trade rumour, Injury update…"
                    value={newTweetLabel}
                    onChange={e => setNewTweetLabel(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div className="manage-sections__field">
                  <label className="manage-sections__label">Show On</label>
                  <div className="manage-sections__checkboxes">
                    {[{ value: 'all', label: '🌐 All Pages' }, ...PAGE_OPTIONS].map(p => (
                      <label key={p.value} className="manage-sections__check-label">
                        <input
                          type="checkbox"
                          checked={newTweetPages.includes(p.value)}
                          onChange={() => toggleTweetPage(p.value)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="manage-sections__btn manage-sections__btn--primary"
                  disabled={addingTweet || !newTweetUrl.trim() || newTweetPages.length === 0}
                >
                  {addingTweet ? 'Adding…' : '➕ Add to Sidebar'}
                </button>
              </form>
            </div>

            {/* Tweet List */}
            <div className="manage-sections__panel">
              <h2 className="manage-sections__panel-title">
                Live Posts
                <span className="manage-sections__count">{twitterPosts.length}</span>
              </h2>
              <p className="manage-sections__panel-desc">
                Posts are shown newest-first in the sidebar. Remove any post to hide it from visitors.
              </p>
              {twitterLoading ? (
                <div className="manage-sections__loading">Loading posts…</div>
              ) : twitterPosts.length === 0 ? (
                <div className="manage-sections__empty">
                  No posts yet. Add a Twitter/X URL on the left.
                </div>
              ) : (
                <ul className="manage-sections__list">
                  {twitterPosts.map(post => (
                    <li key={post.id} className="manage-sections__item">
                      <div className="manage-sections__item-info">
                        {post.label && (
                          <div className="manage-sections__item-title">{post.label}</div>
                        )}
                        <div className="manage-sections__item-tags">
                          {(post.pages || ['all']).map(pg => {
                            const opt = pg === 'all' ? { label: '🌐 All Pages' } : PAGE_OPTIONS.find(o => o.value === pg);
                            return <span key={pg} className="manage-sections__tag manage-sections__tag--page">{opt?.label || pg}</span>;
                          })}
                        </div>
                        <div className="manage-sections__item-meta">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="manage-sections__tweet-url"
                          >
                            {post.url.length > 60 ? post.url.slice(0, 60) + '…' : post.url}
                          </a>
                        </div>
                        <div className="manage-sections__item-meta" style={{marginTop:2}}>
                          Added {new Date(post.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        className="manage-sections__btn manage-sections__btn--delete"
                        onClick={() => handleDeleteTweet(post)}
                        title="Remove from sidebar"
                      >
                        🗑 Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="manage-sections__actions">
          <Link to="/admin/articles" className="manage-sections__back-link">← Back to Admin Articles</Link>
        </div>
      </div>
    </div>
  );
}
