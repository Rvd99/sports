import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSections, createSection, deleteSection, updateSection, fetchTwitterPosts, addTwitterPost, deleteTwitterPost, fetchPolls, createPoll, deletePoll, updatePoll, resolvePoll, fetchAdminForumThreads, moderateForumThread, deleteForumThread, deleteForumReply, fetchForumReplies } from '../api';
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
  const [newStyle, setNewStyle] = useState('default');
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

  // Polls state
  const [polls, setPolls] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '']);
  const [pollPosition, setPollPosition] = useState('above-twitter');
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollError, setPollError] = useState('');
  const [pollSuccess, setPollSuccess] = useState('');
  const [resolvingPoll, setResolvingPoll] = useState(null);
  const [resolveChoice, setResolveChoice] = useState({});

  // Forum moderation state
  const [forumThreads, setForumThreads] = useState([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumFilter, setForumFilter] = useState('pending');
  const [forumError, setForumError] = useState('');
  const [forumSuccess, setForumSuccess] = useState('');
  const [expandedThread, setExpandedThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState({});

  useEffect(() => {
    loadSections();
    loadTwitterPosts();
    loadPolls();
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
        style: newStyle,
      });
      setSections(prev => [...prev, created]);
      setNewTitle('');
      setNewDesc('');
      setNewPage('home');
      setNewPosition(1);
      setNewStyle('default');
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

  async function loadForumThreads(status) {
    setForumLoading(true);
    setForumError('');
    try {
      const data = await fetchAdminForumThreads({ status });
      setForumThreads(data);
    } catch (err) {
      setForumError(err.message);
    } finally {
      setForumLoading(false);
    }
  }

  async function handleForumModerate(thread, status) {
    setForumError(''); setForumSuccess('');
    try {
      await moderateForumThread(thread.id, { status });
      setForumThreads(prev => prev.map(t => t.id === thread.id ? { ...t, status } : t));
      setForumSuccess(`Thread "${thread.title.slice(0,40)}…" ${status}.`);
      setTimeout(() => setForumSuccess(''), 3000);
    } catch (err) { setForumError(err.message); }
  }

  async function handleForumPin(thread) {
    setForumError('');
    try {
      const updated = await moderateForumThread(thread.id, { pinned: !thread.pinned });
      setForumThreads(prev => prev.map(t => t.id === thread.id ? { ...t, pinned: updated.pinned } : t));
    } catch (err) { setForumError(err.message); }
  }

  async function handleForumDelete(thread) {
    if (!window.confirm(`Delete thread "${thread.title}"? This also removes all replies.`)) return;
    setForumError(''); setForumSuccess('');
    try {
      await deleteForumThread(thread.id);
      setForumThreads(prev => prev.filter(t => t.id !== thread.id));
      setForumSuccess('Thread deleted.');
      setTimeout(() => setForumSuccess(''), 3000);
    } catch (err) { setForumError(err.message); }
  }

  async function handleForumDeleteReply(replyId, threadId) {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await deleteForumReply(replyId);
      setThreadReplies(prev => ({ ...prev, [threadId]: (prev[threadId] || []).filter(r => r.id !== replyId) }));
    } catch (err) { setForumError(err.message); }
  }

  async function handleExpandThread(thread) {
    if (expandedThread === thread.id) { setExpandedThread(null); return; }
    setExpandedThread(thread.id);
    if (!threadReplies[thread.id]) {
      try {
        const replies = await fetchForumReplies(thread.id);
        setThreadReplies(prev => ({ ...prev, [thread.id]: replies }));
      } catch {}
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

  async function loadPolls() {
    try {
      const data = await fetchPolls();
      setPolls(data);
    } catch {
      setPollError('Failed to load polls. Is the backend running?');
    } finally {
      setPollsLoading(false);
    }
  }

  async function handleCreatePoll(e) {
    e.preventDefault();
    const validOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) {
      setPollError('Question and at least 2 options are required.');
      return;
    }
    setCreatingPoll(true);
    setPollError('');
    setPollSuccess('');
    try {
      const created = await createPoll({
        question: pollQuestion.trim(),
        options: validOptions,
        sidebar: true,
        sidebarPosition: pollPosition,
      });
      setPolls(prev => [created, ...prev]);
      setPollQuestion('');
      setPollOptions(['', '', '', '']);
      setPollPosition('above-twitter');
      setPollSuccess(`Poll "${created.question}" created and live in sidebar.`);
    } catch (err) {
      setPollError(err.message);
    } finally {
      setCreatingPoll(false);
    }
  }

  async function handleDeletePoll(poll) {
    if (!window.confirm(`Delete poll "${poll.question}"?`)) return;
    setPollError('');
    try {
      await deletePoll(poll.id);
      setPolls(prev => prev.filter(p => p.id !== poll.id));
      setPollSuccess('Poll deleted.');
    } catch (err) {
      setPollError(err.message);
    }
  }

  async function handleTogglePoll(poll) {
    try {
      const updated = await updatePoll(poll.id, { active: !poll.active });
      setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, ...updated } : p));
    } catch (err) {
      setPollError(err.message);
    }
  }

  async function handleResolvePoll(poll) {
    const chosen = resolveChoice[poll.id];
    if (!chosen) { setPollError('Select the correct answer first.'); return; }
    if (!window.confirm(`Mark "${poll.options.find(o=>o.id===parseInt(chosen))?.text}" as the correct answer? This will score all users.`)) return;
    setPollError('');
    setPollSuccess('');
    try {
      const updated = await resolvePoll(poll.id, parseInt(chosen));
      setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, ...updated, active: false } : p));
      setResolvingPoll(null);
      setResolveChoice(prev => { const n = {...prev}; delete n[poll.id]; return n; });
      setPollSuccess(`Poll resolved — correct answer: "${updated.correctOptionText}". User predictions scored.`);
    } catch (err) {
      setPollError(err.message);
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
          <button
            className={`manage-sections__tab${activeTab === 'polls' ? ' manage-sections__tab--active' : ''}`}
            onClick={() => setActiveTab('polls')}
          >
            📊 Live Polls
          </button>
          <button
            className={`manage-sections__tab${activeTab === 'forums' ? ' manage-sections__tab--active' : ''}`}
            onClick={() => { setActiveTab('forums'); loadForumThreads(forumFilter); }}
          >
            💬 Fan Forums
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

        {/* Polls tab alerts */}
        {activeTab === 'polls' && pollError && (
          <div className="manage-sections__alert manage-sections__alert--error">
            <span>⚠ {pollError}</span>
            <button onClick={() => setPollError('')}>✕</button>
          </div>
        )}
        {activeTab === 'polls' && pollSuccess && (
          <div className="manage-sections__alert manage-sections__alert--success">
            <span>✓ {pollSuccess}</span>
            <button onClick={() => setPollSuccess('')}>✕</button>
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
                <label className="manage-sections__label" htmlFor="sec-style">
                  Container Style
                </label>
                <select
                  id="sec-style"
                  className="manage-sections__input manage-sections__select"
                  value={newStyle}
                  onChange={e => setNewStyle(e.target.value)}
                >
                  <option value="default">Default — Large card + side cards + headlines</option>
                  <option value="must-see">Must See — 4-column image grid</option>
                  <option value="featured-stories">Featured Stories — Featured + secondary grid</option>
                </select>
                <span className="manage-sections__hint">Choose how articles are displayed in this container</span>
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

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="manage-sections__grid">
            {/* Create Poll Form */}
            <div className="manage-sections__panel">
              <h2 className="manage-sections__panel-title">📊 Create New Poll</h2>
              <p className="manage-sections__panel-desc">
                Polls appear in the sidebar. Users must be logged in to vote. 1 vote per user.
              </p>
              <form className="manage-sections__form" onSubmit={handleCreatePoll}>
                <div className="manage-sections__field">
                  <label className="manage-sections__label" htmlFor="poll-question">
                    Question <span className="manage-sections__required">*</span>
                  </label>
                  <input
                    id="poll-question"
                    className="manage-sections__input"
                    type="text"
                    placeholder="e.g. Who wins tonight's game?"
                    value={pollQuestion}
                    onChange={e => setPollQuestion(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="manage-sections__field">
                  <label className="manage-sections__label">Options <span className="manage-sections__required">*</span></label>
                  <span className="manage-sections__hint">Minimum 2 options. Leave blank to skip.</span>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="manage-sections__poll-option-row">
                      <span className="manage-sections__poll-option-num">{i + 1}.</span>
                      <input
                        className="manage-sections__input"
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => {
                          const next = [...pollOptions];
                          next[i] = e.target.value;
                          setPollOptions(next);
                        }}
                        maxLength={100}
                      />
                    </div>
                  ))}
                </div>

                <div className="manage-sections__field">
                  <label className="manage-sections__label" htmlFor="poll-position">
                    Sidebar Position
                  </label>
                  <select
                    id="poll-position"
                    className="manage-sections__select"
                    value={pollPosition}
                    onChange={e => setPollPosition(e.target.value)}
                  >
                    <option value="above-twitter">Above X / Trending Now</option>
                    <option value="below-twitter">Below X / Trending Now</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="manage-sections__btn manage-sections__btn--primary"
                  disabled={creatingPoll || !pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                >
                  {creatingPoll ? 'Creating…' : '➕ Create Poll'}
                </button>
              </form>
            </div>

            {/* Polls List */}
            <div className="manage-sections__panel">
              <h2 className="manage-sections__panel-title">
                Active Polls
                <span className="manage-sections__count">{polls.length}</span>
              </h2>
              {pollsLoading ? (
                <div className="manage-sections__loading">Loading polls…</div>
              ) : polls.length === 0 ? (
                <div className="manage-sections__empty">No polls yet. Create one on the left.</div>
              ) : (
                <ul className="manage-sections__list">
                  {polls.map(poll => (
                    <li key={poll.id} className="manage-sections__item">
                      <div className="manage-sections__item-info">
                        <div className="manage-sections__item-title">{poll.question}</div>
                        <div className="manage-sections__item-tags">
                          <span className={`manage-sections__tag ${poll.active ? 'manage-sections__tag--page' : 'manage-sections__tag--pos'}`}>
                            {poll.active ? '🟢 Live' : '⏸ Paused'}
                          </span>
                          <span className="manage-sections__tag manage-sections__tag--pos">
                            {poll.sidebarPosition === 'above-twitter' ? '↑ Above Twitter' : '↓ Below Twitter'}
                          </span>
                          <span className="manage-sections__tag manage-sections__tag--page">
                            {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <ul className="manage-sections__poll-results">
                          {poll.options.map(opt => {
                            const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                            return (
                              <li key={opt.id} className="manage-sections__poll-result-item">
                                <span className="manage-sections__poll-result-text">{opt.text}</span>
                                <span className="manage-sections__poll-result-bar-wrap">
                                  <span className="manage-sections__poll-result-bar" style={{ width: `${pct}%` }} />
                                </span>
                                <span className="manage-sections__poll-result-pct">{pct}% ({opt.votes})</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      {poll.correctOptionId && (
                        <div className="manage-sections__poll-resolved">
                          ✅ Resolved — correct: <strong>{poll.options.find(o=>o.id===poll.correctOptionId)?.text}</strong>
                        </div>
                      )}
                      {resolvingPoll === poll.id && !poll.correctOptionId && (
                        <div className="manage-sections__poll-resolve-form">
                          <label className="manage-sections__label">Correct answer:</label>
                          <select
                            className="manage-sections__select manage-sections__select--sm"
                            value={resolveChoice[poll.id] || ''}
                            onChange={e => setResolveChoice(prev => ({...prev, [poll.id]: e.target.value}))}
                          >
                            <option value="">— Select option —</option>
                            {poll.options.map(o => (
                              <option key={o.id} value={o.id}>{o.text}</option>
                            ))}
                          </select>
                          <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                            <button
                              className="manage-sections__btn manage-sections__btn--primary"
                              onClick={() => handleResolvePoll(poll)}
                              disabled={!resolveChoice[poll.id]}
                            >✅ Confirm</button>
                            <button
                              className="manage-sections__btn manage-sections__btn--secondary"
                              onClick={() => setResolvingPoll(null)}
                            >Cancel</button>
                          </div>
                        </div>
                      )}
                      <div className="manage-sections__item-actions">
                        {!poll.correctOptionId && (
                          <button
                            className="manage-sections__btn manage-sections__btn--resolve"
                            onClick={() => setResolvingPoll(resolvingPoll === poll.id ? null : poll.id)}
                            title="Mark correct answer & score users"
                          >
                            🎯 Resolve
                          </button>
                        )}
                        <button
                          className={`manage-sections__btn ${poll.active ? 'manage-sections__btn--secondary' : 'manage-sections__btn--primary'}`}
                          onClick={() => handleTogglePoll(poll)}
                          title={poll.active ? 'Pause poll' : 'Resume poll'}
                        >
                          {poll.active ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button
                          className="manage-sections__btn manage-sections__btn--delete"
                          onClick={() => handleDeletePoll(poll)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Forum Moderation Tab */}
        {activeTab === 'forums' && (
          <div className="manage-sections__panel" style={{ maxWidth: '100%' }}>
            <h2 className="manage-sections__panel-title">💬 Fan Forum Moderation</h2>

            {forumError && (
              <div className="manage-sections__alert manage-sections__alert--error">
                <span>⚠ {forumError}</span>
                <button onClick={() => setForumError('')}>✕</button>
              </div>
            )}
            {forumSuccess && (
              <div className="manage-sections__alert manage-sections__alert--success">
                <span>✓ {forumSuccess}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button
                  key={f}
                  className={`manage-sections__btn${forumFilter === f ? ' manage-sections__btn--resolve' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                  onClick={() => { setForumFilter(f); loadForumThreads(f === 'all' ? undefined : f); }}
                >
                  {f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ Approved' : f === 'rejected' ? '❌ Rejected' : '🌐 All'}
                </button>
              ))}
            </div>

            {forumLoading ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading threads…</p>
            ) : forumThreads.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No threads found for this filter.</p>
            ) : (
              <ul className="manage-sections__poll-list">
                {forumThreads.map(t => (
                  <li key={t.id} className="manage-sections__poll-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '20px', background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>{t.league}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: t.status === 'approved' ? 'rgba(34,197,94,0.1)' : t.status === 'rejected' ? 'rgba(229,25,42,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'approved' ? '#16a34a' : t.status === 'rejected' ? 'var(--red)' : '#d97706' }}>
                            {t.status}
                          </span>
                          {t.pinned && <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>📌 Pinned</span>}
                        </div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>{t.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>by {t.username} · {t.replyCount} replies · {t.likes} likes</span>
                        {expandedThread === t.id && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <p style={{ margin: '0 0 0.75rem', whiteSpace: 'pre-wrap' }}>{t.body}</p>
                            {(threadReplies[t.id] || []).length > 0 && (
                              <div>
                                <strong style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Replies:</strong>
                                {(threadReplies[t.id] || []).map(r => (
                                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                    <div>
                                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.username}: </span>
                                      <span>{r.text}</span>
                                    </div>
                                    <button
                                      className="manage-sections__btn manage-sections__btn--delete"
                                      style={{ fontSize: '0.7rem', padding: '3px 8px', marginLeft: '0.5rem', flexShrink: 0 }}
                                      onClick={() => handleForumDeleteReply(r.id, t.id)}
                                    >🗑</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
                        <button
                          className="manage-sections__btn"
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => handleExpandThread(t)}
                        >
                          {expandedThread === t.id ? '▲ Hide' : '▼ View'}
                        </button>
                        {t.status !== 'approved' && (
                          <button
                            className="manage-sections__btn manage-sections__btn--resolve"
                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => handleForumModerate(t, 'approved')}
                          >✅ Approve</button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            className="manage-sections__btn"
                            style={{ fontSize: '0.75rem', padding: '5px 10px', background: 'rgba(229,25,42,0.1)', color: 'var(--red)', border: '1px solid rgba(229,25,42,0.3)' }}
                            onClick={() => handleForumModerate(t, 'rejected')}
                          >❌ Reject</button>
                        )}
                        <button
                          className="manage-sections__btn"
                          style={{ fontSize: '0.75rem', padding: '5px 10px', background: t.pinned ? 'rgba(245,158,11,0.15)' : undefined, color: t.pinned ? '#d97706' : undefined }}
                          onClick={() => handleForumPin(t)}
                        >{t.pinned ? '📌 Unpin' : '📌 Pin'}</button>
                        <button
                          className="manage-sections__btn manage-sections__btn--delete"
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => handleForumDelete(t)}
                        >🗑 Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="manage-sections__actions">
          <Link to="/admin/articles" className="manage-sections__back-link">← Back to Admin Articles</Link>
        </div>
      </div>
    </div>
  );
}
