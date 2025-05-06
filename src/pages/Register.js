// Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Используем контекст аутентификации
import '../pages/auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Используем useNavigate здесь
  const { login } = useAuth(); // Используем метод login из контекста

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', { 
      username, 
      email, 
      password 
    });
    
    if (response.data.success) {
      // Перенаправляем на страницу с сообщением о подтверждении email
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.' 
        } 
      });
    } else {
      throw new Error(response.data.error || 'Registration failed');
    }
  } catch (error) {
    setError(error.response?.data?.error || error.message || 'Registration failed');
  }
};

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Регистрация</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
};

export default Register;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './auth.css';

// const Register = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
//       localStorage.setItem('token', response.data.token);
//       navigate('/');
//       window.location.reload(); // Обновление страницы после регистрации
//     } catch (error) {
//       console.error('Ошибка при регистрации:', error);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Регистрация</h2>
//         <form onSubmit={handleSubmit}>
//           <label>
//             Имя пользователя:
//             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
//           </label>
//           <label>
//             Email:
//             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </label>
//           <label>
//             Пароль:
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </label>
//           <button type="submit">Зарегистрироваться</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;