import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronRight,
  faTimes,
  faEdit,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import SoundItem from '../components/SoundItem';
import { 
  getCollections,
  getSoundsInCollection,
  createCollection,
  deleteCollection,
  updateUserNote,
  getUserProfile,
  removeSoundFromCollection
} from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../styles/profile.css';
import { toast } from 'react-toastify';
import { showConfirm } from '../components/ConfirmDialog';

const Profile = () => {
  const [collections, setCollections] = useState([]);
  const [soundsInCollection, setSoundsInCollection] = useState({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [expandedCollections, setExpandedCollections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileResponse, collectionsResponse] = await Promise.all([
          getUserProfile(),
          getCollections()
        ]);

        if (!profileResponse.success) {
          throw new Error(profileResponse.error || 'Failed to load profile');
        }

        setUserData(profileResponse.data);
        setEditedNote(profileResponse.data.note || '');
        
        if (collectionsResponse.success) {
          setCollections(collectionsResponse.data || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    fetchProfileData();
  }, []);

  const fetchSoundsInCollection = async (collectionId) => {
    try {
      const response = await getSoundsInCollection(collectionId);
      if (response.success) {
        setSoundsInCollection(prev => ({
          ...prev,
          [collectionId]: response.data || []
        }));
      }
    } catch (err) {
      setError('Failed to load collection sounds');
    }
  };

  const handleDeleteSound = async (soundId) => {
    try {
      const response = await api.delete(`/sounds/${soundId}`);
      if (response.success) {
        setSoundsInCollection(prev => {
          const updated = {};
          for (const collectionId in prev) {
            updated[collectionId] = prev[collectionId].filter(s => s.id !== soundId);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting sound:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await createCollection(newCollectionName);
      
      if (response.success) {
        setCollections(prev => [...prev, response.data]);
        setIsModalOpen(false);
        setNewCollectionName('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = (collectionId) => {
    showConfirm({
      title: 'Удаление коллекции',
      message: 'Вы уверены, что хотите удалить эту коллекцию?',
      onConfirm: () => performCollectionDeletion(collectionId),
      onCancel: () => console.log('Удаление отменено')
    });
  };

  const performCollectionDeletion = async (collectionId) => {
  try {
    setIsLoading(true);
    const response = await deleteCollection(collectionId);
    
    if (response.success) {
      setCollections(prev => prev.filter(c => c.id !== collectionId));
      setSoundsInCollection(prev => {
        const newSounds = { ...prev };
        delete newSounds[collectionId];
        return newSounds;
      });
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};



  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
    
    if (!expandedCollections[collectionId] && !soundsInCollection[collectionId]) {
      fetchSoundsInCollection(collectionId);
    }
  };

  const handleUpdateNote = async () => {
    try {
      const response = await updateUserNote(editedNote);
      if (response.success) {
        setUserData(prev => ({ ...prev, note: editedNote }));
        setIsEditingNote(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

    const handleRemoveFromCollection = async (collectionId, soundId) => {
    try {
      await removeSoundFromCollection(collectionId, soundId);
      setSoundsInCollection(prev => ({
        ...prev,
        [collectionId]: prev[collectionId].filter(s => s.id !== soundId)
      }));
    } catch (err) {
      console.error('Ошибка удаления из коллекции:', err);
      toast.error('Не удалось удалить звук из коллекции');
    }
  };

  
  const handleSubscribe = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/payment/create',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Ошибка при создании оплаты:', err);
      toast.error('Не удалось создать оплату. Попробуйте позже.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Загружаем ваш профиль..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!userData) {
    return <div className="no-data">Данные профиля не найдены</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>{userData.username}</h2>
        <div className="user-info">
          <div className="info-row">
            <strong>Email:</strong> {userData.email}
          </div>
          <div className="info-row">
            <strong>Подписка:</strong>{' '}
            {userData.subscription_status === 'active' ? (
              <span className="subscription-active"> активна ✅</span>
            ) : (
              <span className="subscription-inactive-wrapper">
                <span className="subscription-inactive">не активна ❌</span>
                <button onClick={handleSubscribe} className="subscribe-button">
                  Купить за 50₽ / мес
                </button>
              </span>
            )}
          </div>
          <div className="info-row">
            <strong>О себе:</strong>
            {isEditingNote ? (
              <div className="note-edit">
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  rows="3"
                />
                <button 
                  onClick={handleUpdateNote}
                  className="icon-button save"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            ) : (
              <div className="note-display">
                {userData.note || 'Нет информации'}
                <button 
                  onClick={() => setIsEditingNote(true)}
                  className="icon-button edit"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="collections-section">
        <div className="section-header">
          <h3>Мои коллекции</h3>
          <button 
            className="create-collection-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Новая коллекция
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="empty-collections">
            У вас пока нет коллекций. Создайте первую!
          </div>
        ) : (
          <ul className="collections-list">
            {collections.map(collection => (
              <li key={collection.id} className="collection-item">
                <div 
                  className="collection-header"
                  onClick={() => toggleCollection(collection.id)}
                >
                  <h4>{collection.name}</h4>
                  <div className="collection-actions">
                    <button
                      className="toggle-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollection(collection.id);
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={expandedCollections[collection.id] ? faChevronDown : faChevronRight} 
                      />
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>

                {expandedCollections[collection.id] && (
                  <div className="collection-content">
                    {soundsInCollection[collection.id]?.length > 0 ? (
                      <div className="sounds-grid">
                        {soundsInCollection[collection.id].map(sound => (
                          <SoundItem
                            key={`${collection.id}-${sound.id}`}
                            sound={sound}
                            isAdmin={userData?.role === 'admin'}
                            onDelete={handleDeleteSound}
                            showActions={false}
                            onRemoveFromCollection={handleRemoveFromCollection}
                            collectionId={collection.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="no-sounds">
                        В этой коллекции пока нет звуков
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Создать новую коллекцию</h3>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-form">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Название коллекции"
              />
              <div className="modal-actions">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="cancel-button"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="confirm-button"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
