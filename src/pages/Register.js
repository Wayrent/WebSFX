import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../pages/auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Регистрация
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setStep(2); // Показываем форму для кода
      } else {
        setError(response.data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  // Подтверждение кода
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-registration', {
        email,
        code
      });

      if (response.data.success) {
        setMessage('Email подтвержден! Теперь вы можете войти.');
        setStep(3);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.error || 'Неверный код');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка подтверждения');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Регистрация</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {step === 1 && (
          <form onSubmit={handleRegister}>
            <label>
              Имя пользователя:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
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
            <button type="submit">Зарегистрироваться</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <label>
              Код подтверждения:
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            <button type="submit">Подтвердить</button>
          </form>
        )}

        {step === 3 && <p className="success-message">Перенаправляем на вход...</p>}
      </div>
    </div>
  );
};

export default Register;


// // Register.js
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Используем контекст аутентификации
// import '../pages/auth.css';

// const Register = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate(); // Используем useNavigate здесь
//   const { login } = useAuth(); // Используем метод login из контекста

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError('');
  
//   try {
//     const response = await axios.post('http://localhost:5000/api/auth/register', { 
//       username, 
//       email, 
//       password 
//     });
    
//     if (response.data.success) {
//       // Перенаправляем на страницу с сообщением о подтверждении email
//       navigate('/login', { 
//         state: { 
//           message: 'Registration successful! Please check your email to verify your account.' 
//         } 
//       });
//     } else {
//       throw new Error(response.data.error || 'Registration failed');
//     }
//   } catch (error) {
//     setError(error.response?.data?.error || error.message || 'Registration failed');
//   }
// };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Регистрация</h2>
//         {error && <p className="error-message">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <label>
//             Имя пользователя:
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </label>
//           <label>
//             Email:
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </label>
//           <label>
//             Пароль:
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </label>
//           <button type="submit">Зарегистрироваться</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;