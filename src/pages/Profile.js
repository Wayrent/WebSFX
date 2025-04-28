import React, { useState, useEffect } from 'react';
import { 
  getCollections, 
  getUserProfile,
  getSoundsInCollection, 
  createCollection, 
  deleteCollection,
  updateUserNote
} from '../services/api';
import SoundItem from '../components/SoundItem';
import Modal from '../components/Modal';
import UserInfo from '../components/UserInfo';
import '../styles/profile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Profile = () => {
  const [collections, setCollections] = useState([]);
  const [soundsInCollection, setSoundsInCollection] = useState({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [expandedCollections, setExpandedCollections] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [profileResponse, collectionsResponse] = await Promise.all([
          getUserProfile(),
          getCollections()
        ]);

        if (!profileResponse.success) {
          throw new Error(profileResponse.error);
        }
        setUserData(profileResponse.data);

        if (collectionsResponse.success) {
          setCollections(collectionsResponse.data);
        } else {
          console.error('Error loading collections:', collectionsResponse.error);
        }
      } catch (err) {
        console.error('Profile load error:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchSoundsInCollection = async (collectionId) => {
    try {
      const response = await getSoundsInCollection(collectionId);
      if (response.success) {
        setSoundsInCollection(prev => ({
          ...prev,
          [collectionId]: response.data
        }));
      }
    } catch (err) {
      console.error('Error loading sounds:', err);
      setError('Failed to load collection sounds');
    }
  };

  const handleCreateCollection = async (name) => {
    try {
      const response = await createCollection({ name });
      if (response.success) {
        setCollections(prev => [...prev, response.data]);
        setIsModalOpen(false);
        setNewCollectionName('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!confirmDelete || collectionId !== collectionToDelete) return;
    
    try {
      const response = await deleteCollection(collectionId);
      if (response.success) {
        setCollections(prev => prev.filter(c => c.id !== collectionId));
        setSoundsInCollection(prev => {
          const newSounds = {...prev};
          delete newSounds[collectionId];
          return newSounds;
        });
        setExpandedCollections(prev => {
          const newExpanded = {...prev};
          delete newExpanded[collectionId];
          return newExpanded;
        });
        setConfirmDelete(false);
        setCollectionToDelete(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
    }
  };

  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
    
    if (!expandedCollections[collectionId]) {
      fetchSoundsInCollection(collectionId);
    }
  };

  const confirmDeleteCollection = (collectionId) => {
    setCollectionToDelete(collectionId);
    setConfirmDelete(true);
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setCollectionToDelete(null);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div className="error-message">User data not available</div>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <UserInfo
        email={userData.email}
        note={userData.note || ''}
        onUpdateNote={async (note) => {
          const result = await updateUserNote(note);
          if (result.success) {
            setUserData(prev => ({ ...prev, note }));
          } else {
            setError(result.error);
          }
        }}
      />
      
      <button 
        className="create-collection-button"
        onClick={() => setIsModalOpen(true)}
      >
        Create Collection
      </button>
      
      <div className="collections-section">
        <h3>My Collections</h3>
        <ul className="collections-list">
          {collections.map(collection => (
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
                      confirmDeleteCollection(collection.id);
                    }}
                    className="delete-button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              {expandedCollections[collection.id] && (
                <ul className="sound-list">
                  {soundsInCollection[collection.id]?.map(sound => (
                    <SoundItem
                      key={`${collection.id}-${sound.id}`}
                      sound={sound}
                      collections={collections}
                      onCollectionAdd={() => handleCreateCollection}
                      isAuthenticated={true}
                    />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Create Collection</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCollection(newCollectionName);
          }}
        >
          <label>Collection Name:</label>
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
      </Modal>
      
      {confirmDelete && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <p>Are you sure you want to delete this collection?</p>
            <div className="confirmation-buttons">
              <button onClick={() => handleDeleteCollection(collectionToDelete)}>
                Yes
              </button>
              <button onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;