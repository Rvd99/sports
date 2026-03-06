import { useEffect, useState } from 'react';
import { fetchTwitterPosts } from '../api';
import TweetEmbed from './TweetEmbed';
import PollWidget from './PollWidget';
import './Sidebar.css';

export default function Sidebar({ scores = [], news = [], articles = [], loading = false, page = '' }) {
  const [twitterPosts, setTwitterPosts] = useState([]);

  useEffect(() => {
    fetchTwitterPosts(page || undefined).then(setTwitterPosts).catch(() => {});
  }, [page]);

  return (
    <aside className="sidebar">

      {/* Polls — above Twitter */}
      <PollWidget position="above-twitter" />

      {/* X / Twitter Trending Now — fills the rest of sidebar */}
      <div className="sidebar__widget sidebar__widget--twitter sidebar__widget--twitter-full">
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
          <div className="sidebar__twitter-feed sidebar__twitter-feed--infinite">
            {twitterPosts.map(post => (
              <div key={post.id} className="sidebar__tweet-wrap">
                <TweetEmbed url={post.url} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Polls — below Twitter */}
      <PollWidget position="below-twitter" />

    </aside>
  );
}
