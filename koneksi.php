<?php

$conn = new mysqli("localhost", "root", "", "db_tib");

if ($conn->connect_error) {
    die("Koneksi gagal : " . $conn->connect_error);
}

echo "Koneksi berhasil";

?>