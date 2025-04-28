import React, { useState } from 'react';
import { uploadSound } from '../services/api';
import '../styles/uploadModal.css';

const UploadModal = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState({
    title: '',
    category: '',
    tags: '',
    bitrate: '192 kbps',
    quality: 'high',
    duration: '',
    file: null
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setFormState(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      await uploadSound(formData);
      setStatus({ loading: false, error: null, success: true });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setStatus({
        loading: false,
        error: err.response?.data?.error || 'Upload failed',
        success: false
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Sound</h2>
        
        {status.error && (
          <div className="alert error">{status.error}</div>
        )}
        {status.success && (
          <div className="alert success">Sound uploaded successfully!</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              name="title"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category*</label>
            <input
              type="text"
              name="category"
              value={formState.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              name="tags"
              value={formState.tags}
              onChange={handleChange}
              placeholder="comma separated"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bitrate</label>
              <select
                name="bitrate"
                value={formState.bitrate}
                onChange={handleChange}
              >
                <option value="128 kbps">128 kbps</option>
                <option value="192 kbps">192 kbps</option>
                <option value="256 kbps">256 kbps</option>
                <option value="320 kbps">320 kbps</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quality</label>
              <select
                name="quality"
                value={formState.quality}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Duration (seconds)*</label>
            <input
              type="number"
              name="duration"
              value={formState.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Audio File* (MP3/WAV)</label>
            <input
              type="file"
              name="file"
              accept=".mp3,.wav,audio/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={status.loading}
            >
              {status.loading ? 'Uploading...' : 'Upload Sound'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;