// Header.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Используем контекст аутентификации
import '../styles/header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Получаем данные из контекста

  const handleLogout = () => {
    logout(); // Вызываем метод logout из контекста
  };

  console.log('User data:', user); // Отладочное сообщение
  console.log('Is admin:', user?.role === 'admin'); // Безопасная проверка роли

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
            {/* Показываем "Мой профиль" */}
            <Link to="/profile" className="button profile-button">
              Мой профиль
            </Link>
            {/* Показываем кнопку загрузки звуков только для администраторов */}
            {user?.role === 'admin' && (
              <Link to="/upload" className="button upload-button">
                Загрузить звук
              </Link>
            )}
            {/* Кнопка выхода */}
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