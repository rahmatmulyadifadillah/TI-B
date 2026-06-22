<?php
require_once 'config/database.php';

$admin_password = password_hash('admin123', PASSWORD_DEFAULT);
$user_password = password_hash('user123', PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
$stmt->bind_param("s", $admin_password);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = 'user1'");
$stmt->bind_param("s", $user_password);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = 'user2'");
$stmt->bind_param("s", $user_password);
$stmt->execute();
$stmt->close();

echo "Password berhasil direset!<br><br>";
echo "Admin - Username: admin, Password: admin123<br>";
echo "User1 - Username: user1, Password: user123<br>";
echo "User2 - Username: user2, Password: user123<br><br>";
echo "<a href='login.php'>Kembali ke Login</a>";
?>
