import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SoundItem from '../components/SoundItem';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sounds');
        setSounds(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке звуков:', error);
      }
    };

    fetchSounds();
  }, []);

  const handleCreateCollection = async (name, soundId) => {
    if (!isAuthenticated) {
      alert('Войдите, чтобы добавить звук в коллекцию!');
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/collections', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newCollection = response.data;
      await axios.post('http://localhost:5000/api/collections/add_sound', { collectionId: newCollection.id, soundId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections([...collections, newCollection]);
    } catch (error) {
      console.error('Ошибка при создании коллекции:', error);
    }
  };

  return (
    <div>
      <ul>
        {sounds.map((sound) => (
          <SoundItem
            key={sound.id}
            sound={sound}
            collections={collections}
            onCollectionAdd={handleCreateCollection}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </ul>
    </div>
  );
};

export default Home;
