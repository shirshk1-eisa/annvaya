import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken } from '../utils/api';
import { connectSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and fetch profile
    const token = localStorage.getItem('annvaya_token');
    if (token) {
      authAPI.getProfile()
        .then(data => {
          setUser(data.user);
          connectSocket(data.user);
        })
        .catch(() => {
          removeToken();
          localStorage.removeItem('annvaya_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('annvaya_user', JSON.stringify(data.user));
      connectSocket(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('annvaya_user', JSON.stringify(data.user));
      connectSocket(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem('annvaya_user');
    disconnectSocket();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('annvaya_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isDonor: user?.role === 'donor',
    isNgo: user?.role === 'ngo',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
