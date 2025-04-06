// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import SoundItem from '../components/SoundItem';
// import Modal from '../components/Modal';
// import UserInfo from '../components/UserInfo';
// import UploadModal from '../components/UploadModal'; // Импортируем новый компонент
// import '../styles/profile.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';

// const Profile = () => {
//   const [collections, setCollections] = useState([]);
//   const [soundsInCollection, setSoundsInCollection] = useState({});
//   const [newCollectionName, setNewCollectionName] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [userData, setUserData] = useState({ email: '', note: '' });
//   const [expandedCollections, setExpandedCollections] = useState({});
//   const [confirmDelete, setConfirmDelete] = useState(false); // Состояние для подтверждения удаления
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Состояние модального окна
//   const [collectionToDelete, setCollectionToDelete] = useState(null); // ID коллекции для удаления

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error('Токен не найден, перенаправление на страницу входа');
//       window.location.href = '/login';
//       return;
//     }
//     setIsAuthenticated(!!token);
//     const fetchCollections = async () => {
//       try {
//         const response = await api.get('/collections', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setCollections(response.data);
//         const userResponse = await api.get('/user', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const { email, note } = userResponse.data;
//         setUserData({ email, note: note || '' });
//       } catch (error) {
//         console.error('Ошибка при загрузке данных:', error);
//       }
//     };
//     fetchCollections();
//   }, []);

//   const fetchSoundsInCollection = async (collectionId) => {
//     const token = localStorage.getItem('token');
//     try {
//       const response = await api.get(`/collections/${collectionId}/sounds`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSoundsInCollection((prev) => ({
//         ...prev,
//         [collectionId]: response.data,
//       }));
//     } catch (error) {
//       console.error('Ошибка при загрузке звуков в коллекции:', error);
//     }
//   };

//   const handleCreateCollection = async (name) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error('Токен не найден, перенаправление на страницу входа');
//       window.location.href = '/login';
//       return;
//     }
//     try {
//       const response = await api.post('/collections', { name }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const newCollection = response.data;
//       setCollections([...collections, newCollection]);
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error('Ошибка при создании коллекции:', error);
//     }
//   };

//   const handleDeleteCollection = async (collectionId) => {
//     if (!confirmDelete || collectionId !== collectionToDelete) {
//       return; // Если подтверждение не получено, ничего не делаем
//     }

//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error('Токен не найден, перенаправление на страницу входа');
//       window.location.href = '/login';
//       return;
//     }

//     try {
//       await api.delete(`/collections/${collectionId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCollections((prev) =>
//         prev.filter((collection) => collection.id !== collectionId)
//       );
//       setSoundsInCollection((prev) => {
//         const updatedSounds = { ...prev };
//         delete updatedSounds[collectionId];
//         return updatedSounds;
//       });
//       setExpandedCollections((prev) => {
//         const updatedExpanded = { ...prev };
//         delete updatedExpanded[collectionId];
//         return updatedExpanded;
//       });
//       setConfirmDelete(false); // Сбрасываем состояние подтверждения
//     } catch (error) {
//       console.error('Ошибка при удалении коллекции:', error);
//     }
//   };

//   const toggleCollection = (collectionId) => {
//     setExpandedCollections((prev) => ({
//       ...prev,
//       [collectionId]: !prev[collectionId],
//     }));
//     if (!expandedCollections[collectionId]) {
//       fetchSoundsInCollection(collectionId);
//     }
//   };

//   const handleUpdateNote = async (note) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error('Токен не найден, перенаправление на страницу входа');
//       window.location.href = '/login';
//       return;
//     }
//     try {
//       await api.put('/user/note', { note }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUserData((prev) => ({ ...prev, note }));
//     } catch (error) {
//       console.error('Ошибка при обновлении заметки:', error);
//     }
//   };

//   const confirmDeleteCollection = (collectionId) => {
//     setCollectionToDelete(collectionId); // Устанавливаем ID коллекции для удаления
//     setConfirmDelete(true); // Показываем диалог подтверждения
//   };

//   const cancelDelete = () => {
//     setConfirmDelete(false); // Сбрасываем состояние подтверждения
//     setCollectionToDelete(null); // Сбрасываем ID коллекции
//   };

//   // Проверка роли пользователя (добавьте соответствующее поле в базу данных)
//   const isAdmin = userData.role === 'admin';

//   return (
//     <div className="profile-container">
//       <h2>Мой профиль</h2>
//       <UserInfo
//         email={userData.email}
//         note={userData.note}
//         onUpdateNote={handleUpdateNote}
//       />
//       <button className="create-collection-button" onClick={() => setIsModalOpen(true)}>
//         Создать коллекцию
//       </button>
//       <div className="collections-section">
//         <h3>Мои коллекции</h3>
//         <ul className="collections-list">
//           {collections.map((collection) => (
//             <li key={collection.id} className="collection-item">
//               <div
//                 className="collection-header"
//                 onClick={() => toggleCollection(collection.id)}
//                 style={{ cursor: 'pointer' }}
//               >
//                 <h4>{collection.name}</h4>
//                 <div className="collection-actions">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleCollection(collection.id);
//                     }}
//                     className="toggle-button"
//                   >
//                     <i
//                       className={expandedCollections[collection.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'}
//                     ></i>
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       confirmDeleteCollection(collection.id); // Запрашиваем подтверждение
//                     }}
//                     className="delete-button"
//                   >
//                     <i className="fas fa-times"></i>
//                   </button>
//                 </div>
//               </div>
//               {expandedCollections[collection.id] && (
//                 <ul className="sound-list">
//                   {soundsInCollection[collection.id] &&
//                     soundsInCollection[collection.id].map((sound) => (
//                       <SoundItem
//                         key={`${collection.id}-${sound.id}`}
//                         sound={sound}
//                         collections={collections}
//                         onCollectionAdd={handleCreateCollection}
//                         isAuthenticated={isAuthenticated}
//                       />
//                     ))}
//                 </ul>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <h3>Создать коллекцию</h3>
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleCreateCollection(newCollectionName);
//           }}
//         >
//           <label>Название коллекции:</label>
//           <input
//             type="text"
//             value={newCollectionName}
//             onChange={(e) => setNewCollectionName(e.target.value)}
//             required
//           />
//           <button type="submit">Создать</button>
//         </form>
//       </Modal>

