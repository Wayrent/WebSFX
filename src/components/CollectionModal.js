// CollectionModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CollectionModal = ({ soundId, collections, onClose, onToggleSoundInCollection }) => {
  const [selectedCollections, setSelectedCollections] = useState([]);

  // Загрузка текущих коллекций, в которые добавлен звук
  useEffect(() => {
    const fetchSelectedCollections = async () => {
      try {
        const response = await api.getSoundCollections(soundId);
        setSelectedCollections(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке выбранных коллекций:', error);
      }
    };

    fetchSelectedCollections();
  }, [soundId]);

  // Обработчик изменения чекбокса
  const handleCheckboxChange = async (collectionId) => {
    try {
      if (selectedCollections.includes(collectionId)) {
        // Если чекбокс уже отмечен, удаляем звук из коллекции
        await api.removeSoundFromCollection(collectionId, soundId);
        setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
      } else {
        // Если чекбокс не отмечен, добавляем звук в коллекцию
        await api.addSoundToCollection(collectionId, soundId);
        setSelectedCollections((prev) => [...prev, collectionId]);
      }

      // Вызываем callback для обновления состояния родительского компонента
      onToggleSoundInCollection(collectionId, soundId);
    } catch (error) {
      console.error('Ошибка при обновлении коллекции:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Выберите коллекции</h3>
        <ul className="collection-list">
          {collections.map((collection) => (
            <li key={collection.id} className="collection-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection.id)}
                  onChange={() => handleCheckboxChange(collection.id)}
                />
                {collection.name}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="modal-close-button">
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default CollectionModal;