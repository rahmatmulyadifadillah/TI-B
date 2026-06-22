<?php
require_once 'config/database.php';
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tentang Kami - MulLucky Store</title>
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
            padding: 100px 0 80px;
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
        
        .logo-text {
            font-size: 4rem;
            font-weight: 800;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 40px rgba(255,255,255,0.3);
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            position: relative;
        }
        
        .feature-card::before {
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
        
        .feature-card:hover::before {
            transform: translateX(100%);
        }
        
        .feature-card:hover {
            transform: translateY(-15px) scale(1.02);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .feature-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin: 0 auto 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
        }
        
        .team-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .team-card:hover {
            transform: translateY(-10px) rotateY(5deg);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .team-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 20px;
            border: 5px solid linear-gradient(135deg, #667eea, #764ba2);
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
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

    <div class="hero-section text-white">
        <div class="container hero-content">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="logo-text mb-4">🍀 MulLucky Store</h1>
                    <p class="lead mb-4">Platform belanja online terpercaya dengan produk berkualitas dan harga terjangkau</p>
                    <p class="mb-4">Kami berkomitmen untuk memberikan pengalaman belanja terbaik dengan layanan pelanggan yang responsif dan produk-produk pilihan dari berbagai kategori.</p>
                    <a href="index.php" class="btn btn-light btn-lg px-5 py-3" style="border-radius: 30px; font-weight: 600;">
                        <i class="fas fa-shopping-bag me-2"></i>Mulai Belanja
                    </a>
                </div>
                <div class="col-lg-6 text-center">
                    <div style="font-size: 15rem; animation: float 3s ease-in-out infinite;">🛍️</div>
                </div>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <h2 class="text-center mb-5 fw-bold" style="color: white;">Kenapa Memilih Kami?</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="feature-card p-5">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h4 class="text-center fw-bold mb-3">Terpercaya</h4>
                    <p class="text-center text-muted">Kami menjamin keamanan dan kualitas setiap produk yang kami jual</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="feature-card p-5">
                    <div class="feature-icon">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <h4 class="text-center fw-bold mb-3">Pengiriman Cepat</h4>
                    <p class="text-center text-muted">Layanan pengiriman cepat ke seluruh Indonesia dengan tracking real-time</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="feature-card p-5">
                    <div class="feature-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h4 class="text-center fw-bold mb-3">Layanan 24/7</h4>
                    <p class="text-center text-muted">Tim support kami siap membantu Anda kapan saja, 24 jam sehari</p>
                </div>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <div class="row align-items-center">
            <div class="col-lg-6 mb-4">
                <div class="feature-card p-5">
                    <h3 class="fw-bold mb-4" style="color: #667eea;">Tentang MulLucky Store</h3>
                    <p class="text-muted mb-3">MulLucky Store didirikan dengan visi untuk menjadi platform e-commerce terdepan di Indonesia yang menghubungkan pembeli dengan penjual terpercaya.</p>
                    <p class="text-muted mb-3">Kami percaya bahwa setiap pelanggan berhak mendapatkan pengalaman belanja yang nyaman, aman, dan menyenangkan. Oleh karena itu, kami terus berinovasi untuk meningkatkan layanan kami.</p>
                    <p class="text-muted">Dengan dukungan tim yang berdedikasi dan teknologi terkini, kami siap melayani kebutuhan belanja Anda dengan sepenuh hati.</p>
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <div style="font-size: 12rem; animation: float 3s ease-in-out infinite;">🎯</div>
            </div>
        </div>
    </div>

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
                        <li class="mb-2"><a href="contact.php" class="text-white text-decoration-none">Kontak Kami</a></li>
                        <li class="mb-2"><a href="how-to-order.php" class="text-white text-decoration-none">Cara Pesanan</a></li>
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
