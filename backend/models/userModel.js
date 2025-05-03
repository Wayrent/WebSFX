const { Pool } = require('pg');

// Конфигурация подключения
const pool = new Pool({
  user: process.env.DB_USER || 'new_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sound_bd',
  password: process.env.DB_PASSWORD || 'new_password',
  port: process.env.DB_PORT || 5432,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
  process.exit(-1);
});

// Функция для выполнения запросов
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
};

module.exports = {
  query,
  pool
};


// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'new_user',
//   host: 'localhost',
//   database: 'sound_bd',
//   password: 'new_password',
//   port: 5432,
// });

// // Функция для выполнения запросов
// const query = (text, params) => pool.query(text, params);

// module.exports = {
//   query,
// };