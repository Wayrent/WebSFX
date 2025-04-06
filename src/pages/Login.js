// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Используем контекст аутентификации
import '../pages/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Используем useNavigate здесь
  const { login } = useAuth(); // Используем метод login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const token = response.data.token;

      // Вызываем метод login из контекста с данными пользователя
      login({ token, email });

      setSuccessMessage('Успешный вход!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/profile'); // Перенаправляем на страницу профиля
      }, 1000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Произошла ошибка при входе. Попробуйте позже.');
      }
      console.error('Ошибка при входе:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Войти</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Пароль:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
};

export default Login;