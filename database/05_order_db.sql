-- =============================================
-- DB_Order - Order Service Database
-- =============================================
CREATE DATABASE IF NOT EXISTS db_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_order;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_name VARCHAR(100),
  user_email VARCHAR(100),
  subtotal_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    voucher_code VARCHAR(255) DEFAULT NULL, 
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending','confirmed','shipping','delivered','cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  phone VARCHAR(20),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200),
  product_image VARCHAR(255),
  quantity INT NOT NULL,
  size VARCHAR(10),
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
