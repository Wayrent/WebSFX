import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollectionModal from './CollectionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/soundItem.css';
import { downloadSound } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showConfirm } from './ConfirmDialog';

const SoundItem = ({
  sound,
  isAuthenticated = false,
  isAdmin = false,
  collections = [],
  onCollectionAdd = () => {},
  onDelete = () => {},
  onRemoveFromCollection = null, // <-- новая пропса
  collectionId = null           // <-- для удаления из конкретной коллекции
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  const handleAddToCollection = () => {
    if (!isAuthenticated) {
      toast.info('Авторизуйтесь, чтобы создать коллекцию');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    showConfirm({
    title: 'Удаление звука',
    message: `Вы уверены, что хотите удалить звук "${sound.title}"?`,
    onConfirm: () => onDelete(sound.id)
    });

  };

  const handleRemoveFromCollection = () => {
    if (window.confirm(`Удалить "${sound.title}" из этой коллекции?`)) {
      onRemoveFromCollection(collectionId, sound.id);
    }
  };

  return (
    <div className="sound-item">
      {isAdmin && (
        <button className="sound-delete-btn" onClick={handleDeleteClick}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}

      {!isAdmin && onRemoveFromCollection && collectionId && (
        <button className="sound-delete-btn" onClick={handleRemoveFromCollection}>
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
        {onRemoveFromCollection === null && (
          <button className="add-to-collection-btn" onClick={handleAddToCollection}>
            Add to Collection
          </button>
        )}

        <button className="download-btn" onClick={() => downloadSound(sound.id)}>
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
  isAdmin: PropTypes.bool,
  collections: PropTypes.array,
  onCollectionAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onRemoveFromCollection: PropTypes.func, // Новая
  collectionId: PropTypes.number          // Новая
};

export default SoundItem;
