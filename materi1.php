<?php
 echo"Hello word";
echo "<br><br>" ;

 $nama = "mul";
 $umur =  20;
 $kelas = "TIB Semester 4";
 echo"nama saya $nama, umur saya $umur, kelas saya $kelas";
 echo "<br><br>============================================" ;


 $nilai1 = 11;
 $nilai2 = 12;
 $nilai3 = 5;

$hasil = $nilai1 * $nilai2 - $nilai3;
echo "<br>hasil dari $nilai1 x $nilai2 - $nilai3 adalah $hasil";  


if($hasil >= 100 ) {
echo "<br>Nilai anda lebih dari 100";
} else if ($hasil < 100) {
echo "<br>Nilai anda kurang dari 100";
} else {
 echo "<br>Nilai anda kosong";
}

echo "<br><br>============================================" ;

echo "<br>hasil dari $nilai1 x $nilai2 - $nilai3 adalah $hasil";

if ($hasil % 2 == 0) {
    echo "<br>Hasil adalah GENAP";
} else {
    echo "<br>Hasil adalah GANJIL";
}


?>