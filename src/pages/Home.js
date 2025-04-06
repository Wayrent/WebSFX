// Home.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Используем централизованный API
import SoundItem from '../components/SoundItem';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Используем контекст аутентификации

const Home = () => {
  const [sounds, setSounds] = useState([]); // Состояние для хранения звуков
  const [collections, setCollections] = useState([]); // Состояние для хранения коллекций
  const navigate = useNavigate(); // Для навигации
  const { isAuthenticated } = useAuth(); // Используем контекст для проверки аутентификации

  // Загрузка звуков при монтировании компонента
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await api.getSounds(); // Вызываем метод getSounds
        setSounds(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('No sounds found:', error.response.data.error);
        } else {
          console.error('Ошибка при загрузке звуков:', error);
        }
      }
    };

    // Загрузка коллекций пользователя при монтировании компонента
    const fetchCollections = async () => {
      if (!isAuthenticated) return; // Если пользователь не авторизован, не загружаем коллекции
      try {
        const response = await api.get('/collections'); // Получаем коллекции через API
        setCollections(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке коллекций:', error);
      }
    };

    fetchSounds();
    fetchCollections();
  }, [isAuthenticated]);

  return (
    <div className="home-container">
      <h2>Список звуков</h2>
      {sounds.length === 0 ? (
        <p>Звуки не найдены</p>
      ) : (
        <ul className="sound-list">
          {sounds.map((sound) => (
            <SoundItem
              key={sound.id}
              sound={sound}
              collections={collections} // Передаем список коллекций
              onCollectionAdd={(collectionId, soundId) => handleCollectionChange(collectionId, soundId)} // Передаем callback
              isAuthenticated={isAuthenticated} // Передаем состояние аутентификации
            />
          ))}
        </ul>
      )}
    </div>
  );
};

// Callback для обновления состояния коллекций
const handleCollectionChange = async (collectionId, soundId) => {
  try {
    const result = await api.get(`/sounds/${soundId}/collections`);
    const selectedCollections = result.data;

    if (selectedCollections.includes(collectionId)) {
      await api.removeSoundFromCollection(collectionId, soundId);
      console.log(`Звук ${soundId} удален из коллекции ${collectionId}`);
    } else {
      await api.addSoundToCollection(collectionId, soundId);
      console.log(`Звук ${soundId} добавлен в коллекцию ${collectionId}`);
    }
  } catch (error) {
    console.error('Ошибка при обновлении коллекции:', error);
  }
};

export default Home;