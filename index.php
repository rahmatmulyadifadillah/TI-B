<?php
require_once 'config/database.php';

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] == 'admin') {
        header('Location: admin/dashboard.php');
    } else {
        header('Location: user/index.php');
    }
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>MulLucky Store - Pilih Akses</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
        }
        
        .choice-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            border-radius: 25px;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .choice-card:hover {
            transform: translateY(-15px) scale(1.05);
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        
        .choice-icon {
            font-size: 5rem;
            margin-bottom: 25px;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .admin-card {
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            position: relative;
            overflow: hidden;
        }
        
        .admin-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .user-card {
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
            position: relative;
            overflow: hidden;
        }
        
        .user-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 25s linear infinite reverse;
        }
        
        .register-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            position: relative;
            overflow: hidden;
        }
        
        .register-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 30s linear infinite;
        }
        
        .logo-text {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(255,255,255,0.3);
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 20px rgba(255,255,255,0.3); }
            to { text-shadow: 0 0 40px rgba(255,255,255,0.6); }
        }
        
        .contact-info {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .contact-item {
            transition: all 0.3s ease;
        }
        
        .contact-item:hover {
            transform: translateY(-5px);
            color: #fff !important;
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

    <div class="container">
        <div class="text-center mb-5 fade-in">
            <h1 class="logo-text mb-3">🍀 MulLucky Store</h1>
            <p class="text-white fs-4 fw-light">Pilih akses untuk melanjutkan</p>
        </div>

        <div class="row g-4">

            <div class="col-md-4 slide-in-left">
                <div class="card choice-card admin-card text-white h-100">
                    <div class="card-body text-center py-5" style="position: relative; z-index: 1;">
                        <i class="fas fa-user-shield choice-icon"></i>
                        <h3 class="fw-bold mb-3">Admin</h3>
                        <p class="mb-4">Login sebagai administrator untuk mengelola produk dan pesanan</p>
                        <a href="login.php?role=admin" class="btn btn-light btn-lg w-100 fw-bold">
                            <i class="fas fa-sign-in-alt me-2"></i>Login Admin
                        </a>
                    </div>
                </div>
            </div>

            <div class="col-md-4 fade-in">
                <div class="card choice-card user-card text-white h-100">
                    <div class="card-body text-center py-5" style="position: relative; z-index: 1;">
                        <i class="fas fa-user choice-icon"></i>
                        <h3 class="fw-bold mb-3">User</h3>
                        <p class="mb-4">Login sebagai pembeli untuk berbelanja produk</p>
                        <a href="login.php?role=user" class="btn btn-light btn-lg w-100 fw-bold">
                            <i class="fas fa-sign-in-alt me-2"></i>Login User
                        </a>
                    </div>
                </div>
            </div>

            <div class="col-md-4 slide-in-right">
                <div class="card choice-card register-card text-white h-100">
                    <div class="card-body text-center py-5" style="position: relative; z-index: 1;">
                        <i class="fas fa-user-plus choice-icon"></i>
                        <h3 class="fw-bold mb-3">Daftar</h3>
                        <p class="mb-4">Buat akun baru untuk mulai berbelanja</p>
                        <a href="register.php" class="btn btn-light btn-lg w-100 fw-bold">
                            <i class="fas fa-user-plus me-2"></i>Buat Akun
                        </a>
                    </div>
                </div>
            </div>
        </div>


        <div class="row mt-4 fade-in">
            <div class="col-12">
                <div class="card contact-info text-white text-center">
                    <div class="card-body py-4">
                        <h5 class="fw-bold mb-4"><i class="fas fa-address-book me-2"></i>Hubungi Kami</h5>
                        <div class="row justify-content-center">
                            <div class="col-md-4 mb-3">
                                <a href="https://wa.me/6281339638842" target="_blank" class="contact-item text-white text-decoration-none d-block">
                                    <i class="fab fa-whatsapp fa-2x mb-2"></i><br>
                                    <strong>WhatsApp</strong><br>
                                    081339638842
                                </a>
                            </div>
                            <div class="col-md-4 mb-3">
                                <a href="https://instagram.com/rhmtmlyi__" target="_blank" class="contact-item text-white text-decoration-none d-block">
                                    <i class="fab fa-instagram fa-2x mb-2"></i><br>
                                    <strong>Instagram</strong><br>
                                    @rhmtmlyi__
                                </a>
                            </div>
                            <div class="col-md-4 mb-3">
                                <a href="mailto:rahmatmulyadifadillah@gmail.com" class="contact-item text-white text-decoration-none d-block">
                                    <i class="fas fa-envelope fa-2x mb-2"></i><br>
                                    <strong>Email</strong><br>
                                    rahmatmulyadifadillah@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>