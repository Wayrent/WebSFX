import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollectionModal from './CollectionModal';
import '../styles/soundItem.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const SoundItem = ({ 
  sound, 
  isAuthenticated = false, 
  collections = [], 
  onCollectionAdd = () => {} 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      alert('Please login to add to collections');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="sound-item">
      <h5>{sound.title}</h5>
      <div className="sound-characteristics">
        <span className="category">{sound.category}</span>
        <span className="tags">Tags: {sound.tags}</span>
        <span className="bitrate">Bitrate: {sound.bitrate}</span>
        <span className="duration">Duration: {sound.duration}s</span>
      </div>
      <audio controls src={sound.url} />
      <div className="button-group">
        <button onClick={handleAddToCollection}>
          Add to Collection
        </button>
        <button onClick={() => console.log('Download:', sound.id)}>
          <FontAwesomeIcon icon={faDownload} />
        </button>
      </div>
      
      {isModalOpen && (
        <CollectionModal
          soundId={sound.id}
          collections={collections}
          onClose={() => setIsModalOpen(false)}
          onToggleSoundInCollection={onCollectionAdd}
        />
      )}
    </div>
  );
};

SoundItem.propTypes = {
  sound: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
  collections: PropTypes.array,
  onCollectionAdd: PropTypes.func
};

export default SoundItem;