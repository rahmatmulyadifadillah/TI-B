<?php
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit();
}

// Get product ID
$product_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Get product details
$stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$product) {
    header('Location: index.php');
    exit();
}

// Handle rating submission
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['rating'])) {
    $rating = intval($_POST['rating']);
    
    if ($rating >= 1 && $rating <= 5) {
        // Update product rating
        $new_rating_count = $product['rating_count'] + 1;
        $new_rating = (($product['rating'] * $product['rating_count']) + $rating) / $new_rating_count;
        
        $stmt = $conn->prepare("UPDATE products SET rating=?, rating_count=? WHERE id=?");
        $stmt->bind_param("ddi", $new_rating, $new_rating_count, $product_id);
        $stmt->execute();
        $stmt->close();
        
        // Refresh product data
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        $success = 'Terima kasih atas rating Anda!';
    }
}

// Get cart count
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $product['name']; ?> - Marketplace</title>
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
        
        .card {
            border: none;
            border-radius: 20px;
            position: relative;
            overflow: hidden;
        }
        
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .card:hover::before {
            left: 100%;
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
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.php">
                <i class="fas fa-shopping-bag me-2"></i>Marketplace
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.php" style="color: #667eea;">Beranda</a>
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

    <div class="container py-5">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="index.php">Beranda</a></li>
                <li class="breadcrumb-item active"><?php echo $product['name']; ?></li>
            </ol>
        </nav>

        <?php if (isset($success)): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <?php echo $success; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="row">
            <!-- Product Image -->
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm">
                    <?php if ($product['image']): ?>
                        <img src="<?php echo $product['image']; ?>" class="card-img-top" alt="<?php echo $product['name']; ?>" 
                             style="max-height: 400px; object-fit: contain;">
                    <?php else: ?>
                        <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                             style="height: 400px;">
                            <i class="fas fa-image fa-5x text-muted"></i>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Product Details -->
            <div class="col-md-6">
                <h1 class="mb-3"><?php echo $product['name']; ?></h1>
                
                <div class="mb-3">
                    <?php if ($product['rating_count'] > 0): ?>
                        <span class="text-warning fs-4">
                            <?php echo str_repeat('⭐', round($product['rating'])); ?>
                        </span>
                        <span class="text-muted ms-2"><?php echo $product['rating']; ?>/5.0 (<?php echo $product['rating_count']; ?> rating)</span>
                    <?php else: ?>
                        <span class="text-muted">Belum ada rating</span>
                    <?php endif; ?>
                </div>

                <h2 class="text-primary fw-bold mb-3">Rp <?php echo number_format($product['price'], 0, ',', '.'); ?></h2>

                <div class="mb-3">
                    <strong>Stok:</strong> <?php echo $product['stock']; ?> unit
                </div>

                <div class="mb-4">
                    <h5>Deskripsi</h5>
                    <p class="text-muted"><?php echo nl2br($product['description']); ?></p>
                </div>

                <?php if ($product['stock'] > 0): ?>
                    <div class="d-grid gap-2">
                        <a href="cart.php?action=add&id=<?php echo $product['id']; ?>" class="btn btn-primary btn-lg">
                            <i class="fas fa-cart-plus me-2"></i>Tambah ke Keranjang
                        </a>
                    </div>
                <?php else: ?>
                    <button class="btn btn-secondary btn-lg" disabled>
                        <i class="fas fa-times me-2"></i>Stok Habis
                    </button>
                <?php endif; ?>
            </div>
        </div>

        <!-- Rating Section -->
        <div class="row mt-5">
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Beri Rating Produk Ini</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="">
                            <div class="mb-3">
                                <label class="form-label">Pilih Rating (1-5 Bintang)</label>
                                <div class="btn-group" role="group">
                                    <input type="radio" class="btn-check" name="rating" id="star1" value="1" required>
                                    <label class="btn btn-outline-warning" for="star1">1 ⭐</label>
                                    
                                    <input type="radio" class="btn-check" name="rating" id="star2" value="2">
                                    <label class="btn btn-outline-warning" for="star2">2 ⭐</label>
                                    
                                    <input type="radio" class="btn-check" name="rating" id="star3" value="3">
                                    <label class="btn btn-outline-warning" for="star3">3 ⭐</label>
                                    
                                    <input type="radio" class="btn-check" name="rating" id="star4" value="4">
                                    <label class="btn btn-outline-warning" for="star4">4 ⭐</label>
                                    
                                    <input type="radio" class="btn-check" name="rating" id="star5" value="5">
                                    <label class="btn btn-outline-warning" for="star5">5 ⭐</label>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">Kirim Rating</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>Marketplace</h5>
                    <p class="text-muted">Platform belanja online terpercaya</p>
                </div>
                <div class="col-md-6">
                    <h5>Kontak</h5>
                    <p class="text-muted">Email: info@marketplace.com</p>
                </div>
            </div>
            <hr class="bg-secondary">
            <p class="text-muted text-center mb-0">&copy; 2024 Marketplace. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
