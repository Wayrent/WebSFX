import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import '../styles/adminUsers.css';
import { toast } from 'react-toastify';
import { showConfirm } from '../components/ConfirmDialog'; // ← добавлено

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get('/admin/users');
        
        if (response.data?.success) {
          setUsers(response.data.data);
        } else {
          setError(response.data?.error || 'Не удалось загрузить пользователей');
        }
      } catch (err) {
        console.error('Не удалось произвести фетч пользователей:', err);
        setError(err.response?.data?.error || 'Ошибка сервера');
        
        if (err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDeleteUser = (userId, username) => {
    showConfirm({
      title: 'Удаление пользователя',
      message: `Вы уверены, что хотите удалить пользователя ${username}?`,
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/users/${userId}`);
          if (response.data.success) {
            setUsers(users.filter(user => user.id !== userId));
          }
        } catch (err) {
          setError(err.response?.data?.error || 'Не удалось удалить пользователя');
        }
      }
    });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      username: user.username,
      email: user.email
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, editData);
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...editData } : user
        ));
        setEditingId(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Обновление не удалось');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const resetPassword = (userId) => {
    showConfirm({
      title: 'Сброс пароля',
      message: 'Сбросить пароль на "password123"?',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${userId}/reset-password`);
          toast.success('Пароль сброшен успешно');
        } catch (err) {
          setError(err.response?.data?.error || 'Не удалось сбросить пароль');
        }
      }
    });
  };

  if (loading) return <div className="loading">Загрузка пользователей...</div>;

  return (
    <div className="admin-users-container">
      <h2>Управление пользователями</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            {editingId === user.id ? (
              <>
                <div className="form-group">
                  <label>Имя пользователя:</label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleSave(user.id)}
                    className="save-btn"
                  >
                    <FontAwesomeIcon icon={faSave} /> Сохранить
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="cancel-btn"
                  >
                    <FontAwesomeIcon icon={faTimes} /> Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                    className="delete-user-btn"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    title="Удалить пользователя"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="user-info">
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Имя пользователя:</strong> {user.username}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Роль:</strong> {user.role}</div>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="edit-btn"
                  >
                    <FontAwesomeIcon icon={faEdit} /> Редактировать
                  </button>
                  <button 
                    onClick={() => resetPassword(user.id)}
                    className="reset-btn"
                  >
                    Сбросить пароль
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
