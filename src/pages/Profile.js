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
  getUserProfile
} from '../services/api';
import api from '../services/api';
import '../styles/profile.css';

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

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту коллекцию?')) return;
    
    try {
      setIsLoading(true);
      const response = await deleteCollection(collectionId);
      
      if (response.success) {
        setCollections(prev => prev.filter(c => c.id !== collectionId));
        setSoundsInCollection(prev => {
          const newSounds = {...prev};
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
        <h2>Мой профиль</h2>
        <div className="user-info">
          <div className="info-row">
            <strong>Email:</strong> {userData.email}
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




// import React, { useState, useEffect } from 'react';
// import { 
//   getCollections, 
//   getUserProfile,
//   getSoundsInCollection, 
//   createCollection, 
//   deleteCollection,
//   updateUserNote
// } from '../services/api';
// import SoundItem from '../components/SoundItem';
// import Modal from '../components/Modal';
// import UserInfo from '../components/UserInfo';
// import '../styles/profile.css';

// const Profile = () => {
//   const [collections, setCollections] = useState([]);
//   const [soundsInCollection, setSoundsInCollection] = useState({});
//   const [userData, setUserData] = useState(null);
//   const [newCollectionName, setNewCollectionName] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [expandedCollections, setExpandedCollections] = useState({});
//   const [loading, setLoading] = useState({
//     profile: true,
//     collections: true,
//     sounds: false
//   });
//   const [error, setError] = useState('');

//   const fetchData = async () => {
//     try {
//       setLoading(prev => ({ ...prev, profile: true, collections: true }));
//       setError('');
      
//       const [profileResponse, collectionsResponse] = await Promise.all([
//         getUserProfile(),
//         getCollections()
//       ]);

//       if (!profileResponse.success) {
//         throw new Error(profileResponse.error || 'Failed to load profile');
//       }

//       if (!collectionsResponse.success) {
//         console.error('Collections error:', collectionsResponse.error);
//         setCollections([]);
//       } else {
//         setCollections(collectionsResponse.data || []);
//       }

//       setUserData(profileResponse.data);
//     } catch (err) {
//       console.error('Profile load error:', err);
//       setError(err.message || 'Failed to load profile data');
//     } finally {
//       setLoading(prev => ({ ...prev, profile: false, collections: false }));
//     }
//   };

//   const fetchSoundsInCollection = async (collectionId) => {
//     try {
//       setLoading(prev => ({ ...prev, sounds: true }));
//       const response = await getSoundsInCollection(collectionId);
      
//       if (!response.success) {
//         throw new Error(response.error || 'Failed to load sounds');
//       }

//       setSoundsInCollection(prev => ({
//         ...prev,
//         [collectionId]: response.data || []
//       }));
//     } catch (err) {
//       console.error('Error loading sounds:', err);
//       setError(err.message || 'Failed to load collection sounds');
//     } finally {
//       setLoading(prev => ({ ...prev, sounds: false }));
//     }
//   };

//   const handleCreateCollection = async () => {
//     if (!newCollectionName.trim()) return;
    
//     try {
//       setLoading(prev => ({ ...prev, collections: true }));
//       const response = await createCollection(newCollectionName);
      
//       if (!response.success) {
//         throw new Error(response.error || 'Failed to create collection');
//       }

//       setCollections(prev => [...prev, response.data]);
//       setIsModalOpen(false);
//       setNewCollectionName('');
//     } catch (err) {
//       console.error('Error creating collection:', err);
//       setError(err.message || 'Failed to create collection');
//     } finally {
//       setLoading(prev => ({ ...prev, collections: false }));
//     }
//   };

//   const handleDeleteCollection = async (collectionId) => {
//     try {
//       setLoading(prev => ({ ...prev, collections: true }));
//       const response = await deleteCollection(collectionId);
      
//       if (!response.success) {
//         throw new Error(response.error || 'Failed to delete collection');
//       }

//       setCollections(prev => prev.filter(c => c.id !== collectionId));
//       setSoundsInCollection(prev => {
//         const newSounds = {...prev};
//         delete newSounds[collectionId];
//         return newSounds;
//       });
//     } catch (err) {
//       console.error('Error deleting collection:', err);
//       setError(err.message || 'Failed to delete collection');
//     } finally {
//       setLoading(prev => ({ ...prev, collections: false }));
//     }
//   };

//   const toggleCollection = (collectionId) => {
//     setExpandedCollections(prev => ({
//       ...prev,
//       [collectionId]: !prev[collectionId]
//     }));
    
//     if (!expandedCollections[collectionId] && !soundsInCollection[collectionId]) {
//       fetchSoundsInCollection(collectionId);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   if (loading.profile) return <div className="loading">Loading profile...</div>;
//   if (error) return <div className="error-message">{error}</div>;
//   if (!userData) return <div className="error-message">User data not available</div>;

//   return (
//     <div className="profile-container">
//       <h2>My Profile</h2>
      
//       <UserInfo
//         email={userData.email}
//         note={userData.note || ''}
//         onUpdateNote={async (note) => {
//           const result = await updateUserNote(note);
//           if (result.success) {
//             setUserData(prev => ({ ...prev, note }));
//           } else {
//             setError(result.error);
//           }
//         }}
//       />
      
//       <button 
//         className="create-collection-button"
//         onClick={() => setIsModalOpen(true)}
//         disabled={loading.collections}
//       >
//         {loading.collections ? 'Processing...' : 'Create Collection'}
//       </button>
      
//       <div className="collections-section">
//         <h3>My Collections</h3>
//         {loading.collections && collections.length === 0 ? (
//           <div className="loading">Loading collections...</div>
//         ) : collections.length === 0 ? (
//           <p className="no-collections-message">You don't have any collections yet.</p>
//         ) : (
//           <ul className="collections-list">
//             {collections.map(collection => (
//               <li key={collection.id} className="collection-item">
//                 <div
//                   className="collection-header"
//                   onClick={() => toggleCollection(collection.id)}
//                 >
//                   <h4>{collection.name}</h4>
//                   <div className="collection-actions">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleCollection(collection.id);
//                       }}
//                       className="toggle-button"
//                       disabled={loading.sounds}
//                     >
//                       {expandedCollections[collection.id] ? '▼' : '►'}
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (window.confirm('Are you sure you want to delete this collection?')) {
//                           handleDeleteCollection(collection.id);
//                         }
//                       }}
//                       className="delete-button"
//                       disabled={loading.collections}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
                
//                 {expandedCollections[collection.id] && (
//                   <div className="collection-content">
//                     {loading.sounds ? (
//                       <div className="loading">Loading sounds...</div>
//                     ) : soundsInCollection[collection.id]?.length > 0 ? (
//                       <div className="sound-list">
//                         {soundsInCollection[collection.id].map(sound => (
//                           <SoundItem
//                             key={`${collection.id}-${sound.id}`}
//                             sound={sound}
//                             isAuthenticated={true}
//                           />
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="no-sounds-message">No sounds in this collection</p>
//                     )}
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
      
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <h3>Create New Collection</h3>
//         <div className="modal-form">
//           <input
//             type="text"
//             value={newCollectionName}
//             onChange={(e) => setNewCollectionName(e.target.value)}
//             placeholder="Collection name"
//             disabled={loading.collections}
//           />
//           {error && <div className="error-message">{error}</div>}
//           <div className="modal-actions">
//             <button 
//               onClick={() => setIsModalOpen(false)}
//               disabled={loading.collections}
//             >
//               Cancel
//             </button>
//             <button 
//               onClick={handleCreateCollection}
//               disabled={!newCollectionName.trim() || loading.collections}
//             >
//               {loading.collections ? 'Creating...' : 'Create'}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Profile;



