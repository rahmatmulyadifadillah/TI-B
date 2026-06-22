<?php
$conn = mysqli_connect("localhost", "root", "");

if (!$conn) {
    die("Koneksi gagal : " . mysqli_connect_error());
}

mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS belajarphp");

mysqli_select_db($conn, "belajarphp");

mysqli_query($conn, "CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    password VARCHAR(100),
    nama VARCHAR(100),
    email VARCHAR(100)
)");

if(isset($_POST['tambah'])){

    $username = $_POST['username'];
    $password = $_POST['password'];
    $nama     = $_POST['nama'];
    $email    = $_POST['email'];

    mysqli_query($conn, "INSERT INTO users(username,password,nama,email)
    VALUES('$username','$password','$nama','$email')");

    echo "
    <script>
        alert('Data berhasil ditambahkan');
        window.location='index.php';
    </script>
    ";
}

if(isset($_GET['hapus'])){

    $id = $_GET['hapus'];

    mysqli_query($conn, "DELETE FROM users WHERE id='$id'");

    echo "
    <script>
        alert('Data berhasil dihapus');
        window.location='index.php';
    </script>
    ";
}

$edit = false;

$id = "";
$username = "";
$password = "";
$nama = "";
$email = "";

if(isset($_GET['edit'])){

    $id = $_GET['edit'];

    $data = mysqli_query($conn, "SELECT * FROM users WHERE id='$id'");

    $d = mysqli_fetch_assoc($data);

    $username = $d['username'];
    $password = $d['password'];
    $nama     = $d['nama'];
    $email    = $d['email'];

    $edit = true;
}

if(isset($_POST['update'])){

    $id       = $_POST['id'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $nama     = $_POST['nama'];
    $email    = $_POST['email'];

    mysqli_query($conn, "UPDATE users SET
        username='$username',
        password='$password',
        nama='$nama',
        email='$email'
        WHERE id='$id'
    ");

    echo "
    <script>
        alert('Data berhasil diupdate');
        window.location='index.php';
    </script>
    ";
}

echo "

<!DOCTYPE html>
<html>
<head>
    <title>DATABASE MAHASISWA</title>

<style>

body{
    font-family: Arial;
    background:#050816;
    color:white;
    padding:30px;
    overflow-x:hidden;
    position:relative;
}

/* ANIMASI CAHAYA */

.light{
    position:fixed;
    top:-250px;
    width:2px;
    height:220px;
    background:linear-gradient(cyan, transparent);

    box-shadow:
    0 0 10px cyan,
    0 0 20px cyan,
    0 0 40px cyan;

    animation:turun linear infinite;
}

/* ANIMASI TURUN */

@keyframes turun{

    0%{
        transform:translateY(-250px);
        opacity:0;
    }

    30%{
        opacity:1;
    }

    100%{
        transform:translateY(120vh);
        opacity:0;
    }

}

.container{
    width:900px;
    margin:auto;
    background:rgba(255,255,255,0.05);
    padding:30px;
    border-radius:15px;
    backdrop-filter:blur(10px);
    box-shadow:0 0 20px cyan;
    position:relative;
    z-index:10;
}

h1{
    text-align:center;
    color:cyan;
    text-shadow:0 0 20px cyan;
}

input{
    width:100%;
    padding:12px;
    margin-top:5px;
    margin-bottom:20px;
    border:none;
    border-radius:10px;
    background:#1e293b;
    color:white;
    outline:none;
}

input:focus{
    box-shadow:0 0 15px cyan;
}

button{
    padding:12px 25px;
    border:none;
    border-radius:10px;
    background:cyan;
    color:black;
    font-weight:bold;
    cursor:pointer;
    transition:0.3s;
}

button:hover{
    background:white;
    transform:scale(1.05);
    box-shadow:0 0 20px cyan;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:30px;
    background:rgba(255,255,255,0.03);
}

table th{
    background:cyan;
    color:black;
    padding:15px;
}

table td{
    padding:12px;
    border-bottom:1px solid #334155;
    text-align:center;
}

tr:hover{
    background:rgba(0,255,255,0.08);
}

a{
    text-decoration:none;
    color:cyan;
    font-weight:bold;
}

a:hover{
    color:white;
}

</style>

</head>

<body>

";

// MEMBUAT CAHAYA TURUN
for($i=0; $i<35; $i++){

    $left = rand(0,100);
    $delay = rand(0,5);
    $duration = rand(3,8);

    echo "

    <div class='light'
    style='
    left:".$left."%;
    animation-duration:".$duration."s;
    animation-delay:".$delay."s;
    '>
    </div>

    ";
}

echo "

<div class='container'>

<h1>DATA MAHASISWA</h1>

<form method='POST'>
";

if($edit == true){

    echo "<input type='hidden' name='id' value='$id'>";

}

echo "

<label>Username</label>
<input type='text' name='username' value='$username' required>

<label>Password</label>
<input type='text' name='password' value='$password' required>

<label>Nama</label>
<input type='text' name='nama' value='$nama' required>

<label>Email</label>
<input type='email' name='email' value='$email' required>

";

if($edit == true){

    echo "<button type='submit' name='update'>UPDATE DATA</button>";

}else{

    echo "<button type='submit' name='tambah'>TAMBAH DATA</button>";
}

echo "

</form>

<table>

<tr>
    <th>No</th>
    <th>Username</th>
    <th>Password</th>
    <th>Nama</th>
    <th>Email</th>
    <th>Aksi</th>
</tr>

";

$data = mysqli_query($conn, "SELECT * FROM users");

$no = 1;

while($d = mysqli_fetch_assoc($data)){

    echo "

    <tr>

        <td>".$no++."</td>
        <td>".$d['username']."</td>
        <td>".$d['password']."</td>
        <td>".$d['nama']."</td>
        <td>".$d['email']."</td>

        <td>
            <a href='?edit=".$d['id']."'>Edit</a>
            |
            <a href='?hapus=".$d['id']."'
            onclick=\"return confirm('Yakin hapus data?')\">
            Hapus
            </a>
        </td>

    </tr>

    ";
}

echo "

</table>

</div>

</body>
</html>

";

?>