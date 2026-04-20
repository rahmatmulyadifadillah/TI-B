<form method="POST">
    Masukan sebuah angka :
    <input type="number" name="angka">
    <input type="submit" value="kirim">
</form>

<?php
if (isset($_POST['angka'])) {
    $angka = $_POST['angka'];

    for ($i = 1; $i <= $angka; $i++) {
        echo "<br>Nilai Anda : $i";
    }
}
?>