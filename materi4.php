<?php
session_start();

$user = "Rahmat Mulyadi";
$pass = "1234";

$status = "";

if(isset($_POST['login'])){

    if($_POST['username'] == $user && $_POST['password'] == $pass){
        $_SESSION['login'] = true;
        $_SESSION['username'] = $_POST['username'];
        $status = "Login berhasil";
    } else {
        $status = "Login gagal";
    }
}

if(isset($_GET['logout'])){
    session_destroy();
    header("Location: ".$_SERVER['PHP_SELF']);
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>

<?php if(!isset($_SESSION['login'])){ ?>

<h2>LOGIN</h2>

<form method="POST">

    <table border="1" cellpadding="10">

        <tr>
            <td>Username</td>
            <td><input type="text" name="username"></td>
        </tr>

        <tr>
            <td>Password</td>
            <td><input type="password" name="password"></td>
        </tr>

        <tr>
            <td colspan="2">
                <button type="submit" name="login">LOGIN</button>
            </td>
        </tr>

    </table>

</form>

<p><?php echo $status; ?></p>

<?php } else { ?>

<h2>WELCOME <?php echo $_SESSION['username']; ?></h2>

<table border="1" cellpadding="10">

    <tr>
        <th>No</th>
        <th>Nama</th>
        <th>Status</th>
    </tr>

    <tr>
        <td>1</td>
        <td>Rahmat Mulyadi</td>
        <td>Aktif</td>
    </tr>
</table>

<br>

<a href="?logout=1">Logout</a>

<?php } ?>

</body>
</html>