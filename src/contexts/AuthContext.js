// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Импортируем API

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token); // Загружаем данные пользователя
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token); // Сохраняем токен в localStorage
    setIsAuthenticated(true); // Обновляем состояние аутентификации
    setUser(userData); // Сохраняем данные пользователя
  };

  const logout = () => {
    localStorage.removeItem('token'); // Удаляем токен из localStorage
    setIsAuthenticated(false); // Обновляем состояние аутентификации
    setUser(null); // Очищаем данные пользователя
  };

  const fetchUserData = async (token) => {
    try {
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data); // Сохраняем данные пользователя
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout(); // Если токен недействителен, выполняем выход
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};