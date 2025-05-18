import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    return Promise.reject(error);
  }
);

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
          userId: response.data.userId,
          username: response.data.username
        }
      };
    }
    throw new Error(response.data?.error || 'Invalid response');
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Login failed'
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed'
    };
  }
};

export const downloadSound = async (soundId) => {
  try {
    const token = localStorage.getItem('token');
    const guestId = localStorage.getItem('guestId');
    let headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (guestId) {
      headers['x-guest-id'] = guestId;
    }

    const response = await fetch(`http://localhost:5000/api/download/${soundId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Ошибка при скачивании');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sound_${soundId}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    toast.error('Ошибка при загрузке');
  }
};

// Sound functions
export const getSounds = async () => {
  try {
    const response = await api.get('/sounds');
    
    if (response.data && (Array.isArray(response.data) || response.data.data)) {
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : response.data.data
      };
    }
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      success: false,
      error: 'Failed to fetch sounds from database',
      data: []
    };
  }
};

export const searchSounds = async (filters) => {
  try {
    const response = await api.get('/sounds/search', { params: filters });
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Search failed'
    };
  }
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
  try {
    const response = await api.get('/collections');
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : response.data?.data || []
    };
  } catch (error) {
    console.error('API Error in getCollections:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch collections'
    };
  }
};

export const createCollection = async (name) => {
  try {
    const response = await api.post('/collections', { name });
    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create collection'
    };
  }
};

export const deleteCollection = async (id) => {
  try {
    await api.delete(`/collections/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete collection'
    };
  }
};

export const getSoundsInCollection = async (collectionId) => {
  try {
    const response = await api.get(`/collections/${collectionId}/sounds`);
    
    if (response.status !== 200) {
      throw new Error(`Server returned status ${response.status}`);
    }
    
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : response.data?.data || []
    };
  } catch (error) {
    console.error('API Error in getSoundsInCollection:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'You do not have access to this collection',
      status: error.response?.status
    };
  }
};

export const addSoundToCollection = async (collectionId, soundId) => {
  try {
    const response = await api.post('/collections/add_sound', { collectionId, soundId });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add sound to collection'
    };
  }
};

export const removeSoundFromCollection = async (collectionId, soundId) => {
  try {
    const response = await api.delete(`/collections/${collectionId}/sounds/${soundId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error removing sound:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to remove sound from collection',
      status: error.response?.status
    };
  }
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
  try {
    const response = await api.put('/user/note', { note });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update note'
    };
  }
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;