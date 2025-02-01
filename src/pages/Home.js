import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SoundItem from '../components/SoundItem';

const Home = () => {
  const [sounds, setSounds] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sounds');
        setSounds(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке звуков:', error);
      }
    };

    const fetchCollections = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден, перенаправление на страницу входа');
        window.location.href = '/login';
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/collections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCollections(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке коллекций:', error);
      }
    };

    fetchSounds();
    fetchCollections();
  }, []);

  const handleCreateCollection = async (name, soundId) => {
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
          />
        ))}
      </ul>
    </div>
  );
};

export default Home;
