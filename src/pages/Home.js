import React, { useState, useEffect } from 'react';
import { getSounds, getCollections, searchSounds } from '../services/api';
import SoundItem from '../components/SoundItem';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/global.css';
import { useLocation } from 'react-router-dom';

const Home = ({ searchFilters = {} }) => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Добавляем обработку состояния из навигации
  useEffect(() => {
    if (location.state?.searchParams) {
      loadSounds(location.state.searchParams);
    } else {
      loadSounds(searchFilters);
    }
  }, [searchFilters, location.state]);

  const loadSounds = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      let result;
      const hasSearchQuery = filters.q && filters.q.trim() !== '';
      const hasActiveFilters = Object.keys(filters).some(
        key => key !== 'q' && filters[key] !== ''
      );

      if (hasSearchQuery || hasActiveFilters) {
        console.log('Searching with filters:', filters);
        result = await searchSounds(filters);
      } else {
        console.log('Loading all sounds');
        result = await getSounds();
      }
      
      if (result.success) {
        setSounds(result.data || []);
        if (result.data.length === 0) {
          setError('No sounds found matching your criteria');
        }
      } else {
        setSounds([]);
        setError(result.error || 'Failed to load sounds');
      }
    } catch (err) {
      console.error('Error loading sounds:', err);
      setError('Failed to load sounds');
      setSounds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSound = async (soundId) => {
    try {
      const response = await api.delete(`/sounds/${soundId}`);
      
      if (response.data?.success) {
        setSounds(prevSounds => prevSounds.filter(s => s.id !== soundId));
      } else {
        throw new Error(response.data?.error || 'Failed to delete sound');
      }
    } catch (error) {
      console.error('Error deleting sound:', error);
      setError(error.message || 'Failed to delete sound');
    }
  };

  const loadCollections = async () => {
    try {
      const collectionsResponse = await getCollections();
      if (collectionsResponse.success) {
        setCollections(collectionsResponse.data || []);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadSounds(searchFilters);
      
      if (isAuthenticated) {
        await loadCollections();
      }
    };

    loadData();
  }, [searchFilters, isAuthenticated]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading sounds...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Sound Library</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">
            &times;
          </button>
        </div>
      )}

      <div className="sound-grid">
        {sounds.length > 0 ? (
          sounds.map(sound => (
            <SoundItem
              key={sound.id}
              sound={sound}
              isAuthenticated={isAuthenticated}
              isAdmin={user?.isAdmin}
              collections={collections}
              onDelete={handleDeleteSound}
            />
          ))
        ) : (
          <div className="no-sounds-message">
            {error ? (
              <p>{error}</p>
            ) : (
              <>
                <p>Звуки пока недоступны...</p>
                {isAuthenticated && user?.isAdmin && (
                  <p>You can upload new sounds using the Upload button in the header.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;