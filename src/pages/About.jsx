import './StaticPage.css';

export default function About() {
  return (
    <div className="static-page">
      <div className="static-page__container">
        <h1 className="static-page__title">About DEGEN</h1>
        <div className="static-page__content">
          <p>This page can be edited by the admin in the backend/CMS.</p>
        </div>
      </div>
    </div>
  );
}
