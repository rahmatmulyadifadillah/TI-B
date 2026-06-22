<?php
require_once 'config/database.php';

echo "<h2>Update Database</h2>";

// Check if payment_method column exists
$check_column = $conn->query("SHOW COLUMNS FROM orders LIKE 'payment_method'");
if ($check_column->num_rows == 0) {
    echo "<p>Menambahkan kolom payment_method...</p>";
    $sql = "ALTER TABLE orders ADD COLUMN payment_method ENUM('transfer_bni', 'transfer_bri', 'ewallet') DEFAULT 'transfer_bni'";
    if ($conn->query($sql)) {
        echo "<p style='color: green;'>✓ Kolom payment_method berhasil ditambahkan</p>";
    } else {
        echo "<p style='color: red;'>✗ Gagal menambahkan kolom payment_method: " . $conn->error . "</p>";
    }
} else {
    echo "<p style='color: blue;'>ℹ Kolom payment_method sudah ada</p>";
}

// Check if payment_account column exists
$check_column = $conn->query("SHOW COLUMNS FROM orders LIKE 'payment_account'");
if ($check_column->num_rows == 0) {
    echo "<p>Menambahkan kolom payment_account...</p>";
    $sql = "ALTER TABLE orders ADD COLUMN payment_account VARCHAR(50)";
    if ($conn->query($sql)) {
        echo "<p style='color: green;'>✓ Kolom payment_account berhasil ditambahkan</p>";
    } else {
        echo "<p style='color: red;'>✗ Gagal menambahkan kolom payment_account: " . $conn->error . "</p>";
    }
} else {
    echo "<p style='color: blue;'>ℹ Kolom payment_account sudah ada</p>";
}

echo "<hr>";
echo "<p><a href='user/index.php'>Kembali ke Beranda</a></p>";
?>
