CREATE DATABASE IF NOT EXISTS voucher_db;
USE voucher_db;

CREATE TABLE vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('percent', 'freeship') NOT NULL,
  value DECIMAL(10,2) DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vouchers (code, type, value, min_order_amount, max_uses, start_date, end_date, description) VALUES
('FREESHIP', 'freeship', 0, 300000, NULL, '2026-01-01', '2026-12-31', 'Miễn phí vận chuyển cho đơn từ 300.000đ'),
('GIAM10', 'percent', 10, 500000, 100, '2026-01-01', '2026-12-31', 'Giảm 10% cho đơn từ 500.000đ');