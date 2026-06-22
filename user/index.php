<?php
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit();
}

// Search functionality
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$show_all = isset($_GET['show_all']) ? true : false;

// Get latest products for homepage (limit 6 unless show_all is true)
if ($search) {
    $stmt = $conn->prepare("SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT 20");
    $search_param = "%$search%";
    $stmt->bind_param("ss", $search_param, $search_param);
    $stmt->execute();
    $products = $stmt->get_result();
} else if ($show_all) {
    $products = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
} else {
    $products = $conn->query("SELECT * FROM products ORDER BY created_at DESC LIMIT 6");
}

// Get cart count
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - MulLucky Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .navbar {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-brand {
            font-weight: 800;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero-section {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
            border-radius: 30px;
            margin: 20px 0;
            padding: 60px 40px;
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
        
        .product-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            position: relative;
        }
        
        .product-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .product-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .product-card:hover::before {
            left: 100%;
        }
        
        .product-image {
            height: 200px;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .product-card:hover .product-image {
            transform: scale(1.1);
        }
        
        .footer {
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .contact-item {
            transition: all 0.3s ease;
        }
        
        .contact-item:hover {
            transform: translateY(-5px);
            color: #fff !important;
        }
        
        /* Floating particles animation */
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
        
        @keyframes float {
            0%, 100% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
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

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.php">
                <i class="fas fa-shopping-bag me-2"></i>MulLucky Store
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="index.php" style="color: #667eea;">Beranda</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../about.php" style="color: #333;">Tentang Kami</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="orders.php" style="color: #333;">Pesanan Saya</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="cart.php" style="color: #333;">
                            <i class="fas fa-shopping-cart me-1"></i>Keranjang
                            <?php if ($cart_count > 0): ?>
                                <span class="badge bg-danger"><?php echo $cart_count; ?></span>
                            <?php endif; ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../how-to-order.php" style="color: #333;">Cara Pesanan</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../contact.php" style="color: #333;">Kontak Kami</a>
                    </li>
                </ul>
                <form class="d-flex me-3" method="GET" action="index.php">
                    <input class="form-control me-2" type="search" name="search" placeholder="Cari produk..." 
                           value="<?php echo htmlspecialchars($search); ?>" style="border-radius: 20px;">
                    <button class="btn btn-primary" type="submit" style="border-radius: 20px;">Cari</button>
                </form>
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle text-dark" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i><?php echo $_SESSION['username']; ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="../logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="container">
        <div class="hero-section text-white spotlight">
            <div class="hero-content">
                <h1 class="display-4 fw-bold mb-3 neon-text">🍀 Welcome To MulLucky Store</h1>
                <p class="lead">Temukan produk terbaik dengan harga terjangkau</p>
                <a href="index.php?show_all=1" class="btn btn-light btn-lg mt-3" style="border-radius: 20px;">
                    <i class="fas fa-shopping-bag me-2"></i>Mulai Belanja
                </a>
            </div>
        </div>
    </div>

    <!-- Products Grid -->
    <div class="container mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold mb-0" style="color: white;"><?php echo $search ? "Hasil Pencarian: '$search'" : 'Produk Terbaru'; ?></h2>
            <?php if (!$show_all): ?>
                <a href="index.php?show_all=1" class="btn btn-light" style="border-radius: 15px;">
                    <i class="fas fa-th-large me-2"></i>Lihat Semua Produk
                </a>
            <?php endif; ?>
        </div>
        
        <?php if ($products->num_rows > 0): ?>
            <div class="row">
                <?php while ($product = $products->fetch_assoc()): ?>
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card product-card h-100 shadow-sm light-beam">
                            <?php if ($product['image']): ?>
                                <img src="<?php echo $product['image']; ?>" class="card-img-top product-image" 
                                     alt="<?php echo $product['name']; ?>">
                            <?php else: ?>
                                <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                                     style="height: 200px;">
                                    <i class="fas fa-image fa-3x text-muted"></i>
                                </div>
                            <?php endif; ?>
                            <div class="card-body">
                                <h5 class="card-title fw-bold"><?php echo $product['name']; ?></h5>
                                <p class="card-text text-muted small"><?php echo substr($product['description'], 0, 100); ?>...</p>
                                <div class="mb-2">
                                    <?php if ($product['rating_count'] > 0): ?>
                                        <span class="text-warning">
                                            <?php echo str_repeat('⭐', round($product['rating'])); ?>
                                        </span>
                                        <small class="text-muted">(<?php echo $product['rating_count']; ?>)</small>
                                    <?php else: ?>
                                        <small class="text-muted">Belum ada rating</small>
                                    <?php endif; ?>
                                </div>
                                <h6 class="fw-bold" style="color: #667eea;">Rp <?php echo number_format($product['price'], 0, ',', '.'); ?></h6>
                                <small class="text-muted">Stok: <?php echo $product['stock']; ?></small>
                            </div>
                            <div class="card-footer bg-white border-top-0">
                                <div class="d-grid gap-2">
                                    <a href="product.php?id=<?php echo $product['id']; ?>" class="btn btn-outline-primary" style="border-radius: 15px;">
                                        <i class="fas fa-eye me-1"></i>Detail
                                    </a>
                                    <?php if ($product['stock'] > 0): ?>
                                        <a href="cart.php?action=add&id=<?php echo $product['id']; ?>" class="btn btn-primary" style="border-radius: 15px; background: linear-gradient(135deg, #667eea, #764ba2); border: none;">
                                            <i class="fas fa-cart-plus me-1"></i>Tambah ke Keranjang
                                        </a>
                                    <?php else: ?>
                                        <button class="btn btn-secondary" disabled style="border-radius: 15px;">
                                            <i class="fas fa-times me-1"></i>Stok Habis
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
        <?php else: ?>
            <div class="alert alert-info" style="border-radius: 20px;">
                <i class="fas fa-info-circle me-2"></i>
                <?php echo $search ? "Tidak ada produk yang ditemukan untuk '$search'" : "Belum ada produk tersedia"; ?>
            </div>
        <?php endif; ?>
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
                    <div class="contact-item mb-2">
                        <a href="https://wa.me/6281339638842" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-whatsapp me-2"></i>081339638842
                        </a>
                    </div>
                    <div class="contact-item mb-2">
                        <a href="https://instagram.com/rhmtmlydi__" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-instagram me-2"></i>@rhmtmlydi__
                        </a>
                    </div>
                    <div class="contact-item mb-2">
                        <a href="mailto:rahmatmulyadifadillah@gmail.com" class="text-white text-decoration-none">
                            <i class="fas fa-envelope me-2"></i>rahmatmulyadifadillah@gmail.com
                        </a>
                    </div>
                    <div class="contact-item mb-2">
                        <a href="https://maps.google.com/?q=Jl.+Pelor+Mas+Raya+No.III,+Kekalik+Jaya,+Kec.+Sekarbela,+Kota+Mataram,+Nusa+Tenggara+Bar.+83126" target="_blank" class="text-white text-decoration-none">
                            <i class="fas fa-map-marker-alt me-2"></i>Jl. Pelor Mas Raya No.III, Kekalik Jaya, Kec. Sekarbela, Kota Mataram, Nusa Tenggara Bar. 83126
                        </a>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Menu</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="index.php" class="text-white text-decoration-none">Beranda</a></li>
                        <li class="mb-2"><a href="cart.php" class="text-white text-decoration-none">Keranjang</a></li>
                        <li class="mb-2"><a href="orders.php" class="text-white text-decoration-none">Pesanan Saya</a></li>
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
