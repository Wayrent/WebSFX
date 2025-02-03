const { query } = require('../models/collectionModel');

const getCollections = async (req, res) => {
  const userId = req.user.userId;
  console.log('Fetching collections for user:', userId);
  try {
    const result = await query('SELECT * FROM collections WHERE user_id = $1', [userId]);
    console.log('Fetched collections:', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: error.message });
  }
};

const createCollection = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;
  console.log('Creating collection for user:', userId, 'with name:', name);
  try {
    const result = await query('INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
    console.log('Collection created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: error.message });
  }
};

const addSoundToCollection = async (req, res) => {
  const { collectionId, soundId } = req.body;
  try {
    const result = await query('INSERT INTO collection_sounds (collection_id, sound_id) VALUES ($1, $2) RETURNING *', [collectionId, soundId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding sound to collection:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSoundsInCollection = async (req, res) => {
  const { collectionId } = req.params;
  try {
    const result = await query(`
      SELECT sounds.*
      FROM sounds
      JOIN collection_sounds ON sounds.id = collection_sounds.sound_id
      WHERE collection_sounds.collection_id = $1
    `, [collectionId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching sounds in collection:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCollection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  console.log('Deleting collection with id:', id, 'for user:', userId);
  try {
    await query('DELETE FROM collections WHERE id = $1 AND user_id = $2', [id, userId]);
    res.status(200).json({ message: 'Коллекция успешно удалена' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCollections,
  createCollection,
  addSoundToCollection,
  getSoundsInCollection,
  deleteCollection,
};
