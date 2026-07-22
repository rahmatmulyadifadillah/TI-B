-- ====================================================================
-- Database Dump for UTM Sport Center Booking System
-- Generated: 2026-07-07T12:58:46.897Z
-- Target Engine: MySQL 8.0+ / MariaDB
-- Compatibility: XAMPP, phpMyAdmin, MySQL Workbench
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `log_activity`;
DROP TABLE IF EXISTS `notifikasi`;
DROP TABLE IF EXISTS `chat`;
DROP TABLE IF EXISTS `sponsor`;
DROP TABLE IF EXISTS `peserta_turnamen`;
DROP TABLE IF EXISTS `turnamen`;
DROP TABLE IF EXISTS `event`;
DROP TABLE IF EXISTS `faq`;
DROP TABLE IF EXISTS `artikel`;
DROP TABLE IF EXISTS `galeri`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `membership`;
DROP TABLE IF EXISTS `promo`;
DROP TABLE IF EXISTS `voucher`;
DROP TABLE IF EXISTS `pembayaran`;
DROP TABLE IF EXISTS `invoice`;
DROP TABLE IF EXISTS `booking_detail`;
DROP TABLE IF EXISTS `booking`;
DROP TABLE IF EXISTS `jadwal`;
DROP TABLE IF EXISTS `lapangan`;
DROP TABLE IF EXISTS `kategori_lapangan`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `setting`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- Table: setting
-- --------------------------------------------------------------------
CREATE TABLE `setting` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_name` VARCHAR(100) NOT NULL,
  `whatsapp_contact` VARCHAR(20) NOT NULL,
  `instagram_contact` VARCHAR(50) NOT NULL,
  `email_contact` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `location_maps_url` TEXT NOT NULL,
  `maintenance_mode` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `setting` VALUES (1, 'UTM Sport Center', '081339638842', 'rahmtmlydi__', 'rahmatmulyadifadillah@gmail.com', 'Jl. Pemuda No. 12, Dasan Agung Baru, Kec. Selaparang, Kota Mataram, Nusa Tenggara Barat 83125, Indonesia', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126244.62916167888!2d116.03541484831665!3d-8.577241285038318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3945.14819777598!2d116.1035515!3d-8.5833446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1710000000000', 0);

-- --------------------------------------------------------------------
-- Table: roles
-- --------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`name`, `description`) VALUES 
('superadmin', 'Akses penuh seluruh sistem, pengaturan, backup, dan manajemen finansial'),
('admin', 'Kelola booking, lapangan, promo, turnamen, dan verifikasi pembayaran'),
('operator', 'Mengunci jadwal, memantau ketersediaan lapangan, dan mengawasi jalannya event'),
('kasir', 'Menerima pembayaran manual on-the-spot di lokasi lapangan'),
('user', 'Pelanggan umum UTM Sport Center');

-- --------------------------------------------------------------------
-- Table: users
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `photo_url` TEXT,
  `role` VARCHAR(20) DEFAULT 'user',
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `points` INT DEFAULT 0,
  `referral_code` VARCHAR(20) UNIQUE,
  `referred_by` VARCHAR(20),
  `membership` ENUM('regular', 'bronze', 'silver', 'gold') DEFAULT 'regular',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES ('user-superadmin', 'superadmin@utmsport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rahmat Mulyadi (Admin)', '081339638842', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', 'admin', 'aktif', 1000, 'UTM_SUPER', NULL, 'gold', '2026-01-01T10:00:00Z');
INSERT INTO `users` VALUES ('user-admin', 'admin@utmsport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin UTM Sport', '081339638842', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', 'admin', 'aktif', 500, 'UTM_ADMIN', NULL, 'silver', '2026-01-05T12:00:00Z');
INSERT INTO `users` VALUES ('user-operator', 'operator@utmsport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operator Lapangan', '081339638842', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'operator', 'aktif', 100, 'UTM_OPERATOR', NULL, 'regular', '2026-02-10T14:00:00Z');
INSERT INTO `users` VALUES ('user-regular', 'user@utmsport.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rahmat Mulyadi Fadillah', '081339638842', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', 'user', 'aktif', 250, 'RAHMAT842', 'UTM_SUPER', 'silver', '2026-06-01T08:00:00Z');
INSERT INTO `users` VALUES ('user-1783418602882', 'rahmatmulyadifadillah@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MuL', '081339638842', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', 'user', 'aktif', 10, 'UTM-MUL619', NULL, 'regular', '2026-07-07T10:03:22.882Z');

-- --------------------------------------------------------------------
-- Table: kategori_lapangan
-- --------------------------------------------------------------------
CREATE TABLE `kategori_lapangan` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `icon` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kategori_lapangan` VALUES 
('futsal', 'Futsal', 'futbol'),
('voli', 'Voli', 'volleyball');

