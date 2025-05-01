import React, { useState, useEffect } from 'react';
import { getSounds, getCollections } from '../services/api';
import SoundItem from '../components/SoundItem';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/global.css';

const Home = () => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  const refreshSounds = async () => {
    try {
      setLoading(true);
      const soundsResponse = await getSounds();
      
      if (soundsResponse.success) {
        setSounds(soundsResponse.data || []);
      } else {
        setSounds([]);
        console.error('Error fetching sounds:', soundsResponse.error);
      }
    } catch (err) {
      console.error('Error refreshing sounds:', err);
      setError('Failed to refresh sounds');
      setSounds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSound = async (soundId) => {
    try {
      const response = await api.delete(`/sounds/${soundId}`);
      
      if (response.data?.success) {  // Исправлено: проверяем response.data.success
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
      } else {
        console.error('Error loading collections:', collectionsResponse.error);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        await refreshSounds();
        
        if (isAuthenticated) {
          await loadCollections();
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (loading) return <div className="loading">Loading sounds...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-container">
      <h1>Sound Library</h1>
      {error && <div className="error-message">{error}</div>}
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
            <p>No sounds available yet.</p>
            {isAuthenticated && user?.isAdmin && (
              <p>You can upload new sounds using the Upload button in the header.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;