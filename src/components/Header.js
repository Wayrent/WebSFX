import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">SoundLibrary</Link>
      <div className="search-box">
        <input type="text" placeholder="Search..." />
        <button className="search-button">Найти</button>
      </div>
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="button">Мой профиль</Link>
          <button className="button" onClick={handleLogout}>Выйти</button>
        </>
      ) : (
        <>
          <Link to="/register" className="button">Регистрация</Link>
          <Link to="/login" className="button">Войти</Link>
        </>
      )}
    </header>
  );
};

export default Header;