-- --------------------------------------------------------------------
-- Table: lapangan
-- --------------------------------------------------------------------
CREATE TABLE `lapangan` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `kategori_id` VARCHAR(50) NOT NULL,
  `court_type` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `capacity` INT DEFAULT 10,
  `size` VARCHAR(50),
  `description` TEXT,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `reviews_count` INT DEFAULT 0,
  `image` TEXT,
  `video_url` TEXT,
  `view_360_url` TEXT,
  FOREIGN KEY (`kategori_id`) REFERENCES `kategori_lapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lapangan` VALUES ('court-futsal-vinyl', 'Lapangan Futsal Vinyl Premium', 'futsal', 'Vinyl', 150000, 10, '38m x 18m', 'Lapangan futsal indoor dengan lantai material Vinyl berkualitas tinggi standard internasional. Memiliki daya cengkram optimal, mengurangi risiko cedera lutut dan pergelangan kaki.', 'aktif', 4.8, 12, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1517649763962-0c623066013b');
INSERT INTO `lapangan` VALUES ('court-futsal-rumput', 'Lapangan Futsal Rumput Sintetis', 'futsal', 'Rumput Sintetis', 130000, 12, '40m x 20m', 'Lapangan futsal indoor dengan rumput sintetis premium yang lembut dan padat. Dilengkapi dengan butiran karet pengisi (rubber infill) berkualitas untuk pantulan bola yang sempurna.', 'aktif', 4.6, 8, 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68');
INSERT INTO `lapangan` VALUES ('court-futsal-interlock', 'Lapangan Futsal Interlock', 'futsal', 'Interlock', 120000, 10, '38m x 18m', 'Lapangan futsal semi-outdoor menggunakan lantai interlock polipropilena yang kokoh dan memiliki drainase yang baik. Sangat cocok untuk permainan cepat dan latihan fisik intens.', 'aktif', 4.5, 5, 'https://images.unsplash.com/photo-1624880357913-a853e236c82a?auto=format&fit=crop&q=80&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL);

-- --------------------------------------------------------------------
-- Table: jadwal
-- --------------------------------------------------------------------
CREATE TABLE `jadwal` (
  `id` VARCHAR(100) PRIMARY KEY,
  `lapangan_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('tersedia', 'dipesan', 'terkunci') DEFAULT 'tersedia',
  FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-0', 'court-futsal-vinyl', '2026-07-07', '07:00 - 08:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-1', 'court-futsal-vinyl', '2026-07-07', '08:00 - 09:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-2', 'court-futsal-vinyl', '2026-07-07', '09:00 - 10:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-3', 'court-futsal-vinyl', '2026-07-07', '10:00 - 11:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-4', 'court-futsal-vinyl', '2026-07-07', '11:00 - 12:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-5', 'court-futsal-vinyl', '2026-07-07', '12:00 - 13:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-6', 'court-futsal-vinyl', '2026-07-07', '13:00 - 14:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-7', 'court-futsal-vinyl', '2026-07-07', '14:00 - 15:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-8', 'court-futsal-vinyl', '2026-07-07', '15:00 - 16:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-9', 'court-futsal-vinyl', '2026-07-07', '16:00 - 17:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-10', 'court-futsal-vinyl', '2026-07-07', '17:00 - 18:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-11', 'court-futsal-vinyl', '2026-07-07', '18:00 - 19:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-12', 'court-futsal-vinyl', '2026-07-07', '19:00 - 20:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-13', 'court-futsal-vinyl', '2026-07-07', '20:00 - 21:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-14', 'court-futsal-vinyl', '2026-07-07', '21:00 - 22:00', 150000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-07-15', 'court-futsal-vinyl', '2026-07-07', '22:00 - 23:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-0', 'court-futsal-rumput', '2026-07-07', '07:00 - 08:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-1', 'court-futsal-rumput', '2026-07-07', '08:00 - 09:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-2', 'court-futsal-rumput', '2026-07-07', '09:00 - 10:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-3', 'court-futsal-rumput', '2026-07-07', '10:00 - 11:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-4', 'court-futsal-rumput', '2026-07-07', '11:00 - 12:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-5', 'court-futsal-rumput', '2026-07-07', '12:00 - 13:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-6', 'court-futsal-rumput', '2026-07-07', '13:00 - 14:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-7', 'court-futsal-rumput', '2026-07-07', '14:00 - 15:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-8', 'court-futsal-rumput', '2026-07-07', '15:00 - 16:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-9', 'court-futsal-rumput', '2026-07-07', '16:00 - 17:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-10', 'court-futsal-rumput', '2026-07-07', '17:00 - 18:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-11', 'court-futsal-rumput', '2026-07-07', '18:00 - 19:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-12', 'court-futsal-rumput', '2026-07-07', '19:00 - 20:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-13', 'court-futsal-rumput', '2026-07-07', '20:00 - 21:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-14', 'court-futsal-rumput', '2026-07-07', '21:00 - 22:00', 130000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-rumput-2026-07-07-15', 'court-futsal-rumput', '2026-07-07', '22:00 - 23:00', 130000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-0', 'court-futsal-interlock', '2026-07-07', '07:00 - 08:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-1', 'court-futsal-interlock', '2026-07-07', '08:00 - 09:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-2', 'court-futsal-interlock', '2026-07-07', '09:00 - 10:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-3', 'court-futsal-interlock', '2026-07-07', '10:00 - 11:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-4', 'court-futsal-interlock', '2026-07-07', '11:00 - 12:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-5', 'court-futsal-interlock', '2026-07-07', '12:00 - 13:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-6', 'court-futsal-interlock', '2026-07-07', '13:00 - 14:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-7', 'court-futsal-interlock', '2026-07-07', '14:00 - 15:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-8', 'court-futsal-interlock', '2026-07-07', '15:00 - 16:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-9', 'court-futsal-interlock', '2026-07-07', '16:00 - 17:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-10', 'court-futsal-interlock', '2026-07-07', '17:00 - 18:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-11', 'court-futsal-interlock', '2026-07-07', '18:00 - 19:00', 120000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-12', 'court-futsal-interlock', '2026-07-07', '19:00 - 20:00', 120000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-13', 'court-futsal-interlock', '2026-07-07', '20:00 - 21:00', 120000, 'dipesan');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-14', 'court-futsal-interlock', '2026-07-07', '21:00 - 22:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-interlock-2026-07-07-15', 'court-futsal-interlock', '2026-07-07', '22:00 - 23:00', 120000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-08-0', 'court-futsal-vinyl', '2026-07-08', '07:00 - 08:00', 150000, 'tersedia');
INSERT INTO `jadwal` VALUES ('slot-court-futsal-vinyl-2026-07-08-1', 'court-futsal-vinyl', '2026-07-08', '08:00 - 09:00', 150000, 'tersedia');

-- --------------------------------------------------------------------
-- Table: voucher
-- --------------------------------------------------------------------
CREATE TABLE `voucher` (
  `id` VARCHAR(50) PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `discount_type` ENUM('percent', 'flat') NOT NULL,
  `value` DECIMAL(10,2) NOT NULL,
  `min_purchase` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `status` ENUM('aktif', 'expired') DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `voucher` VALUES ('v-diskon10', 'UTM10', 'percent', 10, 100000, 'Diskon 10% untuk semua lapangan dengan minimal transaksi Rp 100.000.', 'aktif');
INSERT INTO `voucher` VALUES ('v-potong30k', 'UTMHEBAT', 'flat', 30000, 120000, 'Potongan harga Rp 30.000 untuk lapangan futsal dengan minimal transaksi Rp 120.000.', 'aktif');
INSERT INTO `voucher` VALUES ('v-membergold', 'MEMBGOLD', 'percent', 15, 80000, 'Diskon eksklusif 15% khusus Member Gold.', 'aktif');

-- --------------------------------------------------------------------
-- Table: promo
-- --------------------------------------------------------------------
CREATE TABLE `promo` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `discount_percent` INT DEFAULT 0,
  `image_url` TEXT,
  `expiry_date` DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `promo` VALUES ('p-flash', 'Flash Sale Selasa Hebat', 'Diskon 20% khusus hari Selasa pukul 08:00 - 14:00 WITA. Berlaku semua jenis lapangan futsal & voli.', 20, 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600', '2026-08-31');
INSERT INTO `promo` VALUES ('p-merdeka', 'Promo Spesial Hari Kemerdekaan', 'Cashback Point 50% untuk booking di tanggal 17 Agustus 2026. Main lebih seru, dapat poin melimpah!', 15, 'https://images.unsplash.com/photo-1540747737956-378724044602?auto=format&fit=crop&q=80&w=600', '2026-08-18');

-- --------------------------------------------------------------------
-- Table: booking
-- --------------------------------------------------------------------
CREATE TABLE `booking` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `court_category` VARCHAR(50) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `final_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `booking_type` ENUM('harian', 'mingguan', 'bulanan', 'event', 'turnamen') DEFAULT 'harian',
  `status` ENUM('pending', 'diproses', 'menunggu_pembayaran', 'dikonfirmasi', 'ditolak', 'selesai', 'expired') DEFAULT 'pending',
  `notes` TEXT,
  `payment_proof_url` TEXT,
  `qr_code_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Table: booking_detail
-- --------------------------------------------------------------------
CREATE TABLE `booking_detail` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `lapangan_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Table: review
-- --------------------------------------------------------------------
CREATE TABLE `review` (
  `id` VARCHAR(50) PRIMARY KEY,
  `lapangan_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_text` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review` VALUES ('rev-1', 'court-futsal-vinyl', 'user-regular', 5, 'Lantai vinyl nya empuk banget dan ga licin! Penerangan malam hari sangat terang benderang. Pelayanan admin ramah banget, langsung dikasih air mineral gratis pas pertama kali main. Recommended!', '2026-07-01T20:30:00Z');

-- --------------------------------------------------------------------
-- Table: galeri
-- --------------------------------------------------------------------
CREATE TABLE `galeri` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `image_url` TEXT NOT NULL,
  `category` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `galeri` VALUES ('g-1', 'Grand Opening UTM Sport Center', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600', 'fasilitas');
INSERT INTO `galeri` VALUES ('g-2', 'Pertandingan Futsal Persahabatan', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=600', 'event');
INSERT INTO `galeri` VALUES ('g-4', 'Fasilitas Musholla Bersih', 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600', 'fasilitas');

-- --------------------------------------------------------------------
-- Table: artikel
-- --------------------------------------------------------------------
CREATE TABLE `artikel` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `summary` TEXT,
  `content` TEXT,
  `image_url` TEXT,
  `author` VARCHAR(50),
  `date` DATE,
  `views` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `artikel` VALUES ('art-1', '5 Tips Penting Menghindari Cedera Saat Bermain Futsal', 'Bermain futsal sangat menyenangkan, namun risiko cedera selalu mengintai jika Anda mengabaikan pemanasan dan perlengkapan.', 'Futsal adalah olahraga dengan tempo tinggi yang membutuhkan akselerasi, deselerasi cepat, dan kontak fisik. Untuk menghindari cedera, perhatikan 5 tips berikut:

1. **Pemanasan yang Cukup**: Lakukan dinamis stretching minimal 10 menit sebelum masuk lapangan.
2. **Gunakan Sepatu yang Tepat**: Pilih sepatu futsal dengan outsole karet anti selip yang sesuai dengan jenis lantai (vinyl atau interlock).
3. **Gunakan Dekker pelindung tulang kering** untuk menghindari benturan langsung.
4. **Hidrasi Tubuh**: Minum air putih 200-300ml setiap 15-20 menit bermain.
5. **Pendinginan (Cooling Down)**: Lakukan peregangan statis setelah bermain untuk mengembalikan kelenturan otot.', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=600', 'Coach Rahmat', '2026-07-01', 124);

-- --------------------------------------------------------------------
-- Table: faq
-- --------------------------------------------------------------------
CREATE TABLE `faq` (
  `id` VARCHAR(50) PRIMARY KEY,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faq` VALUES ('faq-1', 'Bagaimana cara melakukan booking lapangan?', 'Anda dapat mendaftar akun terlebih dahulu, memilih menu Lapangan, tentukan jenis lapangan, tanggal, jam bermain, lalu selesaikan pembayaran via transfer Bank atau E-Wallet yang tersedia.', 'booking');
INSERT INTO `faq` VALUES ('faq-2', 'Apakah bisa membatalkan booking yang sudah dibayar?', 'Pembatalan booking dapat dilakukan maksimal 24 jam sebelum jadwal bermain. Poin refund atau uang akan dikembalikan dalam bentuk Point Reward sebesar 80% dari total nominal transaksi.', 'kebijakan');
INSERT INTO `faq` VALUES ('faq-3', 'Bagaimana cara menjadi member UTM Sport?', 'Silakan masuk ke halaman Dashboard User lalu pilih menu Membership. Anda bisa membeli paket Bronze, Silver, atau Gold untuk mendapatkan diskon otomatis setiap kali booking.', 'member');

-- --------------------------------------------------------------------
-- Table: turnamen
-- --------------------------------------------------------------------
CREATE TABLE `turnamen` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `fee` DECIMAL(10,2) DEFAULT 0.00,
  `prize` VARCHAR(100),
  `participants_count` INT DEFAULT 0,
  `max_participants` INT DEFAULT 32,
  `date` DATE,
  `status` ENUM('buka', 'berjalan', 'selesai') DEFAULT 'buka',
  `image` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `turnamen` VALUES ('tour-1', 'UTM Futsal Cup Mataram 2026', 'Turnamen futsal antar instansi dan umum se-Kota Mataram. Perebutkan piala bergilir dan total hadiah puluhan juta rupiah!', 350000, 'Total Rp 15.000.000 + Trophy', 14, 32, '2026-08-15', 'buka', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600');

-- --------------------------------------------------------------------
-- Table: event
-- --------------------------------------------------------------------
CREATE TABLE `event` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `date` DATE,
  `time` VARCHAR(50),
  `fee` DECIMAL(10,2) DEFAULT 0.00,
  `image` TEXT,
  `location` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `event` VALUES ('evt-1', 'Coaching Clinic Futsal Bersama Pelatih Nasional', 'Belajar langsung teknik dasar, taktik tanding futsal modern bersama pelatih tim nasional Indonesia.', '2026-07-25', '08:00 - 12:00 WITA', 50000, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600', 'UTM Sport Center Court A');

-- --------------------------------------------------------------------
-- Table: sponsor
-- --------------------------------------------------------------------
CREATE TABLE `sponsor` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `image_url` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sponsor` VALUES ('sp-1', 'Specs Indonesia', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150');
INSERT INTO `sponsor` VALUES ('sp-2', 'Mizuno', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=150');
INSERT INTO `sponsor` VALUES ('sp-3', 'Pocari Sweat', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=150');

-- --------------------------------------------------------------------
-- Table: chat
-- --------------------------------------------------------------------
CREATE TABLE `chat` (
  `id` VARCHAR(50) PRIMARY KEY,
  `sender_id` VARCHAR(50) NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `receiver_id` VARCHAR(50) NOT NULL,
  `message` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: notifikasi
-- --------------------------------------------------------------------
CREATE TABLE `notifikasi` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: log_activity
-- --------------------------------------------------------------------
CREATE TABLE `log_activity` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50),
  `user_email` VARCHAR(100),
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Create Indexes for optimization
-- --------------------------------------------------------------------
CREATE INDEX idx_booking_user ON `booking`(`user_id`);
CREATE INDEX idx_booking_status ON `booking`(`status`);
CREATE INDEX idx_booking_invoice ON `booking`(`invoice_number`);
CREATE INDEX idx_jadwal_search ON `jadwal`(`lapangan_id`, `date`);
CREATE INDEX idx_review_lapangan ON `review`(`lapangan_id`);
CREATE INDEX idx_chat_receiver ON `chat`(`receiver_id`);
CREATE INDEX idx_notif_user ON `notifikasi`(`user_id`, `is_read`);

-- --------------------------------------------------------------------
-- End of SQL Dump
-- ====================================================================
