// soundController.js
const { query } = require('../models/soundModel');
const multer = require('multer');
const path = require('path');

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Папка для сохранения файлов
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Уникальное имя файла
  },
});

// Фильтр для разрешенных MIME-типов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mp3', 'audio/wav'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Недопустимый тип файла'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение до 10 МБ
  fileFilter: fileFilter,
});

// Метод для загрузки звука
const uploadSound = async (req, res) => {
  try {
    const { title, category, tags, bitrate, quality, duration } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Файл не найден' });
    }

    const result = await query(
      'INSERT INTO sounds (title, category, tags, bitrate, quality, duration, url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, category, tags, bitrate, quality, duration, file.path]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading sound:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Получение списка звуков
const getSounds = async (req, res) => {
  try {
    console.log('Received request to get sounds'); // Отладочное сообщение
    const result = await query('SELECT * FROM sounds');
    console.log('Data fetched from database:', result.rows); // Отладочное сообщение
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No sounds found' });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching data from database:', error.message, error.stack); // Отладочное сообщение
    res.status(500).json({ error: error.message });
  }
};

// Получение коллекций для звука
const getSoundCollections = async (req, res) => {
  const { soundId } = req.params;

  try {
    const result = await query(
      'SELECT c.id FROM collections c JOIN collection_sounds cs ON c.id = cs.collection_id WHERE cs.sound_id = $1',
      [soundId]
    );
    res.status(200).json(result.rows.map((collection) => collection.id));
  } catch (error) {
    console.error('Error fetching sound collections:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Добавление звука в коллекцию
const addSoundToCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { sound_id } = req.body;

  try {
    // Проверяем, существует ли коллекция
    const collectionResult = await query('SELECT * FROM collections WHERE id = $1', [collectionId]);
    if (collectionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Коллекция не найдена' });
    }

    // Проверяем, уже добавлен ли звук в коллекцию
    const existingRelation = await query(
      'SELECT * FROM collection_sounds WHERE collection_id = $1 AND sound_id = $2',
      [collectionId, sound_id]
    );
    if (existingRelation.rowCount > 0) {
      return res.status(400).json({ error: 'Звук уже добавлен в коллекцию' });
    }

    // Добавляем звук в коллекцию
    await query(
      'INSERT INTO collection_sounds (collection_id, sound_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [collectionId, sound_id]
    );

    res.status(200).json({ message: 'Звук успешно добавлен в коллекцию' });
  } catch (error) {
    console.error('Error adding sound to collection:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// Удаление звука из коллекции
const removeSoundFromCollection = async (req, res) => {
  const { collectionId, soundId } = req.params;

  try {
    // Проверяем, существует ли коллекция
    const collectionResult = await query('SELECT * FROM collections WHERE id = $1', [collectionId]);
    if (collectionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Коллекция не найдена' });
    }

    // Удаляем звук из коллекции
    const deleteResult = await query(
      'DELETE FROM collection_sounds WHERE collection_id = $1 AND sound_id = $2',
      [collectionId, soundId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Звук не найден в коллекции' });
    }

    res.status(200).json({ message: 'Звук успешно удален из коллекции' });
  } catch (error) {
    console.error('Error removing sound from collection:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// soundController.js
module.exports = {
  getSounds,
  getSoundCollections,
  addSoundToCollection,
  removeSoundFromCollection,
  uploadSound, // Добавляем новый метод
  upload, // Экспортируем upload
};