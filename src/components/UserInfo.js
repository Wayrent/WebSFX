import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

const UserInfo = ({ email, note, onUpdateNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note || '');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onUpdateNote(editedNote);
  };

  return (
    <div className="user-info">
      <p>Email: {email}</p>
      <div className="note-section">
        <span>О себе:</span>
        {!isEditing ? (
          <>
            <span>{note || 'Нет информации'}</span>
            <FontAwesomeIcon icon={faEdit} className="edit-icon" onClick={handleEditClick} />
          </>
        ) : (
          <div className="note-edit">
            <textarea 
              value={editedNote} 
              onChange={(e) => setEditedNote(e.target.value)}
            />
            <FontAwesomeIcon icon={faCheck} className="save-icon" onClick={handleSaveClick} />
          </div>
        )}
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  email: PropTypes.string.isRequired,
  note: PropTypes.string,
  onUpdateNote: PropTypes.func.isRequired,
};

export default UserInfo;
