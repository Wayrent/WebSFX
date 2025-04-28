import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getSoundsInCollection as apiGetSoundCollections,
  addSoundToCollection as apiAddSoundToCollection,
  removeSoundFromCollection as apiRemoveSoundFromCollection
} from '../services/api';
import '../styles/collectionModal.css';

const CollectionModal = ({ soundId, collections, onClose, onToggleSoundInCollection }) => {
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSelectedCollections = async () => {
      try {
        setLoading(true);
        setError('');
        
        const results = await Promise.all(
          collections.map(async (collection) => {
            try {
              const response = await apiGetSoundCollections(collection.id);
              if (response.success) {
                return response.data.some(s => s.id === soundId) ? collection.id : null;
              }
              return null;
            } catch (err) {
              console.error(`Error checking collection ${collection.id}:`, err);
              return null;
            }
          })
        );
        
        setSelectedCollections(results.filter(id => id !== null));
      } catch (err) {
        console.error('Error loading collections:', err);
        setError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    if (collections && collections.length > 0) {
      fetchSelectedCollections();
    }
  }, [soundId, collections]);

  const handleCollectionToggle = async (collectionId) => {
    try {
      setLoading(true);
      setError('');
      
      const isSelected = selectedCollections.includes(collectionId);
      let result;

      if (isSelected) {
        result = await apiRemoveSoundFromCollection(collectionId, soundId);
      } else {
        result = await apiAddSoundToCollection(collectionId, soundId);
      }

      if (!result.success) {
        throw new Error(result.error || `Failed to ${isSelected ? 'remove from' : 'add to'} collection`);
      }

      setSelectedCollections(prev => 
        isSelected 
          ? prev.filter(id => id !== collectionId) 
          : [...prev, collectionId]
      );

      if (onToggleSoundInCollection) {
        onToggleSoundInCollection(collectionId, soundId, !isSelected);
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      setError(err.message || 'Operation failed');
      
      // Возвращаем предыдущее состояние при ошибке
      setSelectedCollections(prev => [...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Select Collections</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        {collections.length === 0 ? (
          <div className="no-collections-message">
            You don't have any collections yet. Create one in your profile.
          </div>
        ) : loading ? (
          <div className="loading-message">Loading...</div>
        ) : (
          <ul className="collection-list">
            {collections.map(collection => (
              <li key={collection.id} className="collection-item">
                <label className={loading ? 'disabled' : ''}>
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection.id)}
                    onChange={() => handleCollectionToggle(collection.id)}
                    disabled={loading}
                  />
                  <span>{collection.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        
        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

CollectionModal.propTypes = {
  soundId: PropTypes.number.isRequired,
  collections: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleSoundInCollection: PropTypes.func
};

export default CollectionModal;