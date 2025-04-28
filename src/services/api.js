import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Auth functions
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      return {
        success: true,
        token: response.data.token,
        user: {
          email: response.data.email,
          role: response.data.role,
          userId: response.data.userId
        }
      };
    }
    throw new Error(response.data?.error || 'Invalid response from server');
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Login failed'
    };
  }
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Sound functions
export const getSounds = async () => {
  const response = await api.get('/sounds');
  return response.data?.data || []; // Ensure we always return an array
};

export const uploadSound = async (formData) => {
  try {
    const response = await api.post('/sounds/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Upload failed'
    };
  }
};

// Collection functions
export const getCollections = async () => {
  const response = await api.get('/collections');
  return response.data?.data || [];
};

export const createCollection = async (collectionData) => {
  const response = await api.post('/collections', collectionData);
  return response.data;
};

export const deleteCollection = async (collectionId) => {
  const response = await api.delete(`/collections/${collectionId}`);
  return response.data;
};

export const getSoundsInCollection = async (collectionId) => {
  const response = await api.get(`/collections/${collectionId}/sounds`);
  return response.data?.data || [];
};

export const addSoundToCollection = async (collectionId, soundId) => {
  const response = await api.post('/collections/add_sound', { collectionId, soundId });
  return response.data;
};

export const removeSoundFromCollection = async (collectionId, soundId) => {
  const response = await api.delete(`/collections/${collectionId}/sounds/${soundId}`);
  return response.data;
};

// User functions
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return {
      success: true,
      data: {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        role: response.data.role,
        note: response.data.note,
        subscription_status: response.data.subscription_status
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch profile'
    };
  }
};

export const updateUserNote = async (note) => {
  const response = await api.put('/user/note', { note });
  return response.data;
};

// Add JWT interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;