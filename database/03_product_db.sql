-- =============================================
-- DB_Product - Product Service Database
-- (Gộp: Product + Inventory + Category + Brand)
-- =============================================
CREATE DATABASE IF NOT EXISTS db_product CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_product;

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  brand_id INT,
  category_id INT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tồn kho riêng từng size
CREATE TABLE IF NOT EXISTS product_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(10) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Nhà cung cấp (Inventory)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phiếu nhập kho
CREATE TABLE IF NOT EXISTS import_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT,
  note TEXT,
  total_cost DECIMAL(12,2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Chi tiết phiếu nhập
CREATE TABLE IF NOT EXISTS import_receipt_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NOT NULL,
  product_id INT NOT NULL,
  size VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (receipt_id) REFERENCES import_receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO brands (name, logo_url) VALUES
('Nike', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png'),
('Adidas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1200px-Adidas_Logo.svg.png'),
('Puma', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Puma_logo.svg/1280px-Puma_logo.svg.png'),
('Converse', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/1280px-Converse_logo.svg.png'),
('Vans', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1280px-Vans-logo.svg.png');

INSERT INTO categories (name, slug) VALUES
('Sneaker', 'sneaker'),
('Chạy bộ', 'running'),
('Classic', 'classic'),
('Lifestyle', 'lifestyle'),
('Skate', 'skate');

INSERT INTO products (name, description, price, brand_id, category_id, image_url) VALUES
('Nike Air Max 270', 'Giày thể thao Nam phong cách hiện đại với đệm Air Max thoải mái', 2500000, 1, 1, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png'),
('Nike Air Force 1', 'Giày cổ điển biểu tượng, phù hợp mọi phong cách', 2200000, 1, 3, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/350f1bb8-d9a5-4168-b3c6-e3a22a87a54c/air-force-1-07-shoes-WrLlWX.png'),
('Adidas Ultraboost 22', 'Công nghệ Boost tối ưu cho chạy bộ hiệu suất cao', 3200000, 2, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg'),
('Adidas Stan Smith', 'Giày tennis cổ điển, thiết kế đơn giản tinh tế', 1800000, 2, 3, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7ed0855435194229a525aad6009a0497_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg'),
('Puma RS-X3', 'Thiết kế chunky retro pha lẫn công nghệ hiện đại', 1900000, 3, 4, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/380176/03/sv01/fnd/PNA/fmt/png/RS-X3-Twill-AirMesh-Sneakers'),
('Converse Chuck Taylor All Star', 'Giày canvas cổ điển vượt thời gian', 1200000, 4, 3, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa2af1a7a/images/a_107/M9160_A_107X1.jpg'),
('Vans Old Skool', 'Giày skate huyền thoại với sọc Side Stripe đặc trưng', 1400000, 5, 5, 'https://images.vans.com/is/image/Vans/VN000D3HY28-HERO?$SCALE-WITH-DPR$'),
('Nike React Infinity Run', 'Giày chạy bộ với đệm React mềm mại, hỗ trợ tối ưu', 2800000, 1, 2, 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-92cc2da2-5bc8-4cbb-9eed-57e5dee41c44/react-infinity-run-flyknit-3-road-running-shoes-1LhvMN.png'),
('Adidas NMD R1', 'Street style hiện đại với Boost cushioning', 2600000, 2, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/dda1a13b3de74dedb52eabb60126e01d_9366/NMD_R1_Shoes_Black_GZ9256_01_standard.jpg'),
('Puma Suede Classic XXI', 'Suede kinh điển đã tồn tại hơn 50 năm', 1600000, 3, 3, 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers');

-- Tồn kho theo size
INSERT INTO product_stock (product_id, size, quantity) VALUES
(1,'39',10),(1,'40',15),(1,'41',12),(1,'42',8),(1,'43',5),(1,'44',3),
(2,'38',7),(2,'39',12),(2,'40',10),(2,'41',9),(2,'42',6),(2,'43',4),
(3,'40',8),(3,'41',10),(3,'42',12),(3,'43',7),(3,'44',5),(3,'45',2),
(4,'37',5),(4,'38',8),(4,'39',10),(4,'40',15),(4,'41',12),(4,'42',9),(4,'43',6),
(5,'39',8),(5,'40',10),(5,'41',7),(5,'42',5),(5,'43',3),
(6,'36',5),(6,'37',8),(6,'38',10),(6,'39',15),(6,'40',20),(6,'41',12),(6,'42',8),(6,'43',5),(6,'44',3),
(7,'37',6),(7,'38',9),(7,'39',12),(7,'40',10),(7,'41',8),(7,'42',5),(7,'43',3),
(8,'39',7),(8,'40',10),(8,'41',9),(8,'42',8),(8,'43',6),(8,'44',4),
(9,'39',5),(9,'40',8),(9,'41',10),(9,'42',7),(9,'43',4),
(10,'38',8),(10,'39',10),(10,'40',12),(10,'41',9),(10,'42',6),(10,'43',4);

INSERT INTO suppliers (name, email, phone, address) VALUES
('Nike Vietnam Distribution', 'supply@nikevn.com', '02812345678', 'KCN Sóng Thần, Bình Dương'),
('Adidas SEA Import', 'import@adidassea.com', '02898765432', 'Quận 7, TP.HCM');
