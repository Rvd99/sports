import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('degen_sports_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('degen_sports_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication - in production, this would call your API
    const mockUsers = [
      { 
        id: 1, 
        email: 'admin@degensports.com', 
        password: 'admin123', 
        name: 'Admin User', 
        role: 'admin' 
      },
      { 
        id: 2, 
        email: 'editor@degensports.com', 
        password: 'editor123', 
        name: 'Editor User', 
        role: 'editor' 
      },
      { 
        id: 3, 
        email: 'user@degensports.com', 
        password: 'user123', 
        name: 'Regular User', 
        role: 'user' 
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };
      
      setUser(userData);
      localStorage.setItem('degen_sports_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('degen_sports_user');
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const canCreateContent = isAdmin || isEditor;

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isEditor,
    canCreateContent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
