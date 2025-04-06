import React, { useState } from 'react';
import api from '../services/api';
import '../styles/uploadModal.css';

const UploadModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    bitrate: '',
    quality: '',
    duration: '',
    audioFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      audioFile: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      await api.post('/sounds/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Звук успешно загружен');
      onClose();
    } catch (error) {
      console.error('Ошибка при загрузке звука:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-content">
        <h3>Загрузить новый звук</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название:</label>
            <input type="text" name="title" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Категория:</label>
            <input type="text" name="category" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Теги:</label>
            <input type="text" name="tags" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Битрейт:</label>
            <input type="text" name="bitrate" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Качество:</label>
            <input type="text" name="quality" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Длительность (в секундах):</label>
            <input type="number" name="duration" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Аудиофайл:</label>
            <input type="file" accept="audio/*" onChange={handleFileChange} required />
          </div>
          <div className="modal-actions">
            <button type="submit">Загрузить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;