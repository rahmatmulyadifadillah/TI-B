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
<?php

echo "<h3>Perulangan While</h3>";
$i = 1;
while ($i <= 5) {
    echo "While: $i <br>";
    $i++;
}

echo "<h3>Perulangan Do While</h3>";
$i = 1;
do {
    echo "Do While: $i <br>";
    $i++;
} while ($i <= 5);

echo "<h3>Perulangan For</h3>";
for ($i = 1; $i <= 5; $i++) {
    echo "For: $i <br>";
}

echo "<h3>For Increment 2</h3>";
for ($i = 1; $i <= 10; $i += 2) {
    echo "For +2: $i <br>";
}
