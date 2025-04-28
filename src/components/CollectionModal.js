import React, { useState, useEffect } from 'react';
import { 
  getSoundsInCollection as apiGetSoundCollections,
  addSoundToCollection as apiAddSoundToCollection,
  removeSoundFromCollection as apiRemoveSoundFromCollection
} from '../services/api';

const CollectionModal = ({ soundId, collections, onClose, onToggleSoundInCollection }) => {
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelectedCollections = async () => {
      try {
        const response = await apiGetSoundCollections(soundId);
        setSelectedCollections(response.map(c => c.id));
      } catch (error) {
        console.error('Error loading collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedCollections();
  }, [soundId]);

  const handleCheckboxChange = async (collectionId) => {
    try {
      if (selectedCollections.includes(collectionId)) {
        await apiRemoveSoundFromCollection(collectionId, soundId);
        setSelectedCollections(prev => prev.filter(id => id !== collectionId));
      } else {
        await apiAddSoundToCollection(collectionId, soundId);
        setSelectedCollections(prev => [...prev, collectionId]);
      }
      onToggleSoundInCollection(collectionId, soundId);
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  if (loading) return <div>Loading collections...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Select Collections</h3>
        <ul className="collection-list">
          {collections.map(collection => (
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
          Close
        </button>
      </div>
    </div>
  );
};

export default CollectionModal;