import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const DEMO_USERS = [
  { label: 'Admin', email: 'admin@degensports.com', password: 'admin123', note: 'Manage content' },
  { label: 'SportsFanatic99', email: 'fan99@example.com', password: 'pass1', note: 'Comment & vote' },
  { label: 'CricketKing_AU', email: 'cricket.au@example.com', password: 'pass2', note: 'Comment & vote' },
  { label: 'HockeyNightFan', email: 'hockey.fan@example.com', password: 'pass3', note: 'Comment & vote' },
  { label: 'NZSportsNerd', email: 'nzsports@example.com', password: 'pass4', note: 'Comment & vote' },
];

export default function Login({ onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      setStatus('success');
      setTimeout(onClose, 900);
    } else {
      setStatus('error');
      setError(result.error);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (regData.password !== regData.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setStatus('loading');
    setError('');
    const result = await register(regData.username, regData.email, regData.password);
    if (result.success) {
      setStatus('success');
      setTimeout(onClose, 900);
    } else {
      setStatus('error');
      setError(result.error);
    }
  }

  function quickLogin(demo) {
    setLoginData({ email: demo.email, password: demo.password });
    setTab('login');
    setError('');
    setStatus('idle');
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <div className="login-tabs">
            <button
              className={`login-tab${tab === 'login' ? ' login-tab--active' : ''}`}
              onClick={() => { setTab('login'); setError(''); setStatus('idle'); }}
            >
              Login
            </button>
            <button
              className={`login-tab${tab === 'register' ? ' login-tab--active' : ''}`}
              onClick={() => { setTab('register'); setError(''); setStatus('idle'); }}
            >
              Register
            </button>
          </div>
          <button className="login-close" onClick={onClose}>✕</button>
        </div>

        {tab === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <input
                type="email" id="login-email" required
                placeholder="Enter your email"
                value={loginData.email}
                onChange={e => { setLoginData(p => ({ ...p, email: e.target.value })); setError(''); }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                type="password" id="login-password" required
                placeholder="Enter your password"
                value={loginData.password}
                onChange={e => { setLoginData(p => ({ ...p, password: e.target.value })); setError(''); }}
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            {status === 'success' && <div className="login-success">✓ Welcome back!</div>}
            <button type="submit" className="login-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Logging in…' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            <div className="login-field">
              <label htmlFor="reg-username">Username</label>
              <input
                type="text" id="reg-username" required maxLength={30}
                placeholder="Choose a username"
                value={regData.username}
                onChange={e => { setRegData(p => ({ ...p, username: e.target.value })); setError(''); }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="reg-email">Email</label>
              <input
                type="email" id="reg-email" required
                placeholder="Enter your email"
                value={regData.email}
                onChange={e => { setRegData(p => ({ ...p, email: e.target.value })); setError(''); }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="reg-password">Password</label>
              <input
                type="password" id="reg-password" required minLength={4}
                placeholder="Choose a password"
                value={regData.password}
                onChange={e => { setRegData(p => ({ ...p, password: e.target.value })); setError(''); }}
              />
            </div>
            <div className="login-field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                type="password" id="reg-confirm" required
                placeholder="Repeat your password"
                value={regData.confirm}
                onChange={e => { setRegData(p => ({ ...p, confirm: e.target.value })); setError(''); }}
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            {status === 'success' && <div className="login-success">✓ Account created! Welcome!</div>}
            <button type="submit" className="login-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="login-demo">
          <h3>Quick Login — Demo Accounts</h3>
          <div className="login-demo-buttons">
            {DEMO_USERS.map(d => (
              <button key={d.email} type="button" className="login-demo-btn" onClick={() => quickLogin(d)}>
                <span className="login-demo-name">{d.label}</span>
                <span className="login-demo-note">{d.note}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
