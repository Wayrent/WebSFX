const { query } = require('../models/userModel');

const getUserData = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await query('SELECT email, note FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserNote = async (req, res) => {
  const userId = req.user.userId;
  const { note } = req.body;
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
  updateUserNote,
};
