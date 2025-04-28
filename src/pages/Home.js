import React, { useState, useEffect } from 'react';
import { getSounds, getCollections } from '../services/api';
import SoundItem from '../components/SoundItem';
import { useAuth } from '../contexts/AuthContext';
import '../styles/global.css';

const Home = () => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

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

  const handleCollectionAdd = async (collectionId, soundId) => {
    try {
      console.log(`Adding sound ${soundId} to collection ${collectionId}`);
      // Здесь будет логика добавления в коллекцию через API
    } catch (err) {
      console.error('Error adding to collection:', err);
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
      <div className="sound-grid">
        {sounds.length > 0 ? (
          sounds.map(sound => (
            <SoundItem
              key={sound.id}
              sound={sound}
              isAuthenticated={isAuthenticated}
              collections={collections}
              onCollectionAdd={handleCollectionAdd}
            />
          ))
        ) : (
          <div className="no-sounds-message">
            <p>No sounds available yet.</p>
            {isAuthenticated && (
              <p>You can upload new sounds using the Upload button in the header.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;