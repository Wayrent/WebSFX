import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollectionModal from './CollectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import '../styles/soundItem.css';

const SoundItem = ({ 
  sound, 
  isAuthenticated = false, 
  collections = [], 
  onCollectionAdd = () => {} 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      alert('Авторизуйтесь, чтобы создать коллекцию');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="sound-item">
      <div className="sound-header">
        <h5>{sound.title}</h5>
        <div className="sound-characteristics">
          <span className="category">{sound.category}</span>
          <span className="tags">Tags: {sound.tags}</span>
          <span className="bitrate">Bitrate: {sound.bitrate}</span>
          <span className="duration">Duration: {sound.duration}s</span>
        </div>
      </div>
      
      <div className="audio-player-container">
        <audio controls src={sound.url} className="audio-player" />
      </div>
      
      <div className="sound-actions">
        <button 
          className="add-to-collection-btn"
          onClick={handleAddToCollection}
        >
          Add to Collection
        </button>
        <button 
          className="download-btn"
          onClick={() => console.log('Download:', sound.id)}
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Download</span>
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