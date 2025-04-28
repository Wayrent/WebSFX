import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

const UserInfo = ({ email, note = '', onUpdateNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);

  const handleSave = () => {
    setIsEditing(false);
    onUpdateNote(editedNote);
  };

  return (
    <div className="user-info">
      <div className="info-row">
        <strong>Email:</strong> {email}
      </div>
      <div className="info-row">
        <strong>About:</strong>
        {isEditing ? (
          <div className="note-edit">
            <textarea
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              rows="3"
            />
            <button onClick={handleSave} className="icon-button">
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </div>
        ) : (
          <div className="note-display">
            {note || 'No information'}
            <button 
              onClick={() => setIsEditing(true)} 
              className="icon-button"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  email: PropTypes.string.isRequired,
  note: PropTypes.string,
  onUpdateNote: PropTypes.func.isRequired
};

export default UserInfo;