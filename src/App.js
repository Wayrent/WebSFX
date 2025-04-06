// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload'; // Убедитесь, что регистр совпадает с именем файла
import './styles/global.css';
import './styles/header.css';
import './styles/footer.css';
import './styles/soundItem.css';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Добавляем импорт useAuth

const App = () => {
  return (
    <AuthProvider> {/* Оборачиваем приложение в AuthProvider */}
      <Router>
        <div className="app-container">
          <Header />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<PrivateRoute element={Profile} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<PrivateRoute element={Upload} />} /> {/* Маршрут для загрузки звуков */}
            </Routes>
          </div>
          <footer className="footer">
            &copy; {new Date().getFullYear()} SoundLibrary. Все права защищены.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

// Приватный маршрут
const PrivateRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useAuth(); // Используем контекст
  console.log('PrivateRoute isAuthenticated:', isAuthenticated); // Логирование состояния
  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};

export default App;