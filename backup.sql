CREATE DATABASE  IF NOT EXISTS `db_order` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_order`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_order
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `size` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,3,'Adidas Ultraboost 22','https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',1,'44',3200000.00),(2,2,1,'Nike Air Max 270','https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',2,'44',2500000.00),(3,3,1,'Nike Air Max 270','https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',1,'41',2500000.00),(4,4,1,'Nike Air Max 270','https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',1,'40',2500000.00),(5,4,1,'Nike Air Max 270','https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',1,'42',2500000.00),(6,4,3,'Adidas Ultraboost 22','https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',1,'41',3200000.00),(7,5,10,'Puma Suede Classic XXI','https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',1,'40',1600000.00),(8,6,6,'Converse Chuck Taylor All Star','https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa2af1a7a/images/a_107/M9160_A_107X1.jpg',1,'39',1200000.00),(9,7,5,'Puma RS-X3','https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/380176/03/sv01/fnd/PNA/fmt/png/RS-X3-Twill-AirMesh-Sneakers',1,'42',1900000.00),(10,8,1,'Nike Air Max 270','https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',2,'39',2500000.00),(11,8,3,'Adidas Ultraboost 22','https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',1,'40',3200000.00),(12,9,10,'Puma Suede Classic XXI','https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',1,'41',1600000.00),(13,10,12,'conver1970s','https://cf.shopee.vn/file/b2e447c0d28af870aae68d0ce6f173db',3,'42',3000000.00),(14,11,11,'Puma Serve Pro','https://cdn.vuahanghieu.com/unsafe/0x900/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/product/2022/11/giay-the-thao-puma-serve-pro-wide-mau-trang-size-40-638706127ba7a-30112022142818.jpg',2,'37',2000000.00),(15,11,12,'conver1970s','https://cf.shopee.vn/file/b2e447c0d28af870aae68d0ce6f173db',2,'42',3000000.00),(16,12,11,'Puma Serve Pro','https://cdn.vuahanghieu.com/unsafe/0x900/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/product/2022/11/giay-the-thao-puma-serve-pro-wide-mau-trang-size-40-638706127ba7a-30112022142818.jpg',2,'37',2000000.00),(17,12,12,'conver1970s','https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',2,'41',3000000.00),(18,13,3,'Adidas Ultraboost 22','https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',1,'41',3200000.00),(19,14,13,'Nike AF1','https://thfvnext.bing.com/th/id/OIP.rxwVxtaWWZ2bgy1kaotAYgHaHa?w=183&h=184&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',1,'35',2000000.00),(20,15,13,'Nike AF1','https://thfvnext.bing.com/th/id/OIP.rxwVxtaWWZ2bgy1kaotAYgHaHa?w=183&h=184&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',2,'36',2000000.00),(21,16,13,'Nike AF1','https://thfvnext.bing.com/th/id/OIP.rxwVxtaWWZ2bgy1kaotAYgHaHa?w=183&h=184&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',3,'36',2000000.00),(22,17,13,'Nike AF1','https://thfvnext.bing.com/th/id/OIP.rxwVxtaWWZ2bgy1kaotAYgHaHa?w=183&h=184&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',2,'36',2000000.00),(23,18,12,'conver1970s','https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',1,'35',3000000.00),(24,19,12,'conver1970s','https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3',1,'35',3000000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` enum('pending','confirmed','shipping','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,18,'pending','2026-09-16 03:53:14'),(2,19,'pending','2026-09-16 03:54:32'),(3,18,'confirmed','2026-09-16 03:54:48'),(4,19,'cancelled','2026-09-16 03:55:24');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `voucher_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipping','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,4,'','abc@gmail.com',0.00,0.00,NULL,3200000.00,'delivered','hanoi','035395036','abcd','2026-06-05 02:31:32','2026-06-10 04:38:21'),(2,4,'','abc@gmail.com',0.00,0.00,NULL,5000000.00,'delivered','SN12,ĐƯỜNG LÊ TRỌNG TẤN,HÀ ĐÔNG,HÀ NỘI','0353950356','GIAO TẬN CỬA','2026-06-05 03:58:55','2026-06-10 04:38:18'),(3,4,'','abc@gmail.com',0.00,0.00,NULL,2500000.00,'delivered','SN12,Ha Dong ,HaNoi','0353950356','giao tan cua ','2026-06-10 04:38:02','2026-06-10 04:55:59'),(4,4,'','abc@gmail.com',0.00,0.00,NULL,8200000.00,'confirmed','HaNoi','0353950356','','2026-06-18 07:07:43','2026-06-18 07:08:01'),(5,4,'','abc@gmail.com',0.00,0.00,NULL,1600000.00,'confirmed','HaNoi','0353950356','','2026-06-18 07:08:40','2026-06-19 04:40:47'),(6,4,'','abc@gmail.com',0.00,0.00,NULL,1200000.00,'confirmed','HaNoi','0353950356','','2026-06-18 07:09:04','2026-06-19 04:40:42'),(7,4,'','abc@gmail.com',0.00,0.00,NULL,1900000.00,'confirmed','HaNoi','0353950356','','2026-06-18 07:09:26','2026-06-19 04:40:41'),(8,4,'','abc@gmail.com',0.00,0.00,NULL,8200000.00,'confirmed','Ha Noi ,Yen Nghia','0353950356','giao tận cửa','2026-06-19 04:40:01','2026-06-19 04:40:36'),(9,4,'','abc@gmail.com',0.00,0.00,NULL,1600000.00,'confirmed','HaNoi, văn quán , số nhà 19','0353950356','giao tận của ','2026-06-19 04:41:29','2026-06-19 05:43:40'),(10,4,'','abc@gmail.com',0.00,0.00,NULL,9000000.00,'confirmed','Sn19 , Phường Văn Quán , Quận Hà Nội','0353950356','giao tận cửa','2026-06-28 05:47:54','2026-06-30 15:09:34'),(11,4,'','abc@gmail.com',0.00,0.00,NULL,10000000.00,'confirmed','SN19, yên nghĩa , hà Đông','0353950356','abc','2026-06-30 15:08:56','2026-06-30 15:09:29'),(12,4,'','abc@gmail.com',0.00,0.00,NULL,10000000.00,'confirmed','SN19,dương nội , ha dong ha noi','0353950356','giao tận cửa','2026-06-30 16:45:04','2026-06-30 16:45:49'),(13,3,'','son261105@gmail.com',3200000.00,35000.00,'FREESHIP',3200000.00,'delivered','khu đô thị yên nghĩa số nhà 5A, Phường Yên Nghĩa, Thành phố Hà Nội','0353950356','abc','2026-09-12 10:32:54','2026-09-12 10:37:52'),(14,4,'','abc@gmail.com',2000000.00,0.00,NULL,2035000.00,'cancelled','số nhà 5B khu đô thị đô nghĩa, Phường Yên Nghĩa, Thành phố Hà Nội','0353950356','abc','2026-09-12 10:54:50','2026-09-12 11:05:48'),(15,4,'','abc@gmail.com',4000000.00,35000.00,'FREESHIP',4000000.00,'cancelled','số nhà 5A, Phường Dương Nội, Thành phố Hà Nội','0353950356','giao tận cửa','2026-09-12 11:14:41','2026-09-12 11:14:55'),(16,4,'','abc@gmail.com',6000000.00,0.00,NULL,6035000.00,'cancelled','nhà 5a, Phường Dương Nội, Thành phố Hà Nội','0353950356','1','2026-09-12 11:19:12','2026-09-12 11:19:17'),(17,7,'','truongdinhthuy00@gmail.com',4000000.00,0.00,NULL,4035000.00,'cancelled','số nhà 5A khu đô thị đô nghĩa, Phường Yên Nghĩa, Thành phố Hà Nội','0969628746','abc','2026-09-16 03:27:36','2026-09-16 03:30:05'),(18,7,'','truongdinhthuy00@gmail.com',3000000.00,0.00,NULL,3035000.00,'confirmed','số nhà 5A , khu đô thị đô nghĩa, Phường Yên Nghĩa, Thành phố Hà Nội','0969628746','để hàng vào trong nhà ','2026-09-16 03:53:14','2026-09-16 03:54:48'),(19,7,'','truongdinhthuy00@gmail.com',3000000.00,35000.00,'FREESHIP',3000000.00,'cancelled','Số nhà 5B khu đô thị đô nghĩa, Phường Yên Nghĩa, Thành phố Hà Nội','0969628746','để hàng vào trong nhà ','2026-09-16 03:54:32','2026-09-16 03:55:24');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:36
CREATE DATABASE  IF NOT EXISTS `db_cart` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_cart`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_cart
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_product_size` (`user_id`,`product_id`,`size`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (38,8,12,'conver1970s',3000000.00,'https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3','Converse',1,'41','2026-09-14 09:41:38','2026-09-14 09:41:38'),(42,3,12,'conver1970s',3000000.00,'https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3','Converse',1,'35','2026-09-16 06:46:33','2026-09-16 06:46:33');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:36
CREATE DATABASE  IF NOT EXISTS `voucher_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `voucher_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: voucher_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `type` enum('percent','freeship') NOT NULL,
  `value` decimal(10,2) DEFAULT '0.00',
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `max_uses` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (8,'FREESHIP','freeship',0.00,2000000.00,NULL,1,'2026-09-16','2026-09-30',1,'Free ship cho đơn hàng từ 3 triệu ','2026-09-16 03:47:51');
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:36
CREATE DATABASE  IF NOT EXISTS `db_auth` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_auth`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_auth
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
INSERT INTO `otp_verifications` VALUES (5,'Trương Đình Sơn','son012308123@gmail.com','0986181225','$2a$10$vNBXukyMGqWDK.d82IJ98ubuGr0qnZohnC/Yg/5MORvLsCkDvgzbm','441306','2026-09-14 23:31:32','2026-09-14 16:26:32');
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `status` enum('active','locked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'Truong Dinh Son','0353950356','son261105@gmail.com','$2a$10$.lqiu2KSGULvlUU0s1PU8uqV3.91YNJ5VA5huHDZB2SuX4vWwHXdW','admin','active','2026-06-05 02:17:18','2026-09-16 03:07:36'),(7,'Hoàng anh','0969628746','truongdinhthuy00@gmail.com','$2a$10$d00aWANNtMWaNbyb6hsuv.zkX7bN4pDlpfHYMW.p4gXBY38LmoBCi','user','active','2026-09-14 09:38:32','2026-09-16 04:19:00'),(9,'son dinh','0961812254','son13042006@gmail.com','$2a$10$r7owqiM.1bYhn6kueFwbieIXxCTIMiz6BkjpFh8Yl2AJBWmsrjgby','user','active','2026-09-14 09:56:55','2026-09-16 04:18:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:37
CREATE DATABASE  IF NOT EXISTS `db_product` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_product`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_product
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Nike','https://th.bing.com/th?q=Black+White+Nike+Logo&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.3&pid=InlineBlock&rm=3&mkt=en-WW&cc=VN&setlang=vi&adlt=moderate&t=1&mw=247','2026-06-05 01:50:04'),(2,'Adidas','https://th.bing.com/th/id/OIP.tJ2FVrIB0dY7xHgMxHIHigHaHa?w=168&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2026-06-05 01:50:04'),(3,'Puma','https://th.bing.com/th/id/OIP.su2b4F_Y_OHRWLHLdCxtlQHaE8?w=252&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2026-06-05 01:50:04'),(4,'Converse','https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/1280px-Converse_logo.svg.png','2026-06-05 01:50:04'),(5,'Vans','https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1280px-Vans-logo.svg.png','2026-06-05 01:50:04');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Sneaker','sneaker','Giày thể thao đa năng với thiết kế hiện đại, phù hợp cho nhiều hoạt động','2026-06-05 01:50:06'),(3,'Classic','classic','Các mẫu giày mang phong cách cổ điển, thiết kế đơn giản và vượt thời gian.','2026-06-05 01:50:06'),(4,'Lifestyle','lifestyle','Giày thời trang dành cho sinh hoạt hằng ngày, kết hợp giữa sự thoải mái','2026-06-05 01:50:06'),(5,'Skate','skate','Giày chuyên dụng cho bộ môn trượt ván, có độ bền và độ bám cao.','2026-06-05 01:50:06'),(8,'Sandal','sandal','Các loại dép và sandal thoáng mát, phù hợp cho thời tiết nóng và hoạt động ngoài trời.','2026-06-05 03:53:44');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_receipt_items`
--

DROP TABLE IF EXISTS `import_receipt_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_receipt_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_id` int NOT NULL,
  `product_id` int NOT NULL,
  `size` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `receipt_id` (`receipt_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `import_receipt_items_ibfk_1` FOREIGN KEY (`receipt_id`) REFERENCES `import_receipts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `import_receipt_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_receipt_items`
--

LOCK TABLES `import_receipt_items` WRITE;
/*!40000 ALTER TABLE `import_receipt_items` DISABLE KEYS */;
INSERT INTO `import_receipt_items` VALUES (1,1,1,'41',100,200.00),(2,2,1,'35',10,20000000.00),(3,3,1,'45',5,10000000.00),(4,4,11,'35',10,20000000.00),(5,4,11,'36',10,20000000.00),(6,4,11,'37',10,20000000.00),(7,4,11,'38',10,20000000.00),(8,4,11,'39',10,20000000.00),(9,4,11,'40',10,20000000.00),(10,4,11,'41',10,20000000.00),(11,5,11,'43',10,2000000.00),(12,6,11,'43',5,2000000.00),(13,7,11,'44',5,2000000.00),(14,7,11,'45',5,2000000.00),(15,8,11,'45',5,2000000.00),(16,9,11,'46',20,2000000.00),(17,10,11,'42',10,200000.00),(18,11,1,'44',10,1000000.00),(19,12,3,'45',10,1000000.00),(20,13,5,'43',10,1000000.00),(21,13,5,'43',5,1000000.00),(22,14,6,'44',10,1000000.00),(23,15,5,'42',10,1000000.00),(24,16,10,'43',10,1000000.00),(25,17,3,'44',10,1000000.00),(26,18,6,'36',10,1000000.00),(27,18,6,'43',10,1000000.00),(28,19,12,'41',10,3000000.00),(29,19,12,'42',10,3000000.00),(30,19,12,'43',10,3000000.00),(31,19,12,'44',10,3000000.00),(32,20,12,'35',5,2000000.00),(33,21,13,'40',5,2000000.00),(34,21,13,'41',5,2000000.00),(35,22,13,'41',2,2000000.00),(36,22,13,'42',2,2000000.00),(37,23,13,'35',2,1500000.00),(38,23,13,'39',2,3000000.00),(39,24,13,'36',10,2000000.00);
/*!40000 ALTER TABLE `import_receipt_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_receipts`
--

DROP TABLE IF EXISTS `import_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `total_cost` decimal(12,2) DEFAULT '0.00',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `import_receipts_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_receipts`
--

LOCK TABLES `import_receipts` WRITE;
/*!40000 ALTER TABLE `import_receipts` DISABLE KEYS */;
INSERT INTO `import_receipts` VALUES (1,3,'abc',20000.00,3,'2026-06-05 02:21:19'),(2,1,'abcd',200000000.00,3,'2026-06-05 03:08:42'),(3,1,'',50000000.00,3,'2026-06-10 04:40:34'),(4,3,'abcd',1400000000.00,3,'2026-06-19 04:10:30'),(5,3,'abcd',20000000.00,3,'2026-06-19 04:15:48'),(6,3,'abcd',10000000.00,3,'2026-06-19 04:16:16'),(7,NULL,'',20000000.00,3,'2026-06-19 04:16:43'),(8,3,'abcd',10000000.00,3,'2026-06-19 04:17:15'),(9,NULL,'abcd',40000000.00,3,'2026-06-19 04:17:35'),(10,3,'abcd',2000000.00,3,'2026-06-19 04:18:32'),(11,1,'abcd',10000000.00,3,'2026-06-19 04:19:13'),(12,2,'abcd',10000000.00,3,'2026-06-19 04:20:02'),(13,3,'abcd',15000000.00,3,'2026-06-19 04:21:03'),(14,5,'',10000000.00,3,'2026-06-19 04:21:33'),(15,3,'',10000000.00,3,'2026-06-19 04:21:57'),(16,3,'',10000000.00,3,'2026-06-19 04:22:21'),(17,2,'',10000000.00,3,'2026-06-19 04:22:40'),(18,5,'abcdd',20000000.00,3,'2026-06-19 04:23:42'),(19,5,'abcd',120000000.00,3,'2026-06-19 04:29:10'),(20,3,'abc',10000000.00,3,'2026-06-30 14:58:46'),(21,1,'abc',20000000.00,3,'2026-06-30 16:41:28'),(22,NULL,'',8000000.00,3,'2026-07-03 06:39:44'),(23,1,'abc',9000000.00,3,'2026-07-03 06:41:08'),(24,1,'abc',20000000.00,3,'2026-09-12 09:45:29');
/*!40000 ALTER TABLE `import_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (25,13,'http://localhost:5003/uploads/1789722589020-706370190.jpg',0,'2026-09-18 09:13:05'),(26,13,'http://localhost:5003/uploads/1789722593697-965800841.webp',1,'2026-09-18 09:13:05'),(27,13,'http://localhost:5003/uploads/1789722593698-587210516.webp',2,'2026-09-18 09:13:05'),(28,13,'http://localhost:5003/uploads/1789722593699-773212748.webp',3,'2026-09-18 09:13:05');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_stock`
--

DROP TABLE IF EXISTS `product_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_size` (`product_id`,`size`),
  CONSTRAINT `product_stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_stock`
--

LOCK TABLES `product_stock` WRITE;
/*!40000 ALTER TABLE `product_stock` DISABLE KEYS */;
INSERT INTO `product_stock` VALUES (193,1,'35',10),(194,1,'39',8),(195,1,'40',14),(196,1,'41',111),(197,1,'42',7),(198,1,'43',5),(199,1,'44',11),(200,1,'45',5),(201,3,'40',7),(202,3,'41',8),(203,3,'42',12),(204,3,'43',7),(205,3,'44',14),(206,3,'45',12),(207,4,'37',5),(208,4,'38',8),(209,4,'39',10),(210,4,'40',15),(211,4,'41',12),(212,4,'42',9),(213,4,'43',6),(214,5,'39',8),(215,5,'40',10),(216,5,'41',7),(217,5,'42',14),(218,5,'43',18),(219,6,'36',15),(220,6,'37',8),(221,6,'38',10),(222,6,'39',14),(223,6,'40',20),(224,6,'41',12),(225,6,'42',8),(226,6,'43',15),(227,6,'44',13),(228,10,'38',8),(229,10,'39',10),(230,10,'40',11),(231,10,'41',8),(232,10,'42',6),(233,10,'43',14),(234,11,'35',10),(235,11,'36',10),(236,11,'37',6),(237,11,'38',10),(238,11,'39',10),(239,11,'40',10),(240,11,'41',10),(241,11,'42',10),(242,11,'43',15),(243,11,'44',5),(244,11,'45',10),(245,11,'46',20),(246,12,'35',3),(247,12,'41',8),(248,12,'42',5),(249,12,'43',10),(250,12,'44',10),(380,13,'35',1),(381,13,'36',8),(382,13,'37',0),(383,13,'38',0),(384,13,'39',2),(385,13,'40',5),(386,13,'41',7),(387,13,'42',2),(388,13,'43',0),(389,13,'44',0),(390,13,'45',0),(391,13,'46',0);
/*!40000 ALTER TABLE `product_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `description_detail` longtext COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `brand_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Nike Air Max 270','Giày thể thao Nam phong cách hiện đại với đệm Air Max thoải mái',NULL,2500000.00,1,1,'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png','2026-06-05 01:50:10','2026-06-05 01:50:10'),(3,'Adidas Ultraboost 22','Công nghệ Boost tối ưu cho chạy bộ hiệu suất cao',NULL,3200000.00,2,4,'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg','2026-06-05 01:50:10','2026-06-10 05:03:13'),(4,'Adidas Stan Smith','Giày tennis cổ điển, thiết kế đơn giản tinh tế',NULL,1800000.00,2,3,'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7ed0855435194229a525aad6009a0497_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg','2026-06-05 01:50:10','2026-06-05 01:50:10'),(5,'Puma RS-X3','Thiết kế chunky retro pha lẫn công nghệ hiện đại',NULL,1900000.00,3,4,'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/380176/03/sv01/fnd/PNA/fmt/png/RS-X3-Twill-AirMesh-Sneakers','2026-06-05 01:50:10','2026-06-05 01:50:10'),(6,'Converse Chuck Taylor All Star','Giày canvas cổ điển vượt thời gian',NULL,1200000.00,4,3,'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa2af1a7a/images/a_107/M9160_A_107X1.jpg','2026-06-05 01:50:10','2026-06-05 01:50:10'),(10,'Puma Suede Classic XXI','Suede kinh điển đã tồn tại hơn 50 năm',NULL,1600000.00,3,3,'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers','2026-06-05 01:50:10','2026-06-05 01:50:10'),(11,'Puma Serve Pro','Giày đế tốt đi êm chân',NULL,2000000.00,3,3,'https://cdn.vuahanghieu.com/unsafe/0x900/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/product/2022/11/giay-the-thao-puma-serve-pro-wide-mau-trang-size-40-638706127ba7a-30112022142818.jpg','2026-06-19 04:05:16','2026-06-19 04:05:16'),(12,'conver1970s','Giày chất lượng tốt ',NULL,3000000.00,4,8,'https://thfvnext.bing.com/th/id/OIP.YbfzwP_J58Yb5kGjXOH68wHaHa?w=199&h=199&c=7&r=0&o=7&cb=thfvnextfalcon3&dpr=1.3&pid=1.7&rm=3','2026-06-19 04:26:45','2026-06-30 15:36:55'),(13,'Nike AF1','Giày chính hãng 100% phong cách hiện đại','<p dir=\"ltr\"><strong>Nike Air Force 1 - Phối màu Đen Trắng</strong></p>\n<p dir=\"ltr\">Nike Air Force 1 là mẫu giày sneaker huyền thoại ra mắt từ năm 1982, đến nay vẫn giữ vững vị thế là một trong những đôi giày biểu tượng nhất trong lịch sử thể thao và thời trang đường phố. Phiên bản phối màu Đen - Trắng mang đến vẻ ngoài tương phản mạnh mẽ, dễ phối đồ và phù hợp với mọi phong cách từ năng động đến lịch lãm.</p>\n<p dir=\"ltr\"><strong>Thiết kế:</strong></p>\n<ul dir=\"ltr\">\n<li>Phần upper (thân giày) làm từ da tổng hợp cao cấp, phối 2 tông đen - trắng rõ nét tạo điểm nhấn thị giác.</li>\n<li>Logo Swoosh nổi bật màu trắng trên nền đen (hoặc ngược lại tùy vị trí), giữ nguyên form dáng cổ điển đặc trưng của dòng Air Force 1.</li>\n<li>Dòng chữ \"AIR\" in nổi ở phần đế giữa (midsole) - chi tiết nhận diện thương hiệu kinh điển.</li>\n<li>Đế cao su bền bỉ, độ bám tốt, phù hợp sử dụng hàng ngày.</li>\n</ul>\n<p dir=\"ltr\"><strong>Công nghệ:</strong></p>\n<ul dir=\"ltr\">\n<li>Đệm Nike Air ở gót giày mang lại cảm giác êm ái, giảm chấn tốt khi di chuyển trong thời gian dài.</li>\n<li>Lót giày êm mềm, hỗ trợ tốt vòm bàn chân.</li>\n</ul>\n<p dir=\"ltr\"><strong>Chất liệu:</strong> Da tổng hợp (synthetic leather) kết hợp da lộn ở một số chi tiết, cổ giày bọc đệm êm.</p>\n<p dir=\"ltr\"><strong>Phù hợp với:</strong> Nam &amp; Nữ, phong cách streetwear, mặc đi học, đi làm casual, hoặc phối cùng jeans/quần jogger.</p>\n<p dir=\"ltr\"><strong>Hướng dẫn bảo quản:</strong> Lau sạch bụi bẩn bằng khăn ẩm, tránh giặt máy để giữ form giày, để nơi khô ráo thoáng mát.</p>',2000000.00,1,1,'http://localhost:5003/uploads/1789722589020-706370190.jpg','2026-06-30 16:39:30','2026-09-18 09:09:55');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Nike Vietnam Distribution','supply@nikevn.com','02812345678','KCN Sóng Thần, Bình Dương','2026-06-05 01:50:17'),(2,'Adidas SEA Import','import@adidassea.com','02898765432','Quận 7, TP.HCM','2026-06-05 01:50:17'),(3,'Puma','Puma@gmail.com','012345678','Ha Noi','2026-06-05 02:20:38'),(4,'Vans','Vans@gmail.com','0123456789','Ba Đình ,Ha Nội','2026-06-19 04:07:46'),(5,'Converse','Converse@gmail.com','0978982880','Dương Nội,HaNoi','2026-06-19 04:08:26');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:37
CREATE DATABASE  IF NOT EXISTS `db_profile` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_profile`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_profile
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,1,'Admin','0900000000','Hà Nội',NULL,'2026-06-05 01:49:32','2026-06-05 01:49:32'),(2,2,'Nguyen Van A','0911111111','TP.HCM',NULL,'2026-06-05 01:49:32','2026-06-05 01:49:32'),(3,4,'pham van nam',NULL,NULL,NULL,'2026-09-11 09:56:44','2026-09-11 09:57:29'),(4,7,'Hoàng anh',NULL,NULL,NULL,'2026-09-16 02:09:19','2026-09-16 03:02:36'),(5,9,'son dinh',NULL,NULL,NULL,'2026-09-16 03:03:15','2026-09-16 03:03:15');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 11:51:37
