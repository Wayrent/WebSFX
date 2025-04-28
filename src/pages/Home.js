import React, { useState, useEffect } from 'react';
import { getSounds } from '../services/api';
import SoundItem from '../components/SoundItem';
import { useAuth } from '../contexts/AuthContext';
import '../styles/global.css';

const Home = () => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  // Функция для обновления списка звуков
  const refreshSounds = async () => {
    try {
      setLoading(true);
      const soundsData = await getSounds();
      if (Array.isArray(soundsData)) {
        setSounds(soundsData);
      } else {
        setSounds([]);
        console.error('Expected array but got:', soundsData);
      }
    } catch (err) {
      console.error('Error refreshing sounds:', err);
      setError('Failed to refresh sounds');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик добавления звука в коллекцию
  const handleCollectionAdd = async (collectionId, soundId) => {
    try {
      console.log(`Adding sound ${soundId} to collection ${collectionId}`);
      // Здесь будет логика добавления в коллекцию через API
    } catch (err) {
      console.error('Error adding to collection:', err);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        
        // Загружаем звуки
        await refreshSounds();
        
        // Загружаем коллекции для авторизованных пользователей
        if (isAuthenticated) {
          // TODO: Реализовать загрузку коллекций
          setCollections([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Эффект для подписки на обновления (если используется WebSocket или аналоги)
  useEffect(() => {
    // Можно добавить подписку на обновления списка звуков
    return () => {
      // Отписка при размонтировании
    };
  }, []);

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
              onSoundUploaded={refreshSounds} // Передаём функцию обновления
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