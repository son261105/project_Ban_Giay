const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_auth',
  waitForConnections: true, connectionLimit: 10,
});
// Bảng lưu yêu cầu quên mật khẩu
pool.query(`
  CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    otp_code VARCHAR(6) NULL,
    attempts INT NOT NULL DEFAULT 0,
    sent_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    reset_token VARCHAR(64) NULL,
    token_expires_at BIGINT NOT NULL DEFAULT 0
  ) CHARACTER SET utf8mb4
`).catch(err => console.error('Không tạo được bảng password_resets:', err.message));
module.exports = { pool };
