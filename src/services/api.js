// // api.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// });

// // Автоматическое добавление токена в заголовки
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   console.log('Token from localStorage:', token); // Отладочное сообщение
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Глобальная обработка ошибок
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       console.error('Unauthorized access or expired token');
//       window.location.href = '/login';
//     } else if (error.response && error.response.status === 404) {
//       console.error('Resource not found:', error.response.data.error);
//     } else if (error.response && error.response.status === 400) {
//       console.error('Bad request:', error.response.data.error);
//     } else if (!error.response) {
//       console.error('Network error:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// // Методы API
// api.getSounds = () => api.get('/sounds');
// api.getSoundCollections = (soundId) => api.get(`/sounds/${soundId}/collections`);
// api.addSoundToCollection = (collectionId, soundId) =>
//   api.post(`/collections/${collectionId}/sounds`, { sound_id: soundId });
// api.removeSoundFromCollection = (collectionId, soundId) =>
//   api.delete(`/collections/${collectionId}/sounds/${soundId}`);

// api.uploadSound = (data) => {
//   const formData = new FormData();
//   Object.keys(data).forEach(key => {
//     formData.append(key, data[key]);
//   });

//   return api.post('/sounds/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
// };

// api.uploadSound = (data) => {
//   const formData = new FormData();
//   Object.keys(data).forEach((key) => {
//     formData.append(key, data[key]);
//   });

//   return api.post('/sounds/upload', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// };

// export default api;


// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Автоматическое добавление токена в заголовки
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token); // Логирование токена
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Глобальная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access or expired token');
      window.location.href = '/login';
    } else if (error.response && error.response.status === 404) {
      console.error('Resource not found:', error.response.data.error);
    } else if (error.response && error.response.status === 400) {
      console.error('Bad request:', error.response.data.error);
    } else if (!error.response) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Методы API
api.getSounds = () => api.get('/sounds');
api.getSoundCollections = (soundId) => api.get(`/sounds/${soundId}/collections`);
api.addSoundToCollection = (collectionId, soundId) =>
  api.post(`/collections/${collectionId}/sounds`, { sound_id: soundId });
api.removeSoundFromCollection = (collectionId, soundId) =>
  api.delete(`/collections/${collectionId}/sounds/${soundId}`);

// Загрузка звука
api.uploadSound = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  return api.post('/sounds/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;