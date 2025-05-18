// components/ConfirmDialog.js
import 'react-confirm-alert/src/react-confirm-alert.css'; // Стиль по умолчанию
import { confirmAlert } from 'react-confirm-alert';
import '../styles/confirm.css';

export const showConfirm = ({ title, message, onConfirm, onCancel }) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className="custom-confirm-modal">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button onClick={() => { onClose(); onCancel?.(); }}>Отмена</button>
            <button className="confirm-btn" onClick={() => { onClose(); onConfirm(); }}>Да</button>
          </div>
        </div>
      );
    }
  });
};
