import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Login from './Login';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Cricket', to: '/cricket' },
  { label: 'Basketball', to: '/basketball' },
  { label: 'Hockey', to: '/hockey' },
  { label: 'Football', to: '/football' },
  { label: 'Athletics', to: '/athletics' },
  { label: 'Domestic', to: '/domestic' },
];

const MORE_LINKS = [
  { label: 'Tennis', to: '/tennis' },
  { label: 'Golf', to: '/golf' },
  { label: 'Boxing', to: '/boxing' },
  { label: 'Rugby', to: '/rugby' },
];

export default function Navbar() {
  const { user, logout, canCreateContent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-degen">DEGEN</span>
          <span className="navbar__logo-dot">●</span>
          <span className="navbar__logo-sports">SPORTS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="navbar__more" ref={moreRef}>
            <button
              className="navbar__link navbar__more-btn"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              More <span className="navbar__chevron">▾</span>
            </button>
            {moreOpen && (
              <div className="navbar__dropdown">
                {MORE_LINKS.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    className={({ isActive }) =>
                      `navbar__dropdown-item${isActive ? ' navbar__dropdown-item--active' : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          {canCreateContent && (
            <NavLink
              to="/admin/articles"
              className={({ isActive }) =>
                `navbar__link navbar__link--admin${isActive ? ' navbar__link--active' : ''}`
              }
            >
              📚 Manage
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
          <button
            className="navbar__icon-btn navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <div className="navbar__search-wrap" ref={searchRef}>
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            {searchOpen && (
              <div className="navbar__search-box">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search scores, news, teams..."
                  className="navbar__search-input"
                />
              </div>
            )}
          </div>
          
          {user ? (
            <div className="navbar__user-menu">
              {user.avatarUrl ? (
                <img src={`http://localhost:5001${user.avatarUrl}`} alt={user.username || user.name} className="navbar__user-avatar navbar__user-avatar--img" />
              ) : (
                <span className="navbar__user-avatar">{(user.username || user.name || 'U').slice(0,2).toUpperCase()}</span>
              )}
              <span className="navbar__user-name">{user.username || user.name}</span>
              <Link to="/profile" className="navbar__profile-link">My Panel</Link>
              <button className="navbar__logout" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="navbar__login" onClick={() => setLoginOpen(true)}>
              Login / Sign Up
            </button>
          )}
          
          <a href="#" className="navbar__watch-btn">
            <span className="navbar__watch-dot">●</span> Watch Live
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={`navbar__ham-line${mobileOpen ? ' open' : ''}`} />
          <span className={`navbar__ham-line${mobileOpen ? ' open' : ''}`} />
          <span className={`navbar__ham-line${mobileOpen ? ' open' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          <div className="navbar__mobile-search">
            <SearchIcon />
            <input type="text" placeholder="Search scores, news, teams..." />
          </div>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`
              }
              onClick={closeMobile}
            >
              {link.label}
            </NavLink>
          ))}
          {MORE_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `navbar__mobile-link navbar__mobile-link--sub${isActive ? ' navbar__mobile-link--active' : ''}`
              }
              onClick={closeMobile}
            >
              {link.label}
            </NavLink>
          ))}
          {canCreateContent && (
            <>
              <Link
                to="/admin/articles"
                className="navbar__mobile-link navbar__mobile-link--admin"
                onClick={closeMobile}
              >
                📚 Manage Articles
              </Link>
              <Link
                to="/admin/create-article"
                className="navbar__mobile-link navbar__mobile-link--admin"
                onClick={closeMobile}
              >
                📝 Create Article ({user?.role || 'Admin'})
              </Link>
            </>
          )}
          <div className="navbar__mobile-actions">
            {user ? (
              <div className="navbar__mobile-user">
                <span className="navbar__mobile-user-name">{user.username || user.name}</span>
                <Link to="/profile" className="navbar__mobile-link navbar__mobile-link--profile" onClick={closeMobile}>My Panel</Link>
                <button className="navbar__mobile-logout" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="navbar__mobile-login" onClick={() => setLoginOpen(true)}>
                Login / Sign Up
              </button>
            )}
            <a href="#" className="navbar__watch-btn">
              <span className="navbar__watch-dot">●</span> Watch Live
            </a>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      {loginOpen && <Login onClose={() => setLoginOpen(false)} />}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
