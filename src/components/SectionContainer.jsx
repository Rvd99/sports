import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSectionArticles } from '../api';
import './SectionContainer.css';

const LEAGUE_COLORS = {
  nhl: '#0066cc', nba: '#c8102e', mlb: '#002d72',
  cfl: '#e03a3e', soccer: '#00a651', golf: '#2e7d32', tennis: '#f5a623',
  cricket: '#00a8cc', football: '#e8112d', kabaddi: '#ff6b35',
  ipl: '#4a90e2', isl: '#f39c12', other: '#888888',
};

function getLeagueColor(league = '') {
  return LEAGUE_COLORS[league.toLowerCase()] || '#888';
}

export default function SectionContainer({ section }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!section?.slug) return;
    fetchSectionArticles(section.slug)
      .then(data => setArticles(data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [section?.slug]);

  if (loading) {
    return (
      <div className="sec-container">
        <div className="sec-container__heading-bar">
          <div className="sec-container__heading-inner">
            <span className="sec-container__heading-line" />
            <h2 className="sec-container__heading-title">{section.title}</h2>
          </div>
        </div>
        <div className="sec-container__body sec-container__body--skeleton">
          {[1, 2, 3, 4].map(i => <div key={i} className="sec-container__skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;
  const sideCards = rest.slice(0, 3);
  const headlines = articles.slice(0, 8);

  return (
    <div className="sec-container">
      {/* Section heading bar */}
      <div className="sec-container__heading-bar">
        <div className="sec-container__heading-inner">
          <span className="sec-container__heading-line" />
          <h2 className="sec-container__heading-title">{section.title}</h2>
        </div>
      </div>

      {/* Cards grid */}
      <div className="sec-container__body">
        {/* Large featured card */}
        {featured && (
          <Link to={`/article/${featured.slug}`} className="sec-card sec-card--large">
            <div
              className="sec-card__image"
              style={{ backgroundImage: `url(${featured.imageUrl || `https://picsum.photos/seed/${featured.id}/800/600`})` }}
            />
            <div className="sec-card__content">
              <div className="sec-card__author-row">
                <span
                  className="sec-card__badge"
                  style={{ backgroundColor: featured.categoryColor || getLeagueColor(featured.category) }}
                >
                  {(featured.category || 'NEWS').toUpperCase()}
                </span>
                <span className="sec-card__author">{featured.author}</span>
              </div>
              <h3 className="sec-card__headline">{featured.title}</h3>
            </div>
          </Link>
        )}

        {/* Three small stacked cards */}
        {sideCards.length > 0 && (
          <div className="sec-container__side">
            {sideCards.map(article => (
              <Link key={article.id} to={`/article/${article.slug}`} className="sec-card sec-card--small">
                <div
                  className="sec-card__thumb"
                  style={{ backgroundImage: `url(${article.imageUrl || `https://picsum.photos/seed/${article.id}/400/300`})` }}
                />
                <div className="sec-card__text">
                  <div className="sec-card__text-top">
                    <span
                      className="sec-card__badge sec-card__badge--sm"
                      style={{ backgroundColor: article.categoryColor || getLeagueColor(article.category) }}
                    >
                      {(article.category || 'NEWS').toUpperCase()}
                    </span>
                    <span className="sec-card__author--sm">{article.author}</span>
                  </div>
                  <h4 className="sec-card__headline--sm">{article.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Headlines column */}
        {headlines.length > 0 && (
          <div className="sec-headlines">
            <div className="sec-headlines__title">HEADLINES</div>
            <ul className="sec-headlines__list">
              {headlines.map(item => (
                <Link key={item.id} to={`/article/${item.slug}`} className="sec-headlines__item">
                  <div
                    className="sec-headlines__icon"
                    style={{ background: item.categoryColor || getLeagueColor(item.category) }}
                  >
                    {(item.category || 'N').slice(0, 3).toUpperCase()}
                  </div>
                  <span className="sec-headlines__text">{item.title}</span>
                </Link>
              ))}
            </ul>
            <div className="sec-headlines__ad">ADVERTISEMENT</div>
          </div>
        )}
      </div>
    </div>
  );
}
