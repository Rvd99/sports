import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LeaguePage from './pages/LeaguePage';
import AdminAddPost from './pages/AdminAddPost';

// Simple global flag — set true to show admin link in nav
export const IS_ADMIN = true;

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar isAdmin={IS_ADMIN} />
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
            <Route path="/admin/add-post" element={<AdminAddPost />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
