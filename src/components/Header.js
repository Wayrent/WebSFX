import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faUpload, 
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faFilter,
  faTimesCircle,
  faUsersCog // Новая иконка для управления пользователями
} from '@fortawesome/free-solid-svg-icons';
import '../styles/header.css';
import '../styles/search.css';

const Header = ({ onSearch }) => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    bitrate: '',
    quality: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  const navigate = useNavigate(); // Хук для навигации

  const handleSearch = () => {
    const searchParams = {
      q: searchTerm,
      ...filters
    };
    
    // Всегда перенаправляем на главную страницу
    navigate('/', { state: { searchParams } });
    
    // Если есть обработчик поиска (для главной страницы)
    if (onSearch) {
      onSearch(searchParams);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      bitrate: '',
      quality: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
    // Сразу применяем сброшенные фильтры
    onSearch({
      q: '',
      category: '',
      bitrate: '',
      quality: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>

          {showFilters && (
            <div className="filters-dropdown">
              <div className="filter-section">
                <label>Категория:</label>
                <select 
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="Музыка">Музыка</option>
                  <option value="Эффекты">Эффекты</option>
                  <option value="Голоса">Голоса</option>
                </select>
              </div>

              <div className="filter-section">
                <label>Битрейт:</label>
                <select 
                  name="bitrate"
                  value={filters.bitrate}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="128 kbps">128 kbps</option>
                  <option value="192 kbps">192 kbps</option>
                  <option value="256 kbps">256 kbps</option>
                  <option value="320 kbps">320 kbps</option>
                </select>
              </div>

              <div className="filter-section">
                <label>Качество:</label>
                <select 
                  name="quality"
                  value={filters.quality}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="filter-section">
                <label>Сортировка:</label>
                <select 
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="title">По названию</option>
                  <option value="bitrate">По битрейту</option>
                  <option value="category">По категории</option>
                </select>
                <select 
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                >
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </div>

              {/* Новая кнопка сброса фильтров */}
              <div className="filter-actions">
                <button 
                  className="reset-filters-button"
                  onClick={resetFilters}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <span>Сбросить фильтры</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="nav-buttons">
         {isAdmin && (
            <>
              <Link to="/admin/users" className="nav-btn admin" title="Управление пользователями">
                <FontAwesomeIcon icon={faUsersCog} />
              </Link>
            </>
          )}
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