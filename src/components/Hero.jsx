import { useState, useEffect, useCallback } from 'react';
import './Hero.css';

const SLIDES = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/hockey1/1400/700',
    league: 'NHL',
    leagueColor: '#0066cc',
    headline: 'Maple Leafs Stun Rangers in Overtime Thriller to Take Series Lead',
    subheadline: 'Auston Matthews nets the game-winner at 3:42 of OT in a sold-out Madison Square Garden',
    cta: 'READ MORE',
    ctaType: 'read',
    time: '2 hours ago',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/basketball2/1400/700',
    league: 'NBA',
    leagueColor: '#c8102e',
    headline: 'LeBron James Drops 42 Points as Lakers Clinch Western Conference Finals Spot',
    subheadline: 'The King delivers a masterclass performance in a must-win Game 6 on the road',
    cta: 'WATCH NOW',
    ctaType: 'watch',
    time: '4 hours ago',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/soccer3/1400/700',
    league: 'SOCCER',
    leagueColor: '#00a651',
    headline: 'Canada Qualifies for 2026 World Cup with Dramatic Last-Minute Winner',
    subheadline: 'Alphonso Davies scores in stoppage time to send a nation into a frenzy at BMO Field',
    cta: 'READ MORE',
    ctaType: 'read',
    time: '6 hours ago',
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/baseball4/1400/700',
    league: 'MLB',
    leagueColor: '#002d72',
    headline: 'Blue Jays Walk Off Yankees in Extra Innings to Stay Alive in Wild Card Race',
    subheadline: 'Vladimir Guerrero Jr. crushes a three-run homer in the 11th to complete the comeback',
    cta: 'WATCH NOW',
    ctaType: 'watch',
    time: '8 hours ago',
  },
  {
    id: 5,
    image: 'https://picsum.photos/seed/football5/1400/700',
    league: 'CFL',
    leagueColor: '#e03a3e',
    headline: 'Winnipeg Blue Bombers Dominate Grey Cup Rematch in Season Opener',
    subheadline: 'Zach Collaros throws for 320 yards and 3 TDs in a commanding 34-17 victory',
    cta: 'READ MORE',
    ctaType: 'read',
    time: '10 hours ago',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`hero__slide${i === current ? ' hero__slide--active' : ''}`}
          style={{ backgroundImage: `url(${s.image})` }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Overlay */}
      <div className="hero__overlay" />

      {/* Content */}
      <div className={`hero__content${isAnimating ? ' hero__content--fade' : ''}`}>
        <div className="hero__content-inner">
          <span
            className="hero__league-badge"
            style={{ background: slide.leagueColor }}
          >
            {slide.league}
          </span>
          <h1 className="hero__headline">{slide.headline}</h1>
          <p className="hero__subheadline">{slide.subheadline}</p>
          <div className="hero__meta">
            <span className="hero__time">{slide.time}</span>
          </div>
          <a
            href="#"
            className={`hero__cta hero__cta--${slide.ctaType}`}
          >
            {slide.ctaType === 'watch' && <PlayIcon />}
            {slide.cta}
          </a>
        </div>
      </div>

      {/* Arrow Controls */}
      <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Previous slide">
        <ChevronLeft />
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Next slide">
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="hero__dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`hero__dot${i === current ? ' hero__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="hero__counter">
        <span className="hero__counter-current">{String(current + 1).padStart(2, '0')}</span>
        <span className="hero__counter-sep"> / </span>
        <span className="hero__counter-total">{String(SLIDES.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
