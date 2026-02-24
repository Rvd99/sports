import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'NHL', to: '/nhl' },
  { label: 'MLB', to: '/mlb' },
  { label: 'NBA', to: '/nba' },
  { label: 'CFL', to: '/cfl' },
  { label: 'Soccer', to: '/soccer' },
  { label: 'Golf', to: '/golf' },
  { label: 'Tennis', to: '/tennis' },
];

const MORE_LINKS = [
  'MLS', 'UFC/MMA', 'NASCAR', 'Formula 1', 'Boxing', 'Rugby', 'Olympics', 'Esports',
];

export default function Navbar({ isAdmin = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
                {MORE_LINKS.map((item) => (
                  <a key={item} href="#" className="navbar__dropdown-item">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>
          {isAdmin && (
            <NavLink
              to="/admin/add-post"
              className={({ isActive }) =>
                `navbar__link navbar__link--admin${isActive ? ' navbar__link--active' : ''}`
              }
            >
              + Add Post
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
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
          <a href="#" className="navbar__login">Login / Sign Up</a>
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
          {MORE_LINKS.map((item) => (
            <a key={item} href="#" className="navbar__mobile-link navbar__mobile-link--sub">
              {item}
            </a>
          ))}
          {isAdmin && (
            <Link
              to="/admin/add-post"
              className="navbar__mobile-link navbar__mobile-link--admin"
              onClick={closeMobile}
            >
              + Add Post (Admin)
            </Link>
          )}
          <div className="navbar__mobile-actions">
            <a href="#" className="navbar__mobile-login">Login / Sign Up</a>
            <a href="#" className="navbar__watch-btn">
              <span className="navbar__watch-dot">●</span> Watch Live
            </a>
          </div>
        </div>
      )}
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
