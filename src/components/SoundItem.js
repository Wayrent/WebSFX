import React from 'react';
import PropTypes from 'prop-types';

const SoundItem = ({ sound, collections, onCollectionAdd }) => (
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
      <button onClick={() => onCollectionAdd(sound.id)} className="btn btn-secondary">Add to Collection</button>
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
};

export default SoundItem;
