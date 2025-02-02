import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/profile.css'; // Подключаем стили для профиля

const UserInfo = ({ email, note, onUpdateNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState(note);

  const handleSaveNote = () => {
    onUpdateNote(newNote);
    setIsEditing(false);
  };

  return (
    <div className="user-info">
      <p>Email: {email}</p>
      {isEditing ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSaveNote();
        }}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button type="submit">Сохранить</button>
          <button type="button" onClick={() => setIsEditing(false)}>Отмена</button>
        </form>
      ) : (
        <>
          <p>О себе: {note}</p>
          <button onClick={() => setIsEditing(true)}>Редактировать</button>
        </>
      )}
    </div>
  );
};

UserInfo.propTypes = {
  email: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  onUpdateNote: PropTypes.func.isRequired,
};

export default UserInfo;