//       {/* Диалог подтверждения удаления */}
//       {confirmDelete && (
//         <div className="confirmation-modal">
//           <div className="confirmation-content">
//             <p>Вы уверены, что хотите удалить коллекцию?</p>
//             <div className="confirmation-buttons">
//               <button onClick={() => handleDeleteCollection(collectionToDelete)}>Да</button>
//               <button onClick={cancelDelete}>Нет</button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Кнопка загрузки видна только администратору */}
//       {isAdmin && (
//         <button 
//           className="upload-sound-button" 
//           onClick={() => setIsUploadModalOpen(true)}
//         >
//           Загрузить новый звук
//         </button>
//       )}
      
//       {/* Модальное окно загрузки */}
//       <UploadModal 
//         isOpen={isUploadModalOpen} 
//         onClose={() => setIsUploadModalOpen(false)} 
//       />
//     </div>
//   );
// };

// export default Profile;




// Profile.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SoundItem from '../components/SoundItem';
import Modal from '../components/Modal';
import UserInfo from '../components/UserInfo';
import '../styles/profile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Profile = () => {
  const [collections, setCollections] = useState([]);
  const [soundsInCollection, setSoundsInCollection] = useState({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ email: '', note: '' });
  const [expandedCollections, setExpandedCollections] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false); // Состояние для подтверждения удаления
  const [collectionToDelete, setCollectionToDelete] = useState(null); // ID коллекции для удаления

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }
    setIsAuthenticated(!!token);

    const fetchCollections = async () => {
      try {
        const response = await api.get('/collections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCollections(response.data);

        const userResponse = await api.get('/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { email, note } = userResponse.data;
        setUserData({ email, note: note || '' });
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchCollections();
  }, []);

  const fetchSoundsInCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.get(`/collections/${collectionId}/sounds`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const response = await api.post(
        '/collections',
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newCollection = response.data;
      setCollections([...collections, newCollection]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Ошибка при создании коллекции:', error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!confirmDelete || collectionId !== collectionToDelete) {
      return; // Если подтверждение не получено, ничего не делаем
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }
    try {
      await api.delete(`/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId)
      );
      setSoundsInCollection((prev) => {
        const updatedSounds = { ...prev };
        delete updatedSounds[collectionId];
        return updatedSounds;
      });
      setExpandedCollections((prev) => {
        const updatedExpanded = { ...prev };
        delete updatedExpanded[collectionId];
        return updatedExpanded;
      });
      setConfirmDelete(false); // Сбрасываем состояние подтверждения
    } catch (error) {
      console.error('Ошибка при удалении коллекции:', error);
    }
  };

  const toggleCollection = (collectionId) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
    if (!expandedCollections[collectionId]) {
      fetchSoundsInCollection(collectionId);
    }
  };

  const handleUpdateNote = async (note) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }
    try {
      await api.put(
        '/user/note',
        { note },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData((prev) => ({ ...prev, note }));
    } catch (error) {
      console.error('Ошибка при обновлении заметки:', error);
    }
  };

  const confirmDeleteCollection = (collectionId) => {
    setCollectionToDelete(collectionId); // Устанавливаем ID коллекции для удаления
    setConfirmDelete(true); // Показываем диалог подтверждения
  };

  const cancelDelete = () => {
    setConfirmDelete(false); // Сбрасываем состояние подтверждения
    setCollectionToDelete(null); // Сбрасываем ID коллекции
  };

  return (
    <div className="profile-container">
      <h2>Мой профиль</h2>
      <UserInfo
        email={userData.email}
        note={userData.note}
        onUpdateNote={handleUpdateNote}
      />
      <button
        className="create-collection-button"
        onClick={() => setIsModalOpen(true)}
      >
        Создать коллекцию
      </button>
      <div className="collections-section">
        <h3>Мои коллекции</h3>
        <ul className="collections-list">
          {collections.map((collection) => (
            <li key={collection.id} className="collection-item">
              <div
                className="collection-header"
                onClick={() => toggleCollection(collection.id)}
                style={{ cursor: 'pointer' }}
              >
                <h4>{collection.name}</h4>
                <div className="collection-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollection(collection.id);
                    }}
                    className="toggle-button"
                  >
                    <i
                      className={
                        expandedCollections[collection.id]
                          ? 'fas fa-chevron-down'
                          : 'fas fa-chevron-right'
                      }
                    ></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteCollection(collection.id); // Запрашиваем подтверждение
                    }}
                    className="delete-button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              {expandedCollections[collection.id] && (
                <ul className="sound-list">
                  {soundsInCollection[collection.id] &&
                    soundsInCollection[collection.id].map((sound) => (
                      <SoundItem
                        key={`${collection.id}-${sound.id}`}
                        sound={sound}
                        collections={collections}
                        onCollectionAdd={handleCreateCollection}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Создать коллекцию</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCollection(newCollectionName);
          }}
        >
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
      {/* Диалог подтверждения удаления */}
      {confirmDelete && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <p>Вы уверены, что хотите удалить коллекцию?</p>
            <div className="confirmation-buttons">
              <button onClick={() => handleDeleteCollection(collectionToDelete)}>
                Да
              </button>
              <button onClick={cancelDelete}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;