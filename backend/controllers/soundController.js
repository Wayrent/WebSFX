const { query } = require('../models/soundModel');

const getSounds = async (req, res) => {
  try {
    console.log('Received request to get sounds'); // Отладочное сообщение
    const result = await query('SELECT * FROM sounds');
    console.log('Data fetched from database:', result.rows); // Отладочное сообщение
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching data from database:', error); // Отладочное сообщение
    res.status(500).json({ error: error.message });
  }
};

const addFavorite = async (req, res) => {
  const { sound_id } = req.query;
  // Логика для добавления в избранное
  res.status(200).json({ message: 'Added to favorites' });
};

const downloadSound = async (req, res) => {
  const { sound_id } = req.query;
  // Логика для скачивания звука
  res.status(200).json({ message: 'Download link generated' });
};

module.exports = {
  getSounds,
  addFavorite,
  downloadSound,
};
