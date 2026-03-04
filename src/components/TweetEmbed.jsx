import { useEffect, useRef } from 'react';
import './TweetEmbed.css';

function extractTweetId(url) {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export default function TweetEmbed({ url }) {
  const containerRef = useRef(null);
  const tweetId = extractTweetId(url);

  useEffect(() => {
    if (!tweetId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';
    let cancelled = false;

    const render = () => {
      if (cancelled || !container || container.childElementCount > 0) return;
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.createTweet(tweetId, container, {
          theme: 'light',
          cards: 'visible',
          conversation: 'none',
          dnt: true,
          align: 'center',
          width: '100%',
        });
      }
    };

    if (window.twttr && window.twttr.widgets) {
      render();
    } else {
      const existingScript = document.getElementById('twitter-widgets-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'twitter-widgets-script';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        script.onload = () => render();
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', render);
      }
    }

    return () => {
      cancelled = true;
      container.innerHTML = '';
    };
  }, [tweetId]);

  if (!tweetId) return null;

  return (
    <div className="tweet-embed" ref={containerRef}>
      <div className="tweet-embed__placeholder">
        <div className="tweet-embed__loading-bar" />
      </div>
    </div>
  );
}
