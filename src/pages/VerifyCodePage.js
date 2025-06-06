import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/auth.css';
import { toast } from 'react-toastify';

const VerifyCodePage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем email из состояния навигации или из локального хранилища
  const email = location.state?.email || localStorage.getItem('pendingEmail');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-registration', {
        email,
        code
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Удаляем временный email
        localStorage.removeItem('pendingEmail');
        // Перенаправляем на вход через 2 секунды
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.error || 'Ошибка подтверждения');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-code', { email });
      toast.info('Код отправлен повторно! Проверьте вашу почту.');
    } catch (err) {
      setError('Не удалось отправить код повторно');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Подтверждение email</h2>
        {success ? (
          <div className="success-message">
            <p>✅ Email успешно подтвержден!</p>
            <p>Перенаправляем на страницу входа...</p>
          </div>
        ) : (
          <>
            <p>Мы отправили 6-значный код на {email}</p>
            
            <form onSubmit={handleSubmit}>
              <label>
                Код подтверждения:
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите код из письма"
                  required
                />
              </label>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" disabled={loading}>
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>
            </form>
            
            <div className="resend-section">
              <p>Не получили код?</p>
              <button onClick={handleResend} disabled={loading}>
                Отправить код повторно
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCodePage;