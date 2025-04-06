// Upload.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('tags', tags);

      await api.uploadSound(formData);
      setSuccessMessage('Звук успешно загружен!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/');
      }, 2000);
    } catch (error) {
      setError('Произошла ошибка при загрузке звука.');
      console.error('Ошибка при загрузке звука:', error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Загрузить звук</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Файл:
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>
        <label>
          Название:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Категория:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </label>
        <label>
          Теги (через запятую):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
          />
        </label>
        <button type="submit">Загрузить</button>
      </form>
    </div>
  );
};

export default Upload;