import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getSounds = () => api.get('/sounds');
export const addFavorite = (soundId) => api.post(`/sounds/add_favorite?sound_id=${soundId}`);
export const downloadSound = (soundId) => api.get(`/sounds/download_sound?sound_id=${soundId}`);
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const deleteCollection = (collectionId) => api.delete(`/collections/${collectionId}`);

export default api;
