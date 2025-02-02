import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    // Удаляем токен из localStorage при выходе
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Дополнительно можно добавить редирект на главную страницу или страницу логина
  };

  return (
    <header className="header">
      <Link to="/" className="logo">SoundLibrary</Link>
      <div className="search-box">
        <input type="text" placeholder="Поиск звуков..." />
        <button className="search-button">Найти</button>
      </div>
      <div className="button-group">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="button">Мой профиль</Link>
            <button onClick={handleLogout} className="button">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="button">Войти</Link>
            <Link to="/register" className="button">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
