import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, deleteArticle, updateArticle } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './AdminArticles.css';

export default function AdminArticles() {
  const { user, canCreateContent } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
      setError('');
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditArticle(article);
    setEditForm({
      title: article.title,
      category: article.category,
      status: article.status,
      showOnHomepage: article.showOnHomepage
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateArticle(editArticle.id, editForm);
      setArticles(articles.map(a => a.id === updated.id ? updated : a));
      setEditArticle(null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update article');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
      setDeleteConfirm(null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete article');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (!canCreateContent) {
    return (
      <div className="admin-articles">
        <div className="admin-articles__unauthorized">
          <h1>⛔ Access Denied</h1>
          <p>You must be an admin or editor to access this page.</p>
          <Link to="/" className="admin-articles__back-link">← Back to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-articles">
      <div className="admin-articles__header">
        <div className="admin-articles__header-content">
          <h1 className="admin-articles__title">📚 Manage Articles</h1>
          <p className="admin-articles__subtitle">View, edit, and delete published articles</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/categories" className="admin-articles__create-btn" style={{ background: '#2196f3' }}>
            🏷️ Manage Categories
          </Link>
          <Link to="/admin/videos" className="admin-articles__create-btn" style={{ background: '#9c27b0' }}>
            🎥 Manage Videos
          </Link>
          <Link to="/admin/sections" className="admin-articles__create-btn" style={{ background: '#0d9488' }}>
            📋 Manage Sections
          </Link>
          <Link to="/admin/create-article" className="admin-articles__create-btn">
            ➕ Create New Article
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-articles__error">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="admin-articles__loading">
          <div className="admin-articles__spinner"></div>
          <p>Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="admin-articles__empty">
          <p>No articles found. Create your first article!</p>
          <Link to="/admin/create-article" className="admin-articles__create-btn">
            Create Article
          </Link>
        </div>
      ) : (
        <div className="admin-articles__table-container">
          <table className="admin-articles__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Placement</th>
                <th>Published</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="admin-articles__row">
                  <td>
                    <div className="admin-articles__image">
                      <img src={article.imageUrl} alt={article.title} />
                    </div>
                  </td>
                  <td>
                    <div className="admin-articles__title-cell">
                      <Link to={`/article/${article.slug}`} className="admin-articles__article-title">
                        {article.title}
                      </Link>
                      {article.subheadline && (
                        <span className="admin-articles__subheadline">{article.subheadline}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="admin-articles__category"
                      style={{ background: article.categoryColor }}
                    >
                      {article.category.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-articles__status admin-articles__status--${article.status || 'published'}`}>
                      {article.status || 'published'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-articles__placement">
                      {article.isFeatured && <span className="admin-articles__badge">⭐ Featured</span>}
                      {article.isTopStory && <span className="admin-articles__badge">🔥 Top</span>}
                      {article.isTrending && <span className="admin-articles__badge">📈 Trend</span>}
                      {article.isLatestNews && <span className="admin-articles__badge">📰 Latest</span>}
                    </div>
                  </td>
                  <td>
                    <span className="admin-articles__date">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="admin-articles__views">{article.views || 0}</span>
                  </td>
                  <td>
                    <div className="admin-articles__actions">
                      <Link 
                        to={`/article/${article.slug}`}
                        className="admin-articles__action-btn admin-articles__action-btn--view"
                        title="View Article"
                      >
                        👁️
                      </Link>
                      <button
                        onClick={() => handleEdit(article)}
                        className="admin-articles__action-btn admin-articles__action-btn--edit"
                        title="Edit Article"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(article.id)}
                        className="admin-articles__action-btn admin-articles__action-btn--delete"
                        title="Delete Article"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-articles__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-articles__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-articles__modal-title">⚠️ Confirm Delete</h3>
            <p className="admin-articles__modal-text">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="admin-articles__modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="admin-articles__modal-btn admin-articles__modal-btn--cancel"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="admin-articles__modal-btn admin-articles__modal-btn--delete"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editArticle && (
        <div className="admin-articles__modal-overlay" onClick={() => setEditArticle(null)}>
          <div className="admin-articles__modal admin-articles__modal--edit" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-articles__modal-title">✏️ Edit Article</h3>
            
            <div className="admin-articles__edit-form">
              <div className="admin-articles__form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="admin-articles__input"
                />
              </div>

              <div className="admin-articles__form-field">
                <label>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="admin-articles__select"
                >
                  <option value="nhl">NHL</option>
                  <option value="nba">NBA</option>
                  <option value="mlb">MLB</option>
                  <option value="cfl">CFL</option>
                  <option value="soccer">Soccer</option>
                  <option value="golf">Golf</option>
                  <option value="tennis">Tennis</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="kabaddi">Kabaddi</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="admin-articles__form-field">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="admin-articles__select"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="admin-articles__form-field admin-articles__form-field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.showOnHomepage}
                    onChange={(e) => setEditForm({...editForm, showOnHomepage: e.target.checked})}
                  />
                  <span>Show on Homepage</span>
                </label>
              </div>
            </div>

            <div className="admin-articles__modal-actions">
              <button
                onClick={() => setEditArticle(null)}
                className="admin-articles__modal-btn admin-articles__modal-btn--cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="admin-articles__modal-btn admin-articles__modal-btn--save"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
