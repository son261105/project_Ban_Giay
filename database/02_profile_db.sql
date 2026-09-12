-- =============================================
-- DB_Profile - Profile Service Database
-- =============================================
CREATE DATABASE IF NOT EXISTS db_profile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_profile;

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO profiles (user_id, name, phone, address) VALUES
(1, 'Admin', '0900000000', 'Hà Nội'),
(2, 'Nguyen Van A', '0911111111', 'TP.HCM');
