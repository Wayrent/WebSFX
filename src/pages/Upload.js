import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSound } from '../services/api';
import '../styles/upload.css';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    bitrate: '192 kbps',
    quality: 'high',
    duration: '',
    file: null
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

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

      setStatus({ loading: false, error: '', success: true });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus({
        loading: false,
        error: err.message || 'Upload failed',
        success: false
      });
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Sound</h2>
      {status.error && <div className="error">{status.error}</div>}
      {status.success && <div className="success">Sound uploaded successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <label>
          Sound File (MP3/WAV):
          <input
            type="file"
            name="file"
            accept=".mp3,.wav,audio/*"
            onChange={handleFileChange}
            required
          />
        </label>
        
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Category:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Tags (comma separated):
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </label>

        <label>
          Bitrate:
          <select
            name="bitrate"
            value={formData.bitrate}
            onChange={handleChange}
          >
            <option value="128 kbps">128 kbps</option>
            <option value="192 kbps">192 kbps</option>
            <option value="256 kbps">256 kbps</option>
            <option value="320 kbps">320 kbps</option>
          </select>
        </label>

        <label>
          Quality:
          <select
            name="quality"
            value={formData.quality}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          Duration (seconds):
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </label>
        
        <button type="submit" disabled={status.loading}>
          {status.loading ? 'Uploading...' : 'Upload Sound'}
        </button>
      </form>
    </div>
  );
};

export default Upload;