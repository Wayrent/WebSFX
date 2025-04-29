import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/loading.css';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <FontAwesomeIcon icon={faSpinner} spin />
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;