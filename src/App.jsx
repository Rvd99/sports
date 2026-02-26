import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LeaguePage from './pages/LeaguePage';
import AdminAddPost from './pages/AdminAddPost';
import CreateArticle from './pages/CreateArticle';
import ArticleDetail from './pages/ArticleDetail';
import AdminArticles from './pages/AdminArticles';
import SportPage from './pages/SportPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="app">
            <Navbar />
            <main className="app__main">
            <Routes>
              <Route path="/" element={<LeaguePage league="all" />} />
              <Route path="/nhl" element={<LeaguePage league="nhl" />} />
              <Route path="/nba" element={<LeaguePage league="nba" />} />
              <Route path="/mlb" element={<LeaguePage league="mlb" />} />
              <Route path="/cfl" element={<LeaguePage league="cfl" />} />
              <Route path="/soccer" element={<LeaguePage league="soccer" />} />
              <Route path="/golf" element={<LeaguePage league="golf" />} />
              <Route path="/tennis" element={<LeaguePage league="tennis" />} />
              
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
              <Route path="/article/:slug" element={<ArticleDetail />} />
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
