import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
      window.location.reload(); // Обновление страницы после входа
    } catch (error) {
      console.error('Ошибка при входе:', error);
    }
  };

  return (
    <div>
      <h2>Войти</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;



// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const Login = ({ setIsAuthenticated }) => {
// //   const [formData, setFormData] = useState({
// //     email: '',
// //     password: '',
// //   });

// //   const handleChange = (e) => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value,
// //     });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const response = await axios.post('http://localhost:5000/api/auth/login', formData);
// //       localStorage.setItem('token', response.data.token);
// //       setIsAuthenticated(true);
// //       alert('Login successful!');
// //     } catch (error) {
// //       console.error('Error logging in user:', error);
// //       alert('Login failed');
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Login</h2>
// //       <form onSubmit={handleSubmit}>
// //         <div>
// //           <label>Email:</label>
// //           <input type="email" name="email" value={formData.email} onChange={handleChange} required />
// //         </div>
// //         <div>
// //           <label>Password:</label>
// //           <input type="password" name="password" value={formData.password} onChange={handleChange} required />
// //         </div>
// //         <button type="submit">Login</button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default Login;

// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
//       const { token } = response.data;
//       localStorage.setItem('token', token); // Сохранение токена в localStorage
//       window.location.href = '/';
//     } catch (error) {
//       console.error('Error logging in:', error);
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Email:</label>
//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <label>Password:</label>
//         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;
