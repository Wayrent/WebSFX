import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import PasswordResetPage from './components/PasswordResetPage';
import './styles/global.css';
import './styles/header.css';
import './styles/footer.css';
import './styles/soundItem.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminUsers from './pages/AdminUsers';
import PaymentSuccess from './pages/PaymentSuccess';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyCodePage from './pages/VerifyCodePage';

const PrivateRoute = ({ element: Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

const AdminRoute = ({ element: Element }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && isAdmin ? <Element /> : <Navigate to="/" />;
};

const App = () => {
  const [searchFilters, setSearchFilters] = useState({});

  // Генерация и сохранение guestId для гостей
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('guestId', guestId);
    }
  }, []);

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
              <Route path="/request-reset" element={<PasswordResetPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
            </Routes>
          </div>
          <footer className="footer">
            &copy; {new Date().getFullYear()} Auris SFX. Все права защищены.
          </footer>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
