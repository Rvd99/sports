import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchArticle } from '../api';
import CommentsSection from '../components/CommentsSection';
import './ArticleDetail.css';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchArticle(slug)
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="article-detail">
        <div className="article-detail__loading">
          <div className="article-detail__spinner" />
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-detail">
        <div className="article-detail__error">
          <h2>Article Not Found</h2>
          <p>{error}</p>
          <Link to="/" className="article-detail__back-btn">← Back to Homepage</Link>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const categoryLabel = article.category.toUpperCase();
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="article-detail">
      <Helmet>
        <title>{article.metaTitle || article.title} | DEGEN Sports</title>
        <meta name="description" content={article.metaDescription || article.excerpt} />
        <meta property="og:title" content={article.metaTitle || article.title} />
        <meta property="og:description" content={article.metaDescription || article.excerpt} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:type" content="article" />
        {article.tags && article.tags.length > 0 && (
          <meta name="keywords" content={article.tags.join(', ')} />
        )}
      </Helmet>

      <div className="article-detail__container">
        <div className="article-detail__breadcrumb">
          <Link to="/" className="article-detail__breadcrumb-link">Home</Link>
          <span className="article-detail__breadcrumb-sep">›</span>
          <span className="article-detail__breadcrumb-link">{categoryLabel}</span>
          <span className="article-detail__breadcrumb-sep">›</span>
          <span>Article</span>
        </div>

        <article className="article-detail__content">
          <header className="article-detail__header">
            <span
              className="article-detail__category"
              style={{ background: article.categoryColor }}
            >
              {categoryLabel}
            </span>
            <h1 className="article-detail__title">{article.title}</h1>
            {article.subheadline && (
              <p className="article-detail__subheadline">{article.subheadline}</p>
            )}
            <p className="article-detail__excerpt">{article.excerpt}</p>
            
            <div className="article-detail__meta">
              <span className="article-detail__author">By {article.author}</span>
              <span className="article-detail__date">{publishedDate}</span>
            </div>
          </header>

          {article.imageUrl && (
            <div className="article-detail__image-wrap">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="article-detail__image"
              />
            </div>
          )}

          <div
            className="article-detail__body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="article-detail__tags">
              <span className="article-detail__tags-label">Tags:</span>
              {article.tags.map((tag, index) => (
                <span key={index} className="article-detail__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        <CommentsSection articleSlug={slug} />

        <div className="article-detail__footer">
          <Link to="/" className="article-detail__back-btn">
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
