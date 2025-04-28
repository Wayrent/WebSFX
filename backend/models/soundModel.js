const { Pool } = require('pg');

const pool = new Pool({
  user: 'new_user',
  host: 'localhost',
  database: 'sound_bd',
  password: 'new_password',
  port: 5432,
});

// Проверка подключения при старте
pool.query('SELECT NOW()')
  .then(() => console.log('Подключение к PostgreSQL успешно'))
  .catch(err => console.error('Ошибка подключения к PostgreSQL:', err));

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};