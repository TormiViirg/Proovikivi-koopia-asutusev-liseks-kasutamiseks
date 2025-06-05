const mysql = require('mysql2/promise');
const dbInfo = require('../proovikiviconfig.js');

const pool = mysql.createPool({
  host: dbInfo.configData.host,
  user: dbInfo.configData.user,
  password: dbInfo.configData.password,
  database: dbInfo.configData.database,
  connectionLimit: 5
});

module.exports = { pool };
