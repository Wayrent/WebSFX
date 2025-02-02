import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Проверка наличия токена

  const handleLogout = () => {
    // Логика выхода из аккаунта
    localStorage.removeItem('token'); // Удаление токена из локального хранилища
    navigate('/login'); // Перенаправление на страницу входа
  };

  return (
    <header className="header">
      <Link to="/" className="logo">SoundLibrary</Link>
      <div className="search-box">
        <input type="text" placeholder="Искать звуки..." />
        <button className="search-button">Поиск</button>
      </div>
      <div className="button-group">
        {token ? (
          <>
            <Link to="/profile" className="button">Мой профиль</Link>
            <button onClick={handleLogout} className="button">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/register" className="button">Регистрация</Link>
            <Link to="/login" className="button">Войти</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
