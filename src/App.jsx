import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScoresTicker from './components/ScoresTicker';
import TopStories from './components/TopStories';
import VideoHighlights from './components/VideoHighlights';
import Sidebar from './components/Sidebar';
import FeaturedLeagues from './components/FeaturedLeagues';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="app__main">
        {/* Hero Carousel */}
        <Hero />

        {/* Live Scores Ticker */}
        <ScoresTicker />

        {/* Main Content + Sidebar */}
        <div className="app__content-wrap">
          <div className="app__content-inner">
            {/* Main Column */}
            <div className="app__main-col">
              <TopStories />

              <div className="app__section-gap">
                <VideoHighlights />
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>

        {/* Full-width sections */}
        <div className="app__full-width">
          <FeaturedLeagues />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
