import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import api from '../services/api';

const AdminSubscriptionModal = ({ user, onClose, onUpdated }) => {
  const [status, setStatus] = useState(user.subscription_status || 'inactive');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/admin/users/${user.id}/subscription`, {
        status
    });

      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      console.error('Ошибка обновления подписки:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h3>Статус подписки: {user.username}</h3>
      <div>
        <label>Подписка:</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="inactive">Отключена</option>
          <option value="active">Активна</option>
        </select>
      </div>
      <p>Начало: {user.subscription_start || '—'}</p>
      <p>Окончание: {user.subscription_end || '—'}</p>
      <button onClick={handleSave} disabled={loading}>
        Сохранить
      </button>
    </Modal>
  );
};

export default AdminSubscriptionModal;
