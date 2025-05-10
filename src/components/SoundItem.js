import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollectionModal from './CollectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/soundItem.css';

const SoundItem = ({ 
  sound, 
  isAuthenticated = false, 
  isAdmin = false,
  collections = [], 
  onCollectionAdd = () => {},
  onDelete = () => {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      alert('Авторизуйтесь, чтобы создать коллекцию');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Вы уверены, что хотите удалить звук "${sound.title}"?`)) {
      onDelete(sound.id);
    }
  };

  return (
    <div className="sound-item">
      {isAdmin && (
        <button className="sound-delete-btn" onClick={handleDeleteClick}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
      
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
        <a href={sound.url} download>
          <button className="download-btn">
            <FontAwesomeIcon icon={faDownload} />
            <span>Download</span>
          </button>
        </a>
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
  isAdmin: PropTypes.bool,
  collections: PropTypes.array,
  onCollectionAdd: PropTypes.func,
  onDelete: PropTypes.func
};

export default SoundItem;