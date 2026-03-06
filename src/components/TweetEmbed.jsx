import { useEffect, useRef, useState } from 'react';
import './TweetEmbed.css';

function extractTweetId(url) {
  if (!url) return null;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

let twttrReady = false;
const pendingCallbacks = [];

function ensureTwitterScript(callback) {
  if (twttrReady) { callback(); return; }
  pendingCallbacks.push(callback);
  if (document.getElementById('twitter-widgets-script')) return;

  const script = document.createElement('script');
  script.id = 'twitter-widgets-script';
  script.src = 'https://platform.twitter.com/widgets.js';
  script.async = true;
  script.charset = 'utf-8';
  script.onload = () => {
    const check = setInterval(() => {
      if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.createTweet === 'function') {
        clearInterval(check);
        twttrReady = true;
        pendingCallbacks.forEach(cb => cb());
        pendingCallbacks.length = 0;
      }
    }, 100);
  };
  document.body.appendChild(script);
}

export default function TweetEmbed({ url }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const tweetId = extractTweetId(url);

  useEffect(() => {
    if (!tweetId || !containerRef.current) return;
    let cancelled = false;
    setFailed(false);

    const container = containerRef.current;
    container.innerHTML = '';

    ensureTwitterScript(() => {
      if (cancelled || !container) return;
      container.innerHTML = '';
      window.twttr.widgets.createTweet(tweetId, container, {
        theme: getTheme(),
        cards: 'hidden',
        conversation: 'none',
        dnt: true,
        align: 'center',
        width: 280,
      }).then(el => {
        if (!el && !cancelled) setFailed(true);
      }).catch(() => {
        if (!cancelled) setFailed(true);
      });
    });

    // Fallback: if nothing rendered after 8s show the link
    const timer = setTimeout(() => {
      if (!cancelled && container && container.childElementCount === 0) {
        setFailed(true);
      }
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      container.innerHTML = '';
    };
  }, [tweetId]);

  if (!tweetId) {
    return (
      <div className="tweet-embed tweet-embed--invalid">
        <span>Invalid tweet URL</span>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="tweet-embed tweet-embed--fallback">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="tweet-embed__fallback-link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          View on X / Twitter
        </a>
      </div>
    );
  }

  return (
    <div className="tweet-embed" ref={containerRef}>
      <div className="tweet-embed__placeholder">
        <div className="tweet-embed__loading-bar" />
        <span className="tweet-embed__loading-text">Loading tweet…</span>
      </div>
    </div>
  );
}
