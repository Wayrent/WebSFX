import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faUpload, 
  faSignOutAlt,
  faSignInAlt,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import '../styles/header.css';

const Header = () => {
  const { isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-wrapper">
        <Link to="/" className="logo">
          SoundLibrary
        </Link>

        <div className="search-group">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск звуков..."
          />
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="nav-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-btn profile" title="Профиль">
                <FontAwesomeIcon icon={faUser} />
              </Link>
              {isAdmin && (
                <Link to="/upload" className="nav-btn upload" title="Загрузить">
                  <FontAwesomeIcon icon={faUpload} />
                </Link>
              )}
              <button onClick={logout} className="nav-btn logout" title="Выйти">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn login" title="Войти">
                <FontAwesomeIcon icon={faSignInAlt} />
              </Link>
              <Link to="/register" className="nav-btn register" title="Регистрация">
                <FontAwesomeIcon icon={faUserPlus} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;