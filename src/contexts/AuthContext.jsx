import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const MOCK_ADMINS = [
  { id: 'admin-1', email: 'admin@degensports.com', password: 'admin123', name: 'Admin User', username: 'Admin', avatar: 'AU', role: 'admin' },
  { id: 'editor-1', email: 'editor@degensports.com', password: 'editor123', name: 'Editor User', username: 'Editor', avatar: 'EU', role: 'editor' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('degen_sports_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('degen_sports_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Check mock admin/editor first
    const mock = MOCK_ADMINS.find(u => u.email === email && u.password === password);
    if (mock) {
      const { password: _pw, ...userData } = mock;
      setUser(userData);
      localStorage.setItem('degen_sports_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    // Try backend
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      localStorage.setItem('degen_sports_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const userData = await registerUser({ username, email, password });
      setUser(userData);
      localStorage.setItem('degen_sports_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('degen_sports_user');
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const canCreateContent = isAdmin || isEditor;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isEditor, canCreateContent }}>
      {children}
    </AuthContext.Provider>
  );
};
