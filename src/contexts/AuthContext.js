import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  getUserProfile,
  register as apiRegister,
  searchSounds as apiSearchSounds
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Добавляем функцию для поиска
  const searchSounds = async (filters) => {
    try {
      return await apiSearchSounds(filters);
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: 'Search failed'
      };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserProfile();
        
        if (response.success) {
          setIsAuthenticated(true);
          setUser({
            ...response.data,
            token,
            isAdmin: response.data?.role === 'admin'
          });
        } else {
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const result = await apiLogin(credentials);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      localStorage.setItem('token', result.token);
      
      const profileResponse = await getUserProfile();
      if (!profileResponse.success) {
        throw new Error('Failed to fetch user profile');
      }

      setIsAuthenticated(true);
      setUser({
        ...profileResponse.data,
        token: result.token,
        isAdmin: profileResponse.data?.role === 'admin'
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const result = await apiRegister(userData);
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      loading,
      error,
      login, 
      logout,
      register,
      isAdmin: user?.isAdmin,
      searchSounds // Добавляем функцию поиска в контекст
    }}>
      {children}
    </AuthContext.Provider>
  );
};