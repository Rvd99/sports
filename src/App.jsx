import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import Navbar from './components/Navbar';
import ScoresTicker from './components/ScoresTicker';
import Footer from './components/Footer';
import LeaguePage from './pages/LeaguePage';
import AdminAddPost from './pages/AdminAddPost';
import CreateArticle from './pages/CreateArticle';
import ArticleDetail from './pages/ArticleDetail';
import AdminArticles from './pages/AdminArticles';
import ManageCategories from './pages/ManageCategories';
import AddVideo from './pages/AddVideo';
import ManageVideos from './pages/ManageVideos';
import ManageSections from './pages/ManageSections';
import SportPage from './pages/SportPage';
import About from './pages/About';
import Advertise from './pages/Advertise';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import Cookies from './pages/Cookies';
import UserProfile from './pages/UserProfile';
import ForumPage from './pages/ForumPage';
import ThreadPage from './pages/ThreadPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="app">
            <ScoresTicker />
            <Navbar />
            <main className="app__main">
            <Routes>
              <Route path="/" element={<LeaguePage league="all" />} />
              <Route path="/cricket" element={<LeaguePage league="cricket" />} />
              <Route path="/basketball" element={<LeaguePage league="basketball" />} />
              <Route path="/hockey" element={<LeaguePage league="hockey" />} />
              <Route path="/football" element={<LeaguePage league="football" />} />
              <Route path="/athletics" element={<LeaguePage league="athletics" />} />
              <Route path="/domestic" element={<LeaguePage league="domestic" />} />
              <Route path="/tennis" element={<LeaguePage league="tennis" />} />
              <Route path="/golf" element={<LeaguePage league="golf" />} />
              <Route path="/boxing" element={<LeaguePage league="boxing" />} />
              <Route path="/rugby" element={<LeaguePage league="rugby" />} />
              
              {/* Additional Sports Pages */}
              <Route path="/mls" element={<SportPage sport="mls" />} />
              <Route path="/ufc-mma" element={<SportPage sport="ufc-mma" />} />
              <Route path="/nascar" element={<SportPage sport="nascar" />} />
              <Route path="/formula-1" element={<SportPage sport="formula-1" />} />
              <Route path="/boxing" element={<SportPage sport="boxing" />} />
              <Route path="/rugby" element={<SportPage sport="rugby" />} />
              <Route path="/olympics" element={<SportPage sport="olympics" />} />
              <Route path="/esports" element={<SportPage sport="esports" />} />
              
              {/* Admin Pages */}
              <Route path="/admin/add-post" element={<AdminAddPost />} />
              <Route path="/admin/create-article" element={<CreateArticle />} />
              <Route path="/admin/articles" element={<AdminArticles />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/videos" element={<ManageVideos />} />
              <Route path="/admin/add-video" element={<AddVideo />} />
              <Route path="/admin/sections" element={<ManageSections />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/forums" element={<ForumPage />} />
              <Route path="/forums/thread/:threadId" element={<ThreadPage />} />
              <Route path="/forums/:leagueId" element={<ForumPage />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/cookies" element={<Cookies />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
