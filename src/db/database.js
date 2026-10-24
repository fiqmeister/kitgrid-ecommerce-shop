const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true, //if all connections are busy, other queries wait in line
  connectionLimit: 10,
  queueLimit: 0 //infinite number of queries can wait in line
});

module.exports = pool;