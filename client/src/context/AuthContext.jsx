import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('emp_portal_user') || sessionStorage.getItem('emp_portal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('emp_portal_token') || sessionStorage.getItem('emp_portal_token') || null;
  });
  const [loading, setLoading] = useState(true);

  // Verify and fetch latest user info on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('emp_portal_token') || sessionStorage.getItem('emp_portal_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            if (localStorage.getItem('emp_portal_token')) {
              localStorage.setItem('emp_portal_user', JSON.stringify(res.data.user));
            } else {
              sessionStorage.setItem('emp_portal_user', JSON.stringify(res.data.user));
            }
          }
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, portal = null, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password, portal });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);

      if (rememberMe) {
        localStorage.setItem('emp_portal_token', newToken);
        localStorage.setItem('emp_portal_user', JSON.stringify(newUser));
        sessionStorage.removeItem('emp_portal_token');
        sessionStorage.removeItem('emp_portal_user');
      } else {
        sessionStorage.setItem('emp_portal_token', newToken);
        sessionStorage.setItem('emp_portal_user', JSON.stringify(newUser));
        localStorage.removeItem('emp_portal_token');
        localStorage.removeItem('emp_portal_user');
      }

      return newUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (registrationData) => {
    const res = await api.post('/auth/register', registrationData);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (payload) => {
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('emp_portal_token');
    localStorage.removeItem('emp_portal_user');
    sessionStorage.removeItem('emp_portal_token');
    sessionStorage.removeItem('emp_portal_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (localStorage.getItem('emp_portal_token')) {
      localStorage.setItem('emp_portal_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('emp_portal_user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
