import './VideoHighlights.css';

const VIDEOS = [
  {
    id: 1,
    thumb: 'https://picsum.photos/seed/vid1/600/340',
    league: 'NHL',
    leagueColor: '#0066cc',
    title: 'Matthews OT Winner — Full Highlight Package',
    duration: '4:32',
    views: '248K',
    time: '2 hours ago',
  },
  {
    id: 2,
    thumb: 'https://picsum.photos/seed/vid2/600/340',
    league: 'NBA',
    leagueColor: '#c8102e',
    title: "LeBron's 42-Point Masterclass — Every Bucket",
    duration: '6:18',
    views: '1.2M',
    time: '4 hours ago',
  },
  {
    id: 3,
    thumb: 'https://picsum.photos/seed/vid3/600/340',
    league: 'SOCCER',
    leagueColor: '#00a651',
    title: "Davies' World Cup Qualifier Goal — Slow Motion",
    duration: '2:05',
    views: '890K',
    time: '6 hours ago',
  },
  {
    id: 4,
    thumb: 'https://picsum.photos/seed/vid4/600/340',
    league: 'MLB',
    leagueColor: '#002d72',
    title: "Guerrero Jr.'s Walk-Off Homer — Full Reaction",
    duration: '3:47',
    views: '412K',
    time: '8 hours ago',
  },
  {
    id: 5,
    thumb: 'https://picsum.photos/seed/vid5/600/340',
    league: 'CFL',
    leagueColor: '#e03a3e',
    title: 'Collaros 3-TD Performance — Best Plays',
    duration: '5:12',
    views: '156K',
    time: '10 hours ago',
  },
  {
    id: 6,
    thumb: 'https://picsum.photos/seed/vid6/600/340',
    league: 'NHL',
    leagueColor: '#0066cc',
    title: 'Top 10 Saves of the Week — NHL Highlights',
    duration: '3:28',
    views: '320K',
    time: '12 hours ago',
  },
];

export default function VideoHighlights() {
  return (
    <div className="videos">
      <div className="section-header">
        <span className="section-header__bar" />
        <h2 className="section-header__title">Video Highlights</h2>
        <a href="#" className="section-header__link">Watch More →</a>
      </div>

      <div className="videos__grid">
        {VIDEOS.map((video) => (
          <a key={video.id} href="#" className="video-card">
            <div className="video-card__thumb-wrap">
              <img
                src={video.thumb}
                alt={video.title}
                className="video-card__thumb"
                loading="lazy"
              />
              <div className="video-card__overlay">
                <div className="video-card__play">
                  <PlayIcon />
                </div>
              </div>
              <span className="video-card__duration">{video.duration}</span>
              <span
                className="video-card__league"
                style={{ background: video.leagueColor }}
              >
                {video.league}
              </span>
            </div>
            <div className="video-card__body">
              <h4 className="video-card__title">{video.title}</h4>
              <div className="video-card__meta">
                <span className="video-card__views">{video.views} views</span>
                <span className="video-card__time">{video.time}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="12" fill="rgba(200,16,46,0.85)" />
      <polygon points="9.5,7 18,12 9.5,17" fill="white" />
    </svg>
  );
}
