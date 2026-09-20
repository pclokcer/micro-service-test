const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'user_admin',
  password: process.env.DB_PASSWORD || 'user_pass',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'user_db'
});

const initDB = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../init.sql'), 'utf8');
    await pool.query(sql);
    console.log('User DB initialized successfully');
  } catch (error) {
    console.error('User DB initialization error:', error);
  }
};

module.exports = {
  pool,
  initDB
};
