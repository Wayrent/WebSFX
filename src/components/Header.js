import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/header.css';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        SoundLibrary
      </Link>
      <div className="search-box">
        <input type="text" placeholder="Поиск звуков..." />
        <button className="search-button">Найти</button>
      </div>
      <div className="button-group">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="button profile-button">
              Мой профиль
            </Link>
            {isAdmin && (
              <Link to="/upload" className="button upload-button">
                Загрузить звук
              </Link>
            )}
            <button onClick={handleLogout} className="button logout-button">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button">
              Войти
            </Link>
            <Link to="/register" className="button">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;