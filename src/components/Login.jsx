import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login({ onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const result = login(formData.email, formData.password);
    
    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      admin: { email: 'admin@degensports.com', password: 'admin123' },
      editor: { email: 'editor@degensports.com', password: 'editor123' },
      user: { email: 'user@degensports.com', password: 'user123' }
    };
    
    const account = demoAccounts[role];
    setFormData(account);
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2>Login to DEGEN Sports</h2>
          <button className="login-close" onClick={onClose}>✕</button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="login-success">
              ✓ Login successful! Redirecting...
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-demo">
          <h3>Demo Accounts</h3>
          <div className="login-demo-buttons">
            <button
              type="button"
              className="login-demo-btn"
              onClick={() => handleDemoLogin('admin')}
            >
              Admin (can create content)
            </button>
            <button
              type="button"
              className="login-demo-btn"
              onClick={() => handleDemoLogin('editor')}
            >
              Editor (can create content)
            </button>
            <button
              type="button"
              className="login-demo-btn"
              onClick={() => handleDemoLogin('user')}
            >
              Regular User (read-only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
