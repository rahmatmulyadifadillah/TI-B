<?php
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit();
}

// Check if cart is not empty
if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
    header('Location: cart.php');
    exit();
}

// Handle checkout process
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : '';
    $payment_account = isset($_POST['payment_account']) ? $_POST['payment_account'] : '';
    
    if (empty($payment_method)) {
        $error = 'Silakan pilih metode pembayaran!';
    } elseif (!in_array($payment_method, ['transfer_bni', 'transfer_bri', 'ewallet'])) {
        $error = 'Metode pembayaran tidak valid!';
    } elseif (empty($payment_account)) {
        $error = 'Nomor rekening pembayaran tidak valid!';
    } else {
        // Calculate total
        $total = 0;
        foreach ($_SESSION['cart'] as $item) {
            $total += $item['price'] * $item['qty'];
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Insert order with payment method and account
            $stmt = $conn->prepare("INSERT INTO orders (user_id, total, status, payment_method, payment_account) VALUES (?, ?, 'pending', ?, ?)");
            $stmt->bind_param("idss", $_SESSION['user_id'], $total, $payment_method, $payment_account);
            $stmt->execute();
            $order_id = $conn->insert_id;
            $stmt->close();
            
            // Insert order items
            foreach ($_SESSION['cart'] as $item) {
                $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiid", $order_id, $item['id'], $item['qty'], $item['price']);
                $stmt->execute();
                $stmt->close();
                
                // Update product stock
                $stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
                $stmt->bind_param("ii", $item['qty'], $item['id']);
                $stmt->execute();
                $stmt->close();
            }
            
            // Commit transaction
            $conn->commit();
            
            // Clear cart
            $_SESSION['cart'] = [];
            
            // Redirect to orders page
            header('Location: orders.php?success=1');
            exit();
            
        } catch (Exception $e) {
            $conn->rollback();
            $error = 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi. Error: ' . $e->getMessage();
        }
    }
}

// Calculate total
$total = 0;
foreach ($_SESSION['cart'] as $item) {
    $total += $item['price'] * $item['qty'];
}

// Get cart count
$cart_count = count($_SESSION['cart']);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - MulLucky Store</title>
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
        
        .footer {
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
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
        <h2 class="mb-4"><i class="fas fa-credit-card me-2"></i>Checkout</h2>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <?php echo $error; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <div class="row">
            <div class="col-lg-8">
                <!-- Order Summary -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Ringkasan Pesanan</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Harga</th>
                                        <th>Jumlah</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($_SESSION['cart'] as $item): ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <?php if ($item['image']): ?>
                                                    <img src="<?php echo $item['image']; ?>" class="img-thumbnail me-3" 
                                                         style="max-width: 50px;">
                                                <?php else: ?>
                                                    <div class="bg-light d-flex align-items-center justify-content-center me-3" 
                                                         style="width: 50px; height: 50px;">
                                                        <i class="fas fa-image text-muted"></i>
                                                    </div>
                                                <?php endif; ?>
                                                <span><?php echo $item['name']; ?></span>
                                            </div>
                                        </td>
                                        <td>Rp <?php echo number_format($item['price'], 0, ',', '.'); ?></td>
                                        <td><?php echo $item['qty']; ?></td>
                                        <td>Rp <?php echo number_format($item['price'] * $item['qty'], 0, ',', '.'); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Payment Method -->
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold">Metode Pembayaran</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="" id="checkoutForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="form-check card p-3" style="border-radius: 15px; cursor: pointer;">
                                        <input class="form-check-input" type="radio" name="payment_method" 
                                               id="bni" value="transfer_bni" onchange="updatePaymentAccount('1983424015')">
                                        <label class="form-check-label" for="bni">
                                            <i class="fas fa-university me-2 text-primary"></i>Transfer BNI
                                            <br><small class="text-muted">a.n. RAHMAT MUL YADI FADILLAH</small>
                                            <br><small class="text-muted">1983424015</small>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-check card p-3" style="border-radius: 15px; cursor: pointer;">
                                        <input class="form-check-input" type="radio" name="payment_method" 
                                               id="bri" value="transfer_bri" onchange="updatePaymentAccount('1983424015')">
                                        <label class="form-check-label" for="bri">
                                            <i class="fas fa-university me-2 text-success"></i>Transfer BRI
                                            <br><small class="text-muted">a.n. RAHMAT MUL YADI FADILLAH</small>
                                            <br><small class="text-muted">1983424015</small>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-check card p-3" style="border-radius: 15px; cursor: pointer;">
                                        <input class="form-check-input" type="radio" name="payment_method" 
                                               id="ewallet" value="ewallet" onchange="updatePaymentAccount('081339638842')">
                                        <label class="form-check-label" for="ewallet">
                                            <i class="fas fa-wallet me-2 text-warning"></i>E-Wallet
                                            <br><small class="text-muted">a.n. RAHMAT MUL YADI FADILLAH</small>
                                            <br><small class="text-muted">081339638842</small>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-3" style="border-radius: 15px;">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Rekening Admin:</strong><br>
                                • BNI: 1983424015 a.n. RAHMAT MUL YADI FADILLAH<br>
                                • BRI: 1983424015 a.n. RAHMAT MUL YADI FADILLAH<br>
                                • E-Wallet: 081339638842 a.n. RAHMAT MUL YADI FADILLAH
                            </div>
                            
                            <input type="hidden" name="payment_account" id="payment_account" value="">
                            
                            <button type="submit" class="btn btn-success btn-lg w-100" style="border-radius: 15px; background: linear-gradient(135deg, #667eea, #764ba2); border: none;">
                                <i class="fas fa-check me-2"></i>Bayar Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Detail Pembayaran</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <strong>Nama:</strong> <?php echo $_SESSION['username']; ?>
                        </div>
                        <div class="mb-3">
                            <strong>Email:</strong> <?php echo $_SESSION['email']; ?>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>Rp <?php echo number_format($total, 0, ',', '.'); ?></span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Ongkos Kirim</span>
                            <span class="text-success">Gratis</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong>Total Pembayaran</strong>
                            <strong class="text-primary fs-5">Rp <?php echo number_format($total, 0, ',', '.'); ?></strong>
                        </div>
                        <a href="cart.php" class="btn btn-outline-secondary w-100">
                            <i class="fas fa-arrow-left me-2"></i>Kembali ke Keranjang
                        </a>
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
    <script>
        function updatePaymentAccount(account) {
            document.getElementById('payment_account').value = account;
        }
        
        document.getElementById('checkoutForm').addEventListener('submit', function(e) {
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            const paymentAccount = document.getElementById('payment_account').value;
            
            if (!paymentMethod) {
                e.preventDefault();
                alert('Silakan pilih metode pembayaran terlebih dahulu!');
                return false;
            }
            
            if (!paymentAccount) {
                e.preventDefault();
                alert('Terjadi kesalahan dengan metode pembayaran. Silakan pilih ulang.');
                return false;
            }
            
            // Allow form to submit
            return true;
        });
    </script>
</body>
</html>
