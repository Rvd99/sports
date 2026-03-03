import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageCategories.css';

export default function ManageCategories() {
  const [categories, setCategories] = useState([
    { id: 1, label: 'Cricket', slug: 'cricket', order: 1, color: '#1e3a8a' },
    { id: 2, label: 'Basketball', slug: 'basketball', order: 2, color: '#c8102e' },
    { id: 3, label: 'Hockey', slug: 'hockey', order: 3, color: '#0066cc' },
    { id: 4, label: 'Football', slug: 'football', order: 4, color: '#00a651' },
    { id: 5, label: 'Athletics', slug: 'athletics', order: 5, color: '#f5a623' },
    { id: 6, label: 'Domestic', slug: 'domestic', order: 6, color: '#8b4513' },
  ]);
  const [dropdownItems, setDropdownItems] = useState([
    { id: 1, label: 'Tennis', slug: 'tennis', order: 1, color: '#9c27b0' },
    { id: 2, label: 'Golf', slug: 'golf', order: 2, color: '#2e7d32' },
    { id: 3, label: 'Boxing', slug: 'boxing', order: 3, color: '#d4af37' },
    { id: 4, label: 'Rugby', slug: 'rugby', order: 4, color: '#0081c8' },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', slug: '', color: '' });
  const [newCategory, setNewCategory] = useState({ label: '', slug: '', color: '#c8102e' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDropdownId, setEditingDropdownId] = useState(null);
  const [editDropdownForm, setEditDropdownForm] = useState({ label: '', slug: '', color: '' });
  const [newDropdownItem, setNewDropdownItem] = useState({ label: '', slug: '', color: '#c8102e' });
  const [showAddDropdownForm, setShowAddDropdownForm] = useState(false);

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditForm({ label: category.label, slug: category.slug, color: category.color });
  };

  const handleSaveEdit = (id) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...editForm } : cat
    ));
    setEditingId(null);
    setEditForm({ label: '', slug: '', color: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ label: '', slug: '', color: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.label || !newCategory.slug) {
      alert('Please fill in all fields');
      return;
    }
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    const newOrder = categories.length + 1;
    setCategories([...categories, { 
      id: newId, 
      ...newCategory, 
      order: newOrder 
    }]);
    setNewCategory({ label: '', slug: '', color: '#c8102e' });
    setShowAddForm(false);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    newCategories.forEach((cat, idx) => cat.order = idx + 1);
    setCategories(newCategories);
  };

  const handleMoveDown = (index) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    newCategories.forEach((cat, idx) => cat.order = idx + 1);
    setCategories(newCategories);
  };

  const generateSlug = (text) => {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };

  // Dropdown menu handlers
  const handleEditDropdown = (item) => {
    setEditingDropdownId(item.id);
    setEditDropdownForm({ label: item.label, slug: item.slug, color: item.color });
  };

  const handleSaveDropdownEdit = (id) => {
    setDropdownItems(dropdownItems.map(item => 
      item.id === id ? { ...item, ...editDropdownForm } : item
    ));
    setEditingDropdownId(null);
    setEditDropdownForm({ label: '', slug: '', color: '' });
  };

  const handleCancelDropdownEdit = () => {
    setEditingDropdownId(null);
    setEditDropdownForm({ label: '', slug: '', color: '' });
  };

  const handleDeleteDropdown = (id) => {
    if (window.confirm('Are you sure you want to delete this dropdown item?')) {
      setDropdownItems(dropdownItems.filter(item => item.id !== id));
    }
  };

  const handleAddDropdownItem = () => {
    if (!newDropdownItem.label || !newDropdownItem.slug) {
      alert('Please fill in all fields');
      return;
    }
    const newId = Math.max(...dropdownItems.map(i => i.id), 0) + 1;
    const newOrder = dropdownItems.length + 1;
    setDropdownItems([...dropdownItems, { 
      id: newId, 
      ...newDropdownItem, 
      order: newOrder 
    }]);
    setNewDropdownItem({ label: '', slug: '', color: '#c8102e' });
    setShowAddDropdownForm(false);
  };

  const handleMoveDropdownUp = (index) => {
    if (index === 0) return;
    const newItems = [...dropdownItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    newItems.forEach((item, idx) => item.order = idx + 1);
    setDropdownItems(newItems);
  };

  const handleMoveDropdownDown = (index) => {
    if (index === dropdownItems.length - 1) return;
    const newItems = [...dropdownItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    newItems.forEach((item, idx) => item.order = idx + 1);
    setDropdownItems(newItems);
  };

  return (
    <div className="manage-categories">
      <div className="manage-categories__inner">
        <div className="manage-categories__breadcrumb">
          <Link to="/" className="manage-categories__breadcrumb-link">Home</Link>
          <span className="manage-categories__breadcrumb-sep">›</span>
          <Link to="/admin/articles" className="manage-categories__breadcrumb-link">Admin</Link>
          <span className="manage-categories__breadcrumb-sep">›</span>
          <span>Manage Categories</span>
        </div>

        <div className="manage-categories__header">
          <div className="manage-categories__header-icon">🏷️</div>
          <div>
            <h1 className="manage-categories__title">Manage Navbar Categories</h1>
            <p className="manage-categories__subtitle">
              Add, edit, reorder, or remove categories from the main navigation
            </p>
          </div>
        </div>

        <div className="manage-categories__info-banner">
          <div className="manage-categories__info-icon">ℹ️</div>
          <div className="manage-categories__info-content">
            <h3 className="manage-categories__info-title">How it works</h3>
            <p className="manage-categories__info-text">
              Categories appear in the navbar in the order shown below. Use the arrow buttons to reorder them.
              Each category needs a unique label and URL slug. Changes take effect immediately.
            </p>
          </div>
        </div>

        <div className="manage-categories__actions">
          <button 
            className="manage-categories__add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Category'}
          </button>
        </div>

        {showAddForm && (
          <div className="manage-categories__add-form">
            <h3 className="manage-categories__form-title">Add New Category</h3>
            <div className="manage-categories__form-grid">
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">Category Label</label>
                <input
                  type="text"
                  className="manage-categories__form-input"
                  placeholder="e.g., Tennis"
                  value={newCategory.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setNewCategory({ 
                      ...newCategory, 
                      label,
                      slug: generateSlug(label)
                    });
                  }}
                />
              </div>
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">URL Slug</label>
                <input
                  type="text"
                  className="manage-categories__form-input"
                  placeholder="e.g., tennis"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                />
              </div>
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">Color</label>
                <input
                  type="color"
                  className="manage-categories__form-color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                />
              </div>
            </div>
            <button 
              className="manage-categories__save-btn"
              onClick={handleAddCategory}
            >
              ✓ Add Category
            </button>
          </div>
        )}

        <div className="manage-categories__list">
          <div className="manage-categories__list-header">
            <span className="manage-categories__list-col manage-categories__list-col--order">Order</span>
            <span className="manage-categories__list-col manage-categories__list-col--label">Label</span>
            <span className="manage-categories__list-col manage-categories__list-col--slug">Slug</span>
            <span className="manage-categories__list-col manage-categories__list-col--color">Color</span>
            <span className="manage-categories__list-col manage-categories__list-col--actions">Actions</span>
          </div>

          {categories.map((category, index) => (
            <div key={category.id} className="manage-categories__item">
              {editingId === category.id ? (
                <>
                  <div className="manage-categories__item-col manage-categories__item-col--order">
                    <div className="manage-categories__order-btns">
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--label">
                    <input
                      type="text"
                      className="manage-categories__edit-input"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--slug">
                    <input
                      type="text"
                      className="manage-categories__edit-input"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--color">
                    <input
                      type="color"
                      className="manage-categories__edit-color"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--actions">
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--save"
                      onClick={() => handleSaveEdit(category.id)}
                    >
                      ✓ Save
                    </button>
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--cancel"
                      onClick={handleCancelEdit}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="manage-categories__item-col manage-categories__item-col--order">
                    <div className="manage-categories__order-btns">
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--label">
                    {category.label}
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--slug">
                    /{category.slug}
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--color">
                    <div 
                      className="manage-categories__color-preview"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="manage-categories__color-code">{category.color}</span>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--actions">
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--edit"
                      onClick={() => handleEdit(category)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--delete"
                      onClick={() => handleDelete(category.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dropdown Menu Management Section */}
        <div className="manage-categories__section-divider">
          <h2 className="manage-categories__section-title">📋 "More" Dropdown Menu Items</h2>
          <p className="manage-categories__section-subtitle">
            Manage items that appear in the "More" dropdown menu in the navbar
          </p>
        </div>

        <div className="manage-categories__actions">
          <button 
            className="manage-categories__add-btn"
            onClick={() => setShowAddDropdownForm(!showAddDropdownForm)}
          >
            {showAddDropdownForm ? '✕ Cancel' : '+ Add Dropdown Item'}
          </button>
        </div>

        {showAddDropdownForm && (
          <div className="manage-categories__add-form">
            <h3 className="manage-categories__form-title">Add New Dropdown Item</h3>
            <div className="manage-categories__form-grid">
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">Item Label</label>
                <input
                  type="text"
                  className="manage-categories__form-input"
                  placeholder="e.g., Swimming"
                  value={newDropdownItem.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setNewDropdownItem({ 
                      ...newDropdownItem, 
                      label,
                      slug: generateSlug(label)
                    });
                  }}
                />
              </div>
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">URL Slug</label>
                <input
                  type="text"
                  className="manage-categories__form-input"
                  placeholder="e.g., swimming"
                  value={newDropdownItem.slug}
                  onChange={(e) => setNewDropdownItem({ ...newDropdownItem, slug: e.target.value })}
                />
              </div>
              <div className="manage-categories__form-field">
                <label className="manage-categories__form-label">Color</label>
                <input
                  type="color"
                  className="manage-categories__form-color"
                  value={newDropdownItem.color}
                  onChange={(e) => setNewDropdownItem({ ...newDropdownItem, color: e.target.value })}
                />
              </div>
            </div>
            <button 
              className="manage-categories__save-btn"
              onClick={handleAddDropdownItem}
            >
              ✓ Add Dropdown Item
            </button>
          </div>
        )}

        <div className="manage-categories__list">
          <div className="manage-categories__list-header">
            <span className="manage-categories__list-col manage-categories__list-col--order">Order</span>
            <span className="manage-categories__list-col manage-categories__list-col--label">Label</span>
            <span className="manage-categories__list-col manage-categories__list-col--slug">Slug</span>
            <span className="manage-categories__list-col manage-categories__list-col--color">Color</span>
            <span className="manage-categories__list-col manage-categories__list-col--actions">Actions</span>
          </div>

          {dropdownItems.map((item, index) => (
            <div key={item.id} className="manage-categories__item">
              {editingDropdownId === item.id ? (
                <>
                  <div className="manage-categories__item-col manage-categories__item-col--order">
                    <div className="manage-categories__order-btns">
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDropdownUp(index)}
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDropdownDown(index)}
                        disabled={index === dropdownItems.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--label">
                    <input
                      type="text"
                      className="manage-categories__edit-input"
                      value={editDropdownForm.label}
                      onChange={(e) => setEditDropdownForm({ ...editDropdownForm, label: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--slug">
                    <input
                      type="text"
                      className="manage-categories__edit-input"
                      value={editDropdownForm.slug}
                      onChange={(e) => setEditDropdownForm({ ...editDropdownForm, slug: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--color">
                    <input
                      type="color"
                      className="manage-categories__edit-color"
                      value={editDropdownForm.color}
                      onChange={(e) => setEditDropdownForm({ ...editDropdownForm, color: e.target.value })}
                    />
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--actions">
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--save"
                      onClick={() => handleSaveDropdownEdit(item.id)}
                    >
                      ✓ Save
                    </button>
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--cancel"
                      onClick={handleCancelDropdownEdit}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="manage-categories__item-col manage-categories__item-col--order">
                    <div className="manage-categories__order-btns">
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDropdownUp(index)}
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button 
                        className="manage-categories__order-btn"
                        onClick={() => handleMoveDropdownDown(index)}
                        disabled={index === dropdownItems.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--label">
                    {item.label}
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--slug">
                    /{item.slug}
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--color">
                    <div 
                      className="manage-categories__color-preview"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="manage-categories__color-code">{item.color}</span>
                  </div>
                  <div className="manage-categories__item-col manage-categories__item-col--actions">
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--edit"
                      onClick={() => handleEditDropdown(item)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="manage-categories__action-btn manage-categories__action-btn--delete"
                      onClick={() => handleDeleteDropdown(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="manage-categories__footer">
          <Link to="/admin/articles" className="manage-categories__back-btn">
            ← Back to Manage Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
