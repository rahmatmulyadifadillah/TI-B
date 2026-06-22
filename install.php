<?php

echo "<h1>🚀 Instalasi Marketplace</h1>";
echo "<hr>";
echo "<h2>Step 1: Cek Koneksi Database</h2>";
$conn = @mysqli_connect("localhost", "root", "");

if (!$conn) {
    die("<p style='color:red'>❌ Gagal koneksi ke MySQL. Pastikan XAMPP sudah berjalan.</p>");
}
echo "<p style='color:green'>✅ Koneksi MySQL berhasil!</p>";

echo "<h2>Step 2: Buat Database</h2>";
$sql = "CREATE DATABASE IF NOT EXISTS marketplace_db";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Database marketplace_db berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat database: " . $conn->error . "</p>";
}

$conn->select_db("marketplace_db");

echo "<h2>Step 3: Buat Tabel</h2>";

$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Tabel users berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat tabel users: " . $conn->error . "</p>";
}

$sql = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Tabel products berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat tabel products: " . $conn->error . "</p>";
}

$sql = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Tabel orders berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat tabel orders: " . $conn->error . "</p>";
}

$sql = "CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Tabel order_items berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat tabel order_items: " . $conn->error . "</p>";
}

$sql = "CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method ENUM('transfer_bca', 'transfer_bri', 'transfer_mandiri', 'ewallet') NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Tabel payments berhasil dibuat!</p>";
} else {
    echo "<p style='color:red'>❌ Gagal membuat tabel payments: " . $conn->error . "</p>";
}

echo "<h2>Step 4: Insert Admin User</h2>";
$admin_password = password_hash('admin123', PASSWORD_DEFAULT);
$sql = "INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@marketplace.com', '$admin_password', 'admin')";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Admin user berhasil dibuat!</p>";
} else {
    echo "<p style='color:orange'>⚠️ Admin user sudah ada atau gagal dibuat</p>";
}

echo "<h2>Step 5: Insert Sample Products</h2>";
$products = [
    ['iPhone 15 Pro Max', 24999000, 'Smartphone Apple terbaru dengan chip A17 Pro, kamera 48MP, dan layar Super Retina XDR 6.7 inci', 'iphone15.jpg', 50, 4.8, 120],
    ['Samsung Galaxy S24 Ultra', 21999000, 'Flagship Samsung dengan layar Dynamic AMOLED 2X, kamera 200MP, dan S Pen integrated', 'samsung24.jpg', 45, 4.7, 95],
    ['MacBook Pro M3', 35999000, 'Laptop powerful dengan chip M3 Pro, layar Liquid Retina XDR 14 inci, dan baterai tahan lama', 'macbook.jpg', 30, 4.9, 80],
    ['Sony WH-1000XM5', 5999000, 'Headphone wireless premium dengan noise cancelling terbaik di kelasnya', 'sony headphone.jpg', 100, 4.6, 200],
    ['iPad Air M2', 12999000, 'Tablet powerful dengan chip M2, layar Liquid Retina 10.9 inci, dan support Apple Pencil', 'ipad.jpg', 60, 4.7, 150],
    ['AirPods Pro 2', 3999000, 'Earbuds wireless dengan noise cancelling aktif dan suara spatial', 'airpods.jpg', 200, 4.5, 300],
    ['Nintendo Switch OLED', 5499000, 'Console gaming hybrid dengan layar OLED 7 inci dan 64GB storage', 'switch.jpg', 40, 4.8, 180],
    ['Dell XPS 15', 28999000, 'Laptop premium dengan layar InfinityEdge, processor Intel Core i9, dan GPU RTX 4070', 'dell.jpg', 25, 4.6, 70],
    ['GoPro Hero 12', 6999000, 'Action camera 5.3K dengan HyperSmooth 6.0 stabilization', 'gopro.jpg', 80, 4.7, 120],
    ['Kindle Paperwhite', 2999000, 'E-reader dengan layar 6.8 inci, waterproof, dan baterai tahan mingguan', 'kindle.jpg', 150, 4.4, 90]
];

foreach ($products as $product) {
    $sql = "INSERT IGNORE INTO products (name, price, description, image, stock, rating, rating_count) VALUES 
    ('$product[0]', $product[1], '$product[2]', '$product[3]', $product[4], $product[5], $product[6])";
    $conn->query($sql);
}
echo "<p style='color:green'>✅ Sample products berhasil diinsert!</p>";

echo "<h2>Step 6: Insert Sample Users</h2>";
$user_password = password_hash('user123', PASSWORD_DEFAULT);
$sql = "INSERT IGNORE INTO users (username, email, password, role) VALUES 
('user1', 'user1@gmail.com', '$user_password', 'user'),
('user2', 'user2@gmail.com', '$user_password', 'user')";
if ($conn->query($sql) === TRUE) {
    echo "<p style='color:green'>✅ Sample users berhasil dibuat!</p>";
} else {
    echo "<p style='color:orange'>⚠️ Sample users sudah ada atau gagal dibuat</p>";
}

$conn->close();

echo "<hr>";
echo "<h2 style='color:green'>✅ Instalasi Selesai!</h2>";
echo "<p>Website marketplace sudah siap digunakan!</p>";
echo "<hr>";
echo "<h3>👤 Akun Login:</h3>";
echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Role</th><th>Username</th><th>Password</th></tr>";
echo "<tr><td>Admin</td><td>admin</td><td>admin123</td></tr>";
echo "<tr><td>User</td><td>user1</td><td>user123</td></tr>";
echo "<tr><td>User</td><td>user2</td><td>user123</td></tr>";
echo "</table>";
echo "<hr>";
echo "<p><a href='index.php' style='font-size: 20px; text-decoration: none; background: #007bff; color: white; padding: 15px 30px; border-radius: 5px;'>🚀 Buka Website Marketplace</a></p>";
echo "<p><a href='reset_password.php' style='font-size: 16px;'>Reset Password (jika perlu)</a></p>";
?>
