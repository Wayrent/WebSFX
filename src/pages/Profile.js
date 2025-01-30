import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SoundItem from '../components/SoundItem';

const Profile = () => {
  const [collections, setCollections] = useState([]);
  const [soundsInCollection, setSoundsInCollection] = useState({});
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
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
    fetchCollections();
  }, []);

  const fetchSoundsInCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/api/collections/${collectionId}/sounds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSoundsInCollection((prev) => ({
        ...prev,
        [collectionId]: response.data,
      }));
    } catch (error) {
      console.error('Ошибка при загрузке звуков в коллекции:', error);
    }
  };

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
      <h2>Мой профиль</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateCollection(newCollectionName);
        setNewCollectionName('');
      }}>
        <label>Создать коллекцию:</label>
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          required
        />
        <button type="submit">Создать</button>
      </form>
      <h3>Мои коллекции</h3>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            <h4>{collection.name}</h4>
            <button onClick={() => fetchSoundsInCollection(collection.id)}>Показать звуки</button>
            <ul>
              {soundsInCollection[collection.id] &&
                soundsInCollection[collection.id].map((sound) => (
                  <SoundItem
                    key={sound.id}
                    sound={sound}
                    collections={collections}
                    onCollectionAdd={handleCreateCollection}
                  />
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
