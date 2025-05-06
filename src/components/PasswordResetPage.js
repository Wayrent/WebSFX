import React, { useState } from 'react';
import axios from 'axios';

function PasswordResetPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      setMessage(response.data.message);
      setStep(2); // Переход ко вводу кода
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке запроса');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        token: resetCode,
        newPassword,
        confirmPassword: newPassword
      });      
      setMessage(response.data.message || 'Пароль успешно изменён');
      setStep(3); // Завершение
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Сброс пароля</h2>
      {step === 1 && (
        <form onSubmit={handleRequestReset} style={styles.form}>
          <input
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Отправка...' : 'Сбросить пароль'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleConfirmReset} style={styles.form}>
          <input
            type="text"
            placeholder="Введите код из письма"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Сброс...' : 'Установить пароль'}
          </button>
        </form>
      )}

      {step === 3 && (
        <p style={styles.success}>Пароль успешно изменён! Теперь вы можете войти с новым паролем.</p>
      )}

      {message && step !== 3 && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '80px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    marginTop: '20px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '15px',
  },
  error: {
    color: 'red',
    marginTop: '15px',
  },
};

export default PasswordResetPage;
