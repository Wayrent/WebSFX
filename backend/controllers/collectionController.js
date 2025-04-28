const { query } = require('../models/collectionModel');

const getCollections = async (req, res) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'User ID not found in token' 
    });
  }

  try {
    const result = await query('SELECT * FROM collections WHERE user_id = $1', [userId]);
    
    if (!result) {
      return res.status(500).json({ 
        success: false,
        error: 'Database query returned no result' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ 
      success: false,
      error: 'Database operation failed',
      details: error.message
    });
  }
};

const createCollection = async (req, res) => {
  const { name } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'User ID not found' 
    });
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid collection name' 
    });
  }

  try {
    const result = await query(
      'INSERT INTO collections (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create collection',
      details: error.message
    });
  }
};

const addSoundToCollection = async (req, res) => {
  const { collectionId, soundId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  try {
    // Проверяем принадлежность коллекции пользователю
    const collectionCheck = await query(
      'SELECT 1 FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, userId]
    );

    if (collectionCheck.rowCount === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'Collection not found or access denied' 
      });
    }

    // Проверяем существование звука
    const soundCheck = await query(
      'SELECT 1 FROM sounds WHERE id = $1',
      [soundId]
    );

    if (soundCheck.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Sound not found' 
      });
    }

    const result = await query(
      'INSERT INTO collection_sounds (collection_id, sound_id) VALUES ($1, $2) RETURNING *',
      [collectionId, soundId]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding sound:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false,
        error: 'Sound already exists in this collection' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to add sound to collection',
      details: error.message
    });
  }
};

const getSoundsInCollection = async (req, res) => {
  const { collectionId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  try {
    // Проверяем, принадлежит ли коллекция пользователю
    const collectionCheck = await query(
      'SELECT 1 FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, userId]
    );

    if (collectionCheck.rowCount === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have access to this collection' 
      });
    }

    const result = await query(
      `SELECT s.* FROM sounds s
       JOIN collection_sounds cs ON s.id = cs.sound_id
       WHERE cs.collection_id = $1`,
      [collectionId]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching sounds:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch sounds',
      details: error.message
    });
  }
};

const deleteCollection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'User ID not found' 
    });
  }

  try {
    // Используем транзакцию для удаления связанных записей
    await query('BEGIN');
    
    // Удаляем связи звуков с коллекцией
    await query(
      'DELETE FROM collection_sounds WHERE collection_id = $1',
      [id]
    );
    
    // Удаляем саму коллекцию
    const result = await query(
      'DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    await query('COMMIT');
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Collection not found or already deleted' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Collection deleted successfully' 
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error deleting collection:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete collection',
      details: error.message
    });
  }
};

const removeSoundFromCollection = async (req, res) => {
  const { collectionId, soundId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  try {
    // Проверяем принадлежность коллекции пользователю
    const collectionCheck = await query(
      'SELECT 1 FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, userId]
    );

    if (collectionCheck.rowCount === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'Collection not found or access denied' 
      });
    }

    const result = await query(
      'DELETE FROM collection_sounds WHERE collection_id = $1 AND sound_id = $2 RETURNING *',
      [collectionId, soundId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Sound not found in this collection' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Sound removed from collection' 
    });
  } catch (error) {
    console.error('Error removing sound:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove sound from collection',
      details: error.message
    });
  }
};


// Добавляем в экспорт
module.exports = {
  getCollections,
  createCollection,
  addSoundToCollection,
  getSoundsInCollection,
  deleteCollection,
  removeSoundFromCollection
};