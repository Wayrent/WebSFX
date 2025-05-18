import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSound } from '../services/api';
import '../styles/upload.css';
import { toast } from 'react-toastify';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    bitrate: '192 kbps',
    quality: 'high',
    file: null
  });
  const [status, setStatus] = useState({ loading: false });
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    try {
      const result = await uploadSound(data);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Звук успешно загружен!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      toast.error(err.message || 'Не удалось загрузить звук');
    } finally {
      setStatus({ loading: false });
    }
  };

  return (
    <div className="upload-container">
      <h2>Загрузка звука</h2>

      <form onSubmit={handleSubmit}>
        <label className="file-upload-label">
          Файл звука (MP3/WAV):
          <div className="custom-file-input">
            <input
              type="file"
              name="file"
              accept=".mp3,.wav,audio/*"
              onChange={handleFileChange}
              required
            />
            <span>{formData.file?.name || 'Выбрать файл'}</span>
          </div>
        </label>

        <label>
          Название:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Категория:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Теги (через запятую):
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </label>

        <label>
          Качество:
          <select
            name="quality"
            value={formData.quality}
            onChange={handleChange}
          >
            <option value="low">Низкое</option>
            <option value="medium">Среднее</option>
            <option value="high">Высокое</option>
          </select>
        </label>

        <button type="submit" disabled={status.loading}>
          {status.loading ? 'Загрузка...' : 'Загрузить звук'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
