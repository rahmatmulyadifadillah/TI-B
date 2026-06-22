<?php
require_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $message = trim($_POST['message']);
    
    if (empty($name) || empty($email) || empty($message)) {
        $error = 'Semua field harus diisi!';
    } else {
       
        $success = 'Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.';
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kontak Kami - MulLucky Store</title>
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
        
        .contact-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
        }
        
        .contact-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
        }
        
        .contact-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: white;
            margin: 0 auto 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
        }
        
        .form-control {
            border-radius: 15px;
            padding: 15px 20px;
            border: 2px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            transform: translateY(-2px);
        }
        
        .btn-submit {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            border-radius: 15px;
            padding: 15px 40px;
            font-weight: 600;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }
        
        .btn-submit:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
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
                    <h1 class="fw-bold mb-4" style="font-size: 3rem;">🍀 Kontak Kami</h1>
                    <p class="lead mb-4">Hubungi kami untuk pertanyaan, saran, atau kerjasama bisnis</p>
                    <p class="mb-4">Tim support kami siap membantu Anda 24/7 dengan sepenuh hati</p>
                </div>
                <div class="col-lg-6 text-center">
                    <div style="font-size: 12rem; animation: float 3s ease-in-out infinite;">📞</div>
                </div>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <h2 class="text-center mb-5 fw-bold" style="color: white;">Informasi Kontak</h2>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="contact-card p-5 text-center">
                    <div class="contact-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <h4 class="fw-bold mb-3">WhatsApp</h4>
                    <p class="text-muted mb-3">Hubungi kami melalui WhatsApp untuk respon cepat</p>
                    <a href="https://wa.me/6281339638842" target="_blank" class="btn btn-outline-success" style="border-radius: 15px;">
                        <i class="fab fa-whatsapp me-2"></i>081339638842
                    </a>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="contact-card p-5 text-center">
                    <div class="contact-icon">
                        <i class="fab fa-instagram"></i>
                    </div>
                    <h4 class="fw-bold mb-3">Instagram</h4>
                    <p class="text-muted mb-3">Follow kami untuk update produk dan promo</p>
                    <a href="https://instagram.com/rhmtmlydi__" target="_blank" class="btn btn-outline-danger" style="border-radius: 15px;">
                        <i class="fab fa-instagram me-2"></i>@rhmtmlydi__
                    </a>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="contact-card p-5 text-center">
                    <div class="contact-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h4 class="fw-bold mb-3">Email</h4>
                    <p class="text-muted mb-3">Kirim email untuk pertanyaan detail</p>
                    <a href="mailto:rahmatmulyadifadillah@gmail.com" class="btn btn-outline-primary" style="border-radius: 15px;">
                        <i class="fas fa-envelope me-2"></i>Kirim Email
                    </a>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="contact-card p-5 text-center">
                    <div class="contact-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <h4 class="fw-bold mb-3">Alamat</h4>
                    <p class="text-muted mb-3">Kunjungi toko kami di lokasi berikut</p>
                    <p class="small text-muted mb-3">
                        Jl. Pelor Mas Raya No.III<br>
                        Kekalik Jaya, Kec. Sekarbela<br>
                        Kota Mataram, Nusa Tenggara Bar.<br>
                        83126
                    </p>
                    <a href="https://maps.google.com/?q=Jl.+Pelor+Mas+Raya+No.III,+Kekalik+Jaya,+Kec.+Sekarbela,+Kota+Mataram,+Nusa+Tenggara+Bar.+83126" target="_blank" class="btn btn-outline-info" style="border-radius: 15px;">
                        <i class="fas fa-map me-2"></i>Buka di Maps
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="contact-card p-4">
                    <h3 class="fw-bold mb-4 text-center" style="color: #667eea;">📍 Lokasi Kami</h3>
                    <div class="ratio ratio-21x9" style="border-radius: 20px; overflow: hidden;">
                        <iframe 
                            src="https://maps.google.com/maps?q=Jl.+Pelor+Mas+Raya+No.III,+Kekalik+Jaya,+Kec.+Sekarbela,+Kota+Mataram,+Nusa+Tenggara+Bar.+83126&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="contact-card p-5">
                    <h3 class="fw-bold mb-4 text-center" style="color: #667eea;">Kirim Pesan</h3>
                    
                    <?php if (isset($success)): ?>
                        <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 15px;">
                            <?php echo $success; ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    <?php endif; ?>
                    
                    <?php if (isset($error)): ?>
                        <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 15px;">
                            <?php echo $error; ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST" action="">
                        <div class="mb-3">
                            <label for="name" class="form-label fw-semibold">Nama Lengkap</label>
                            <input type="text" class="form-control" id="name" name="name" required placeholder="Masukkan nama Anda">
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required placeholder="Masukkan email Anda">
                        </div>
                        <div class="mb-4">
                            <label for="message" class="form-label fw-semibold">Pesan</label>
                            <textarea class="form-control" id="message" name="message" rows="5" required placeholder="Tulis pesan Anda"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-submit w-100">
                            <i class="fas fa-paper-plane me-2"></i>Kirim Pesan
                        </button>
                    </form>
                </div>
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
                        <li class="mb-2"><a href="about.php" class="text-white text-decoration-none">Tentang Kami</a></li>
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
