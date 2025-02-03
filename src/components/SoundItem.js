import React from 'react';
import PropTypes from 'prop-types';
import '../styles/soundItem.css'; // Обновленный путь к файлу стилей
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // Импортируем значок загрузки

const SoundItem = ({ sound, collections, onCollectionAdd, isAuthenticated }) => (
  <li className="list-group-item sound-item">
    <h5>{sound.title}</h5>
    <div className="sound-characteristics">
      <div className="characteristics-row">
        <span className="category">{sound.category}</span>
        <span className="tags">Tags: {sound.tags}</span>
      </div>
      <div className="characteristics-row">
        <span className="bitrate">Bitrate: {sound.bitrate}</span>
        <span className="quality">Quality: {sound.quality}</span>
        <span className="duration">Duration: {sound.duration} seconds</span>
      </div>
    </div>
    <div className="audio-container">
      <audio controls className="mb-2 mt-2">
        <source src={sound.url} type={`audio/${sound.url.split('.').pop()}`} />
        Your browser does not support the audio element.
      </audio>
    </div>
    <div className="button-group">
      {isAuthenticated ? (
        <button onClick={() => onCollectionAdd(sound.id)} className="btn btn-secondary">В коллекцию</button>
      ) : (
        <button onClick={() => alert('Войдите, чтобы добавить звук в коллекцию!')} className="btn btn-secondary">В коллекцию</button>
      )}
      <button className="btn btn-primary">
        <FontAwesomeIcon icon={faDownload} />
      </button>
    </div>
  </li>
);

SoundItem.propTypes = {
  sound: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.string.isRequired,
    bitrate: PropTypes.string.isRequired,
    quality: PropTypes.string.isRequired,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    url: PropTypes.string.isRequired,
    isFavorite: PropTypes.bool,
  }).isRequired,
  collections: PropTypes.array.isRequired,
  onCollectionAdd: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default SoundItem;
