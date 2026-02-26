import { Link } from 'react-router-dom';
import './Articles.css';

export default function Articles({ articles = [], loading = false }) {
  // Filter articles marked as latest news
  const latestArticles = (articles || []).filter(a => a.isLatestNews);
  
  if (loading) {
    return (
      <div className="articles">
        <div className="section-header">
          <span className="section-header__bar" />
          <h2 className="section-header__title">Latest Articles</h2>
        </div>
        <div className="articles__skeleton-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="articles__skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (!latestArticles || latestArticles.length === 0) {
    return null;
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="articles">
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Featured Articles</h2>
        <Link to="/" className="section-header__link">View All →</Link>
      </div>

      <div className="articles__grid">
        {latestArticles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.slug}`}
            className="article-card"
          >
            <div className="article-card__image-wrap">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="article-card__image"
                loading="lazy"
              />
              <span
                className="article-card__category"
                style={{ background: article.categoryColor }}
              >
                {article.category.toUpperCase()}
              </span>
            </div>
            <div className="article-card__content">
              <h3 className="article-card__title">{article.title}</h3>
              <p className="article-card__excerpt">{article.excerpt}</p>
              <div className="article-card__meta">
                <span className="article-card__author">{article.author}</span>
                <span className="article-card__dot">•</span>
                <span className="article-card__time">{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
