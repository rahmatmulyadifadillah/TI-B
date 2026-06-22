<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cara Pesanan - MulLucky Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .hero-section {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
            border-radius: 0 0 50px 50px;
            padding: 80px 0 60px;
            position: relative;
            overflow: hidden;
        }
        
        .hero-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
        }
        
        .step-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            position: relative;
        }
        
        .step-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s;
        }
        
        .step-card:hover::before {
            transform: translateX(100%);
        }
        
        .step-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .step-number {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 800;
            color: white;
            margin: 0 auto 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
        }
        
        .warning-card {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.95), rgba(255, 152, 0, 0.95));
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .warning-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .payment-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .payment-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .footer {
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }
        
        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float 20s infinite;
        }
    </style>
</head>
<body>
    <!-- Floating Particles -->
    <div class="particles">
        <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
        <div class="particle" style="left: 20%; animation-delay: 2s;"></div>
        <div class="particle" style="left: 30%; animation-delay: 4s;"></div>
        <div class="particle" style="left: 40%; animation-delay: 6s;"></div>
        <div class="particle" style="left: 50%; animation-delay: 8s;"></div>
        <div class="particle" style="left: 60%; animation-delay: 10s;"></div>
        <div class="particle" style="left: 70%; animation-delay: 12s;"></div>
        <div class="particle" style="left: 80%; animation-delay: 14s;"></div>
        <div class="particle" style="left: 90%; animation-delay: 16s;"></div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section text-white">
        <div class="container hero-content">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="fw-bold mb-4" style="font-size: 3rem;">📋 Cara Pesanan</h1>
                    <p class="lead mb-4">Panduan lengkap cara berbelanja di MulLucky Store</p>
                    <p class="mb-4">Ikuti langkah-langkah mudah di bawah ini untuk pengalaman belanja yang menyenangkan</p>
                </div>
                <div class="col-lg-6 text-center">
                    <div style="font-size: 12rem; animation: float 3s ease-in-out infinite;">🛒</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Steps Section -->
    <div class="container py-5">
        <h2 class="text-center mb-5 fw-bold" style="color: white;">Langkah-langkah Pesanan</h2>
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="step-card p-5 text-center">
                    <div class="step-number">1</div>
                    <h4 class="fw-bold mb-3">Pilih Produk</h4>
                    <p class="text-muted">Telusuri katalog produk dan pilih barang yang Anda inginkan</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="step-card p-5 text-center">
                    <div class="step-number">2</div>
                    <h4 class="fw-bold mb-3">Tambah ke Keranjang</h4>
                    <p class="text-muted">Klik tombol "Tambah ke Keranjang" pada produk yang dipilih</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="step-card p-5 text-center">
                    <div class="step-number">3</div>
                    <h4 class="fw-bold mb-3">Checkout</h4>
                    <p class="text-muted">Review pesanan dan pilih metode pembayaran</p>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="step-card p-5 text-center">
                    <div class="step-number">4</div>
                    <h4 class="fw-bold mb-3">Bayar</h4>
                    <p class="text-muted">Lakukan pembayaran dan tunggu konfirmasi admin</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Cancellation Policy Section -->
    <div class="container py-5">
        <div class="warning-card p-5 text-white">
            <h3 class="fw-bold mb-4 text-center"><i class="fas fa-exclamation-triangle me-2"></i>Kebijakan Pembatalan Pesanan</h3>
            <div class="row">
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">⏰ Batas Waktu Pembatalan</h5>
                    <p class="mb-3">Pesanan dapat dibatalkan dalam waktu <strong>30 menit</strong> setelah pesanan dibuat.</p>
                    <p class="mb-3">Setelah melewati batas waktu 30 menit, pesanan tidak dapat dibatalkan dan akan diproses oleh admin.</p>
                </div>
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">📝 Cara Membatalkan</h5>
                    <ol class="mb-3">
                        <li>Login ke akun Anda</li>
                        <li>Buka menu "Pesanan Saya"</li>
                        <li>Klik tombol "Batal" pada pesanan yang ingin dibatalkan</li>
                        <li>Konfirmasi pembatalan</li>
                    </ol>
                    <p class="text-white-50 small">Stok produk akan dikembalikan setelah pembatalan berhasil</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Methods Section -->
    <div class="container py-5">
        <h2 class="text-center mb-5 fw-bold" style="color: white;">Metode Pembayaran</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="payment-card p-5 text-center">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏦</div>
                    <h4 class="fw-bold mb-3">Transfer BNI</h4>
                    <p class="text-muted mb-2">No. Rekening: <strong>1983424015</strong></p>
                    <p class="text-muted mb-2">a.n. <strong>RAHMAT MUL YADI FADILLAH</strong></p>
                    <p class="text-muted small">Transfer ke rekening BNI</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="payment-card p-5 text-center">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏦</div>
                    <h4 class="fw-bold mb-3">Transfer BRI</h4>
                    <p class="text-muted mb-2">No. Rekening: <strong>1983424015</strong></p>
                    <p class="text-muted mb-2">a.n. <strong>RAHMAT MUL YADI FADILLAH</strong></p>
                    <p class="text-muted small">Transfer ke rekening BRI</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="payment-card p-5 text-center">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📱</div>
                    <h4 class="fw-bold mb-3">E-Wallet</h4>
                    <p class="text-muted mb-2">No. HP: <strong>081339638842</strong></p>
                    <p class="text-muted mb-2">a.n. <strong>RAHMAT MUL YADI FADILLAH</strong></p>
                    <p class="text-muted small">Dana, OVO, Gopay, atau ShopeePay</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Important Notes Section -->
    <div class="container py-5">
        <div class="step-card p-5">
            <h3 class="fw-bold mb-4 text-center" style="color: #667eea;"><i class="fas fa-info-circle me-2"></i>Catatan Penting</h3>
            <div class="row">
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Pastikan data pesanan sudah benar sebelum checkout</li>
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Lakukan pembayaran sesuai total pesanan</li>
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Screenshot bukti transfer untuk konfirmasi</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Pesanan akan diproses setelah pembayaran terkonfirmasi</li>
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Admin akan menghubungi jika ada kendala</li>
                        <li class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Hubungi admin jika ada pertanyaan</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h4 class="fw-bold mb-3">🍀 MulLucky Store</h4>
                    <p class="text-muted">Platform belanja online terpercaya dengan produk berkualitas</p>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Hubungi Kami</h5>
                    <div class="mb-2">
                        <a href="https://wa.me/6281339638842" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-whatsapp me-2"></i>081339638842
                        </a>
                    </div>
                    <div class="mb-2">
                        <a href="https://instagram.com/rhmtmlydi__" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-instagram me-2"></i>@rhmtmlydi__
                        </a>
                    </div>
                    <div class="mb-2">
                        <a href="mailto:rahmatmulyadifadillah@gmail.com" class="text-white text-decoration-none">
                            <i class="fas fa-envelope me-2"></i>rahmatmulyadifadillah@gmail.com
                        </a>
                    </div>
                    <div class="mb-2">
                        <a href="https://maps.google.com/?q=Jl.+Pelor+Mas+Raya+No.III,+Kekalik+Jaya,+Kec.+Sekarbela,+Kota+Mataram,+Nusa+Tenggara+Bar.+83126" target="_blank" class="text-white text-decoration-none">
                            <i class="fas fa-map-marker-alt me-2"></i>Jl. Pelor Mas Raya No.III, Kekalik Jaya, Kec. Sekarbela, Kota Mataram, Nusa Tenggara Bar. 83126
                        </a>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Menu</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="index.php" class="text-white text-decoration-none">Beranda</a></li>
                        <li class="mb-2"><a href="about.php" class="text-white text-decoration-none">Tentang Kami</a></li>
                        <li class="mb-2"><a href="contact.php" class="text-white text-decoration-none">Kontak Kami</a></li>
                    </ul>
                </div>
            </div>
            <hr class="bg-secondary">
            <p class="text-muted text-center mb-0">&copy; 2024 MulLucky Store. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
