import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronRight,
  faTimes,
  faEdit,
  faCheck,
  faClockRotateLeft
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
  const [showHistory, setShowHistory] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
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
        console.log('STATUS:', profileResponse.subscription_status);
        console.log('SUBSCRIPTION END:', profileResponse.data.subscription_end);
        console.log('PARSED DATE:', new Date(profileResponse.data.subscription_end));
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

const fetchHistory = async () => {
  try {
    const localToken = localStorage.getItem('token');

    if (!localToken) {
      toast.error('Токен не найден. Пожалуйста, войдите заново.');
      return;
    }

    const response = await axios.get('http://localhost:5000/api/payment/history', {
      headers: { Authorization: `Bearer ${localToken}` }
    });
    setSubscriptionHistory(response.data.history || []);
    setShowHistory(true);
  } catch (err) {
    console.error('Ошибка получения истории:', err);
    toast.error('Не удалось загрузить историю подписки');
  }
};

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

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;

    const parsed = Date.parse(dateString);
    if (isNaN(parsed)) return null;

    const date = new Date(parsed);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysLeft = (end) => {
    if (!end) return null;

    const endDate = new Date(end);
    if (isNaN(endDate)) return null;

    const diff = endDate - new Date();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
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
    const token = localStorage.getItem('token'); // ← временно, надёжно

    if (!token) {
      toast.error('Вы не авторизованы');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/payment/simulate',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Подписка активирована (демо)');
      window.location.reload();
    } catch (err) {
      console.error('Ошибка активации подписки:', err);
      toast.error('Не удалось активировать подписку');
    }
  };

  const handleCancelSubscription = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5000/api/payment/cancel',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Подписка отменена');
      window.location.reload();
    } catch (err) {
      console.error('Ошибка отмены подписки:', err);
      toast.error('Не удалось отменить подписку');
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
    {/* ВЕРХНЯЯ ЧАСТЬ: профиль и подписка */}
    <div className="profile-top-columns">
      {/* Левая колонка: имя, email, заметка */}
      <div className="profile-left">
        <h2>{userData.username}</h2>
        <div className="info-row"><strong>Email:</strong> {userData.email}</div>
        <div className="info-row">
          <strong>О себе:</strong>
          {isEditingNote ? (
            <div className="note-edit">
              <textarea
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                rows="3"
              />
              <button onClick={handleUpdateNote} className="icon-button save">
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          ) : (
            <div className="note-display">
              {userData.note || 'Нет информации'}
              <button onClick={() => setIsEditingNote(true)} className="icon-button edit">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Правая колонка: подписка */}
      <div className="profile-right">
        <div className="subscription-banner">
        <div className="subscription-history-button" onClick={fetchHistory} title="История подписки">
          <FontAwesomeIcon icon={faClockRotateLeft} />
        </div>
          {userData.subscription_status === 'active' ? (
            <>
              <h3>Спасибо за подписку! 🎧</h3>
              <ul>
                <li>✔ Безлимитное скачивание</li>
                <li>✔ Доступ к эксклюзивным звукам</li>
                <li>✔ Поддержка проекта</li>
              </ul>
              {userData.subscription_end ? (
                <>
                  <p style={{marginTop: '10px' }}>
                    Подписка действует до: <strong>{formatDate(userData.subscription_end)}</strong>
                  </p>
                  {getDaysLeft(userData.subscription_end) !== null && (
                    <p style={{ fontSize: '14px', color: '#6c757d' }}>
                      Осталось:{' '}
                      <strong style={{
                        color: getDaysLeft(userData.subscription_end) <= 3 ? 'red' : 'inherit'
                      }}>
                        {getDaysLeft(userData.subscription_end)} дней
                      </strong>
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontStyle: 'italic', marginTop: '10px', color: '#888' }}>
                  Дата окончания подписки не указана
                </p>
              )}
              <button
                onClick={handleCancelSubscription}
                className="cancel-subscription-button subtle"
              >
                Отменить подписку
              </button>
            </>
          ) : (
            <>
              <h3>Подключите подписку 🎵</h3>
              <p>Вы получите:</p>
              <ul>
                <li>✔ До 100 скачиваний в день</li>
                <li>✔ Доступ к эксклюзивным звукам</li>
                <li>✔ Поддержка проекта</li>
              </ul>
              <button onClick={handleSubscribe} className="subscribe-button big">
                Купить за 100₽ / мес
              </button>
            </>
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
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>История подписки</h3>
            {subscriptionHistory.length === 0 ? (
              <p>Нет записей</p>
            ) : (
              <ul>
                {subscriptionHistory.map((entry, index) => (
                  <li key={index}>
                    <strong>Начало:</strong> {formatDate(entry.start)}<br />
                    <strong>Окончание:</strong> {formatDate(entry.end)}
                  </li>
                ))}
              </ul>
            )}
            <button className="cancel-button" onClick={() => setShowHistory(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
