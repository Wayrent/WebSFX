const { Pool } = require('pg');

const pool = new Pool({
  user: 'new_user',
  host: 'localhost',
  database: 'sound_bd',
  password: 'new_password',
  port: 5432,
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
};
