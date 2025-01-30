import axios from 'axios';

// Настройка базового URL для всех запросов
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Убедитесь, что URL и порт указаны верно
});

// Функции для работы с API
export const getSounds = () => api.get('/sounds');
export const addFavorite = (soundId) => api.post(`/sounds/add_favorite?sound_id=${soundId}`);
export const downloadSound = (soundId) => api.get(`/sounds/download_sound?sound_id=${soundId}`);

export default api;
