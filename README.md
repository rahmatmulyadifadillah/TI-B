# UTM Sport Center - Sistem Booking Lapangan Olahraga Online Modern & Premium

UTM Sport Center adalah platform web full-stack premium dan modern yang dirancang untuk mengelola pemesanan (booking) lapangan olahraga secara real-time, berlokasi di Mataram, Nusa Tenggara Barat. Aplikasi ini mengintegrasikan pengalaman pengguna (User Experience) yang sangat intuitif dengan kontrol administratif yang kuat untuk memastikan pengelolaan fasilitas olahraga berjalan dengan mulus dan otomatis.

---

## 📌 DAFTAR ISI
1. [Fitur Utama Aplikasi](#-fitur-utama-aplikasi)
2. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
3. [Akun Demo & Akses Cepat](#-akun-demo--akses-cepat)
4. [Struktur Data & Skema Database (MySQL)](#-struktur-data--skema-database-mysql)
5. [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
6. [PROMPT MASTER (Untuk Membangun Ulang Aplikasi Ini)](#-prompt-master-untuk-membangun-ulang-aplikasi-ini)

---

## 🚀 FITUR UTAMA APLIKASI

### 1. Sisi Pelanggan (User/Customer)
*   **Booking Lapangan Real-Time**: Kalender interaktif untuk memilih tanggal dan slot waktu (jam) lapangan Futsal. Slot yang telah dipesan akan otomatis terkunci.
*   **Sistem Voucher & Diskon**: Input kode voucher aktif (misal: `UTMSPORT`, `FUTSALDEAL`) untuk mendapatkan potongan harga secara instan.
*   **Sistem Koin & Loyalitas**: Akumulasi poin koin setiap kali selesai memesan lapangan untuk ditukarkan dengan hadiah atau potongan harga berikutnya.
*   **Pilihan Metode Pembayaran**: Tersedia berbagai opsi seperti transfer Bank (BCA, BRI, Mandiri) dan E-Wallet (DANA, OVO, ShopeePay).
*   **Verifikasi Bukti Bayar Otomatis**: Setelah pemesanan dibuat, pengguna dapat mengunggah bukti transfer yang akan langsung terkirim dan merubah status booking menjadi `'diproses'` di sisi admin untuk divalidasi.
*   **QR Code Invoice**: Tiket digital dilengkapi dengan QR Code unik sebagai bukti check-in lapangan di lokasi.
*   **Notifikasi & Live Chat**: Pengguna dapat mengirim pesan bantuan langsung (Live Chat) ke admin/operator dan menerima notifikasi update status booking secara real-time.
*   **Turnamen & Event**: Halaman pendaftaran turnamen lokal yang sedang berlangsung, lengkap dengan daftar tim, hadiah, dan biaya pendaftaran.
*   **Profil & Membership**: Manajemen data pribadi beserta tingkatan keanggotaan (`regular`, `bronze`, `silver`, `gold`).

### 2. Sisi Operator & Admin (Dashboard Admin)
*   **Statistik & Analitik**: Visualisasi grafik pendapatan bulanan, pesanan terpopuler, total pengguna aktif, lapangan terfavorit, serta log aktivitas real-time.
*   **Validasi & Konfirmasi Booking**: Antarmuka khusus untuk meninjau bukti pembayaran yang diunggah pengguna. Admin dapat mengklik tombol **"Terima Pembayaran"** untuk menerbitkan QR Code dan merubah status booking menjadi `'dikonfirmasi'`, atau **"Tolak Pembayaran"** jika bukti tidak valid.
*   **Manajemen Fasilitas & Lapangan**: Fitur CRUD (Create, Read, Update, Delete) informasi lapangan, harga per jam, tipe lantai (Interlock, Vinyl, Rumput Sintetis), kapasitas, dan media (gambar/video).
*   **Manajemen Voucher & Promo**: Kontrol penuh atas masa berlaku kode promo, minimal pembelian, dan besaran diskon.
*   **Export SQL Backup Otomatis**: Tombol sekali klik di halaman Admin untuk mengekspor seluruh basis data saat ini menjadi file dump SQL `.sql` siap-pakai di server MySQL 8.0 / MariaDB nyata (didukung sistem XAMPP, phpMyAdmin, MySQL Workbench).

---

## 🛠️ ARSITEKTUR & TECH STACK

Aplikasi ini dibangun menggunakan arsitektur full-stack modern berkinerja tinggi:
1.  **Frontend**:
    *   **React 18** (TypeScript) untuk reaktivitas UI yang stabil dan aman.
    *   **Vite** sebagai build tool super cepat.
    *   **Tailwind CSS** dengan tema kustom *Sport Navy* & *Sport Green Bright* yang memberikan kesan premium, sporty, dan maskulin.
    *   **Framer Motion (motion/react)** untuk transisi halaman dan animasi mikro-interaksi.
    *   **Lucide React** untuk penyediaan set ikon yang seragam dan modern.
2.  **Backend**:
    *   **Node.js & Express** sebagai web server API.
    *   **Database Persistensi Statis (`data/db.json`)**: Mesin database lokal yang tangguh yang secara berkala membaca dan menulis data transaksi, sehingga semua data booking, user baru, dan lapangan tetap aman saat server restart.
    *   **SQL Dump Engine**: Generator skema SQL manual yang memetakan objek JavaScript menjadi skema tabel DDL & DML MySQL lengkap dengan relasi kunci asing (Foreign Keys).

---

## 👥 AKUN DEMO & AKSES CEPAT

Semua akun menggunakan verifikasi bypass password fleksibel (bisa menggunakan password apa saja untuk mempermudah pengujian/demo):

| Peran (Role) | Email | Nama Pengguna | Fitur Utama |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `superadmin@utmsport.com` | Rahmat Mulyadi (Admin) | Akses penuh seluruh dashboard, kontrol operator, konfigurasi sistem, & ekspor SQL |
| **Admin** | `admin@utmsport.com` | Admin UTM Sport | Verifikasi bukti pembayaran, kelola lapangan, kelola voucher, dan chat |
| **Operator** | `operator@utmsport.com` | Operator Lapangan | Kelola slot jadwal operasional harian lapangan |
| **User Biasa** | `user@utmsport.com` | Rahmat Mulyadi Fadillah | Booking lapangan, upload bukti bayar, klaim voucher, & chatting |

---

## 🗄️ STRUKTUR DATA & SKEMA DATABASE (MYSQL)

Sistem database relasional dari aplikasi ini memiliki tabel-tabel utama berikut yang saling terhubung:
1.  **`users`**: Menyimpan profil, peran (`admin`/`operator`/`user`), jumlah koin poin, kode referral, dan tipe keanggotaan.
2.  **`lapangan`**: Data informasi fisik lapangan, tipe permukaan lantai, tarif dasar, rating, dan status operasional.
3.  **`jadwal`**: Penjadwalan operasional 16 jam per hari untuk masing-masing lapangan.
4.  **`booking`**: Transaksi pemesanan induk yang mencatat nomor invoice, total tagihan, diskon, metode bayar, bukti bayar, dan status transaksi.
5.  **`booking_detail`**: Item pemesanan yang mencatat detail jam dan tanggal lapangan yang disewa dalam satu nomor transaksi invoice.
6.  **`voucher`** & **`promo`**: Pengaturan kode kupon pemotongan harga.
7.  **`review`**: Ulasan dan rating bintang dari pengguna setelah menyewa lapangan.
8.  **`chats`**: Log obrolan langsung antara admin dan pengguna.

---

## 💻 PANDUAN INSTALASI LOKAL

Ikuti langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

1.  **Persiapan Awal**:
    Pastikan Anda telah menginstal **Node.js** (versi 18 atau lebih baru).
2.  **Instalasi Dependensi**:
    Buka terminal di direktori proyek dan jalankan:
    ```bash
    npm install
    ```
3.  **Menjalankan Mode Pengembangan (Development)**:
    Jalankan perintah berikut untuk mengaktifkan server backend Express dan frontend Vite secara bersamaan:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di port **`http://localhost:3000`**.
4.  **Membangun untuk Produksi (Production Build)**:
    Untuk melakukan kompilasi siap-rilis:
    ```bash
    npm run build
    ```
    Lalu jalankan server produksi dengan:
    ```bash
    npm run start
    ```
---

