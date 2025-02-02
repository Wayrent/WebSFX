import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

const Header = () => (
  <header className="header">
    <Link to="/" className="logo">SoundLibrary</Link>
    <div className="search-box">
      <input type="text" placeholder="Искать звуки..." />
      <button className="search-button">Поиск</button>
    </div>
    <div className="button-group">
      <Link to="/profile" className="button">Мой профиль</Link>
      <Link to="/logout" className="button">Выйти</Link>
    </div>
  </header>
);

export default Header;
