import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import './styles/global.css';
import './styles/header.css';
import './styles/footer.css';
import './styles/soundItem.css';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Добавляем useAuth в импорт
import AdminUsers from './pages/AdminUsers';

const App = () => {
  const [searchFilters, setSearchFilters] = useState({});

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header onSearch={setSearchFilters} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home searchFilters={searchFilters} />} />
              <Route path="/profile" element={<PrivateRoute element={Profile} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<PrivateRoute element={Upload} />} />
              <Route path="/admin/users" element={<AdminRoute element={AdminUsers} />} />
            </Routes>
          </div>
          <footer className="footer">
            &copy; {new Date().getFullYear()} SoundLibrary. Все права защищены.
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

// Управление пользователями
const AdminRoute = ({ element: Element }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isAdmin ? <Element /> : <Navigate to="/" />;
};

// PrivateRoute вынесен в отдельную функцию
const PrivateRoute = ({ element: Element }) => {
  const { isAuthenticated, loading } = useAuth(); // Теперь useAuth определен
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

export default App;