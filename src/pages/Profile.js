import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Импортируем api для других запросов
import SoundItem from '../components/SoundItem';
import Modal from '../components/Modal'; // Импортируем компонент модального окна
import '../styles/profile.css'; // Подключаем стили для профиля

const Profile = () => {
  const [collections, setCollections] = useState([]);
  const [soundsInCollection, setSoundsInCollection] = useState({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден, перенаправление на страницу входа');
        window.location.href = '/login';
        return;
      }
      setIsAuthenticated(!!token);

      try {
        const response = await api.get('/collections', {
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
      const response = await api.get(`/collections/${collectionId}/sounds`, {
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

  const handleCreateCollection = async (name) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.post('/collections', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newCollection = response.data;
      setCollections([...collections, newCollection]);
      setIsModalOpen(false); // Закрытие модального окна после создания коллекции
    } catch (error) {
      console.error('Ошибка при создании коллекции:', error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }

    try {
      await api.delete(`/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections((prev) => prev.filter(collection => collection.id !== collectionId));
      setSoundsInCollection((prev) => {
        const updatedSounds = { ...prev };
        delete updatedSounds[collectionId];
        return updatedSounds;
      });
    } catch (error) {
      console.error('Ошибка при удалении коллекции:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Мой профиль</h2>
      <button className="create-collection-button" onClick={() => setIsModalOpen(true)}>Создать коллекцию</button>
      <ul className="collections-list">
        {collections.map((collection) => (
          <li key={collection.id} className="collection-item">
            <h4>{collection.name}</h4>
            <button onClick={() => fetchSoundsInCollection(collection.id)}>Показать звуки</button>
            <button onClick={() => handleDeleteCollection(collection.id)} className="delete-button">Удалить коллекцию</button>
            <ul>
              {soundsInCollection[collection.id] &&
                soundsInCollection[collection.id].map((sound) => (
                  <SoundItem
                    key={`${collection.id}-${sound.id}`} // Уникальный ключ для каждого звука
                    sound={sound}
                    collections={collections}
                    onCollectionAdd={handleCreateCollection}
                    isAuthenticated={isAuthenticated} // Передаем значение isAuthenticated
                  />
                ))}
            </ul>
          </li>
        ))}
      </ul>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Создать коллекцию</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateCollection(newCollectionName);
        }}>
          <label>Название коллекции:</label>
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            required
          />
          <button type="submit">Создать</button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
