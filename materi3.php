<?php 
function tambah($a, $b) {
    return $a + $b;
}

function kurang($a, $b) {
    return $a - $b;
}

function bagi($a, $b) {
    if ($b == 0) {
        return "Tidak bisa dibagi 0";
    }
    return $a / $b;
}
?>


<form method="POST">
    <input type="number" name="angka1" placeholder="Angka 1" required>
    <input type="number" name="angka2" placeholder="Angka 2" required>
    <button type="submit" name="hitung">Hitung</button>
</form>

<?php
if (isset($_POST['hitung'])) {
    $a = $_POST['angka1'];
    $b = $_POST['angka2'];

    $hasilTambah = tambah($a, $b);
    $hasilKurang = kurang($a, $b);
    $hasilBagi   = bagi($a, $b);
        
?>
    
    <table border="1" cellpadding="10">
        <tr>
            <th>Operasi</th>
            <th>Hasil</th>
        </tr>
        <tr>
            <td>Penjumlahan</td>
            <td><?php echo $hasilTambah; ?></td>
        </tr>
        <tr>
            <td>Pengurangan</td>
            <td><?php echo $hasilKurang; ?></td>
        </tr>
        <tr>
            <td>Pembagian</td>
            <td><?php echo $hasilBagi; ?></td>
        </tr>
    </table>

<?php
}
?>