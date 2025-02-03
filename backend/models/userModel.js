// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'new_user',               // Имя нового пользователя базы данных
//   host: 'localhost',              // Хост базы данных
//   database: 'sound_bd',       // Имя новой базы данных
//   password: 'new_password',       // Пароль нового пользователя базы данных
//   port: 5432,                     // Порт, на котором работает PostgreSQL
// });

// const query = (text, params) => pool.query(text, params);

// module.exports = {
//   query,
// };


const { Pool } = require('pg');

const pool = new Pool({
  user: 'new_user',               // Имя нового пользователя базы данных
  host: 'localhost',              // Хост базы данных
  database: 'sound_bd',       // Имя новой базы данных
  password: 'new_password',       // Пароль нового пользователя базы данных
  port: 5432,                     // Порт, на котором работает PostgreSQL
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
};


