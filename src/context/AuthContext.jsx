import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, TokenManager } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = TokenManager.getToken();
      const refreshToken = TokenManager.getRefreshToken();
      const savedUser = localStorage.getItem('user');
      
      let userData = savedUser ? JSON.parse(savedUser) : null;

      if (token && !TokenManager.isTokenExpired(token)) {
        // Token is valid, let's fetch fresh user data to be sure
        try {
          const response = await authAPI.getMe();
          if (response.success && response.user) {
            userData = response.user;
            // Update local storage with fresh data
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.warn('Failed to fetch fresh user data, using cached data if available', err);
        }

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
            // Token valid but no user data? unlikely unless verifyOTP/login failed to set it initially
            // Logout to be safe
             logout();
        }

      } else if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
        try {
          const data = await authAPI.refreshToken();
          if (data.success && data.token) {
            TokenManager.setToken(data.token);
            setUser(data.user || userData);
            setIsAuthenticated(true);
            if (data.user) {
               localStorage.setItem('user', JSON.stringify(data.user));
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      } else {
         // No valid token, assume logged out
         if (isAuthenticated) { // Only call logout if we thought we were authenticated
            logout();
         } else {
             setUser(null);
             setIsAuthenticated(false);
             TokenManager.removeTokens();
         }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      const data = await authAPI.signup(email, password, name);
      return data; 
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const data = await authAPI.verifyOTP(userId, otp);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (userId) => {
    try {
      const data = await authAPI.resendOTP(userId);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      TokenManager.removeTokens();
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    verifyOTP,
    resendOTP,
    login,
    logout,
    checkAuth 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};