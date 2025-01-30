import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">SoundLibrary</Link>
      <div className="search-box">
        <input type="text" placeholder="Search..." />
      </div>
      <Link to="/profile" className="button">Мой профиль</Link>
      <button className="button" onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}>Выйти</button>
    </header>
  );
};

export default Header;
