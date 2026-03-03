import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSections, createSection, deleteSection, updateSection } from '../api';
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
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPage, setNewPage] = useState('home');
  const [newPosition, setNewPosition] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSections();
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
              Create custom content sections. When creating an article, select a section under
              "Article Placement" — it will appear under that section's container on the homepage.
            </p>
          </div>
        </div>

        {error && (
          <div className="manage-sections__alert manage-sections__alert--error">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
        {success && (
          <div className="manage-sections__alert manage-sections__alert--success">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        <div className="manage-sections__grid">
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

        <div className="manage-sections__actions">
          <Link to="/admin/articles" className="manage-sections__back-link">← Back to Admin Articles</Link>
        </div>
      </div>
    </div>
  );
}
