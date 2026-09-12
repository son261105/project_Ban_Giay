-- =============================================
-- DB_Cart - Cart Service Database
-- =============================================
CREATE DATABASE IF NOT EXISTS db_cart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_cart;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200),
  product_price DECIMAL(10,2),
  product_image VARCHAR(255),
  brand_name VARCHAR(100),
  quantity INT NOT NULL DEFAULT 1,
  size VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_size (user_id, product_id, size)
);
