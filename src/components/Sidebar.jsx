import { useState, useEffect } from 'react';
import { fetchTwitterPosts } from '../api';
import TweetEmbed from './TweetEmbed';
import './Sidebar.css';

export default function Sidebar({ scores = [], news = [], articles = [], loading = false, page = '' }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [twitterPosts, setTwitterPosts] = useState([]);

  useEffect(() => {
    fetchTwitterPosts(page || undefined).then(setTwitterPosts).catch(() => {});
  }, [page]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <aside className="sidebar">
      {/* Trending Now — Twitter Feed */}
      <div className="sidebar__widget sidebar__widget--twitter">
        <div className="sidebar__widget-header">
          <span className="sidebar__twitter-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </span>
          <h3 className="sidebar__widget-title">Trending Now</h3>
        </div>

        {twitterPosts.length === 0 ? (
          <div className="sidebar__twitter-empty">
            <p>No posts yet. Add Twitter/X links in <strong>Manage Sections</strong>.</p>
          </div>
        ) : (
          <div className="sidebar__twitter-feed">
            {twitterPosts.map(post => (
              <div key={post.id} className="sidebar__tweet-wrap">
                <TweetEmbed url={post.url} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="sidebar__widget sidebar__widget--newsletter">
        <div className="sidebar__newsletter-icon">✉</div>
        <h3 className="sidebar__newsletter-title">Stay in the Game</h3>
        <p className="sidebar__newsletter-desc">
          Get the latest sports news, scores and highlights delivered to your inbox every morning.
        </p>
        {subscribed ? (
          <div className="sidebar__newsletter-success">
            ✓ You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <form className="sidebar__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sidebar__newsletter-input"
              required
            />
            <button type="submit" className="sidebar__newsletter-btn">
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Ad Block */}
      <div className="sidebar__ad">
        <span className="sidebar__ad-label">Advertisement</span>
        <div className="sidebar__ad-block">
          <div className="sidebar__ad-inner">
            <span className="sidebar__ad-text">300 × 250</span>
            <span className="sidebar__ad-sub">Your Ad Here</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
