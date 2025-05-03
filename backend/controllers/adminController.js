const { query } = require('../models/userModel');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    // Запрос только существующих полей
    const result = await query(
      'SELECT id, username, email, role FROM users ORDER BY id ASC'
    );
    
    res.status(200).json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    const result = await query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role',
      [username, email, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user'
    });
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset password'
    });
  }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Сначала удаляем связанные записи (если есть)
      await query('BEGIN');
      
      // Удаляем из коллекций (пример для вашей структуры)
      await query('DELETE FROM collections WHERE user_id = $1', [id]);
      
      // Затем удаляем самого пользователя
      const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      await query('COMMIT');
      
      if (result.rowCount === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
  
      res.status(200).json({ 
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete user'
      });
    }
  };

module.exports = {
  getAllUsers,
  updateUser,
  resetPassword,
  deleteUser
};