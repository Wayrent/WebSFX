import React from 'react';
import PropTypes from 'prop-types';
import { addFavorite, downloadSound } from '../services/api';

const SoundItem = ({ sound }) => {
  const handleAddFavorite = async (e) => {
    e.preventDefault();
    try {
      await addFavorite(sound.id);
      // Дополнительно: обновить состояние, если требуется
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleDownloadSound = async (e) => {
    e.preventDefault();
    try {
      await downloadSound(sound.id);
      // Дополнительно: обработать скачивание, если требуется
    } catch (error) {
      console.error('Error downloading sound:', error);
    }
  };

  return (
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
      <div className="d-flex justify-content-between mt-2">
        <form onSubmit={handleAddFavorite} className="mr-2">
          <button type="submit" className={`btn ${sound.isFavorite ? 'btn-danger' : 'btn-primary'}`} title={sound.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}>
            <i className={`fas ${sound.isFavorite ? 'fa-heart-broken' : 'fa-heart'}`}></i>
          </button>
        </form>
        <a href="#" onClick={handleDownloadSound} className="btn btn-primary" title="Скачать">
          <i className="fas fa-download"></i>
        </a>
      </div>
    </li>
  );
};

SoundItem.propTypes = {
  sound: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.string.isRequired,
    bitrate: PropTypes.string.isRequired,
    quality: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    isFavorite: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SoundItem;
