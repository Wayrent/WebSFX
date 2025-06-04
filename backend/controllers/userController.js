const { query } = require('../models/userModel');

// Получение данных пользователя
const getUserData = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in token' });
  }
  try {
  const result = await query(
    'SELECT id, email, username, note, subscription_status, subscription_start, subscription_end, role FROM users WHERE id = $1',
    [userId]
  );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление заметки пользователя
const updateUserNote = async (req, res) => {
  const userId = req.user?.userId;
  const { note } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found in token' });
  }

  console.log('Updating note for user:', userId, 'with note:', note);
  try {
    await query('UPDATE users SET note = $1 WHERE id = $2', [note, userId]);
    res.status(200).json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating user note:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserData,
  updateUserNote
};