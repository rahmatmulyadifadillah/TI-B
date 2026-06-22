<?php
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit();
}

// Handle Cancel Order
if (isset($_GET['cancel'])) {
    $order_id = $_GET['cancel'];
    
    // Get order details
    $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $order_id, $_SESSION['user_id']);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if ($order) {
        // Check if order is within 30 minutes
        $order_time = strtotime($order['created_at']);
        $current_time = time();
        $time_diff = ($current_time - $order_time) / 60; // in minutes
        
        if ($time_diff <= 30 && $order['status'] == 'pending') {
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // Update order status
                $stmt = $conn->prepare("UPDATE orders SET status = 'dibatalkan' WHERE id = ?");
                $stmt->bind_param("i", $order_id);
                $stmt->execute();
                $stmt->close();
                
                // Restore stock
                $order_items = $conn->query("SELECT product_id, qty FROM order_items WHERE order_id = $order_id");
                while ($item = $order_items->fetch_assoc()) {
                    $stmt = $conn->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
                    $stmt->bind_param("ii", $item['qty'], $item['product_id']);
                    $stmt->execute();
                    $stmt->close();
                }
                
                $conn->commit();
                header('Location: orders.php?cancelled=1');
                exit();
            } catch (Exception $e) {
                $conn->rollback();
                $error = 'Gagal membatalkan pesanan. Silakan coba lagi.';
            }
        } else {
            $error = 'Pesanan tidak dapat dibatalkan. Batas waktu pembatalan adalah 30 menit setelah pesanan dibuat.';
        }
    }
}

// Get user's orders
$stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$orders = $stmt->get_result();
$stmt->close();

// Get cart count
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesanan Saya - MulLucky Store</title>
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
        
        .table {
            border-radius: 15px;
            overflow: hidden;
        }
        
        .table thead th {
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            border: none;
        }
        
        .badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 500;
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
                        <a class="nav-link active" href="orders.php" style="color: #667eea;">Pesanan Saya</a>
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
        <h2 class="mb-4 fw-bold" style="color: white;"><i class="fas fa-shopping-bag me-2"></i>Pesanan Saya</h2>
        
        <?php if (isset($_GET['cancelled'])): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 15px;">
                <i class="fas fa-check-circle me-2"></i>Pesanan berhasil dibatalkan!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 15px;">
                <?php echo $error; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <?php if (isset($_GET['success'])): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 15px;">
                <i class="fas fa-check-circle me-2"></i>Pesanan berhasil dibuat! Admin akan memproses pesanan Anda segera.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        
        <?php if ($orders->num_rows > 0): ?>
            <div class="card shadow-sm" style="border-radius: 20px; border: none;">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID Pesanan</th>
                                    <th>Tanggal</th>
                                    <th>Total</th>
                                    <th>Metode Pembayaran</th>
                                    <th>Status</th>
                                    <th>Detail</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while ($order = $orders->fetch_assoc()): 
                                    // Check if order can be cancelled (within 30 minutes and pending status)
                                    $order_time = strtotime($order['created_at']);
                                    $current_time = time();
                                    $time_diff = ($current_time - $order_time) / 60; // in minutes
                                    $can_cancel = ($time_diff <= 30 && $order['status'] == 'pending');
                                ?>
                                <tr>
                                    <td>#<?php echo $order['id']; ?></td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?></td>
                                    <td>Rp <?php echo number_format($order['total'], 0, ',', '.'); ?></td>
                                    <td>
                                        <?php
                                        $payment_name = '';
                                        switch ($order['payment_method']) {
                                            case 'transfer_bni': $payment_name = 'Transfer BNI'; break;
                                            case 'transfer_bri': $payment_name = 'Transfer BRI'; break;
                                            case 'ewallet': $payment_name = 'E-Wallet'; break;
                                            default: $payment_name = '-';
                                        }
                                        echo $payment_name;
                                        ?>
                                    </td>
                                    <td>
                                        <?php
                                        $status_class = '';
                                        switch ($order['status']) {
                                            case 'pending': $status_class = 'bg-warning'; break;
                                            case 'diproses': $status_class = 'bg-info'; break;
                                            case 'dikirim': $status_class = 'bg-primary'; break;
                                            case 'selesai': $status_class = 'bg-success'; break;
                                            case 'dibatalkan': $status_class = 'bg-danger'; break;
                                        }
                                        ?>
                                        <span class="badge <?php echo $status_class; ?>"><?php echo ucfirst($order['status']); ?></span>
                                    </td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-info" style="border-radius: 10px;" data-bs-toggle="modal" 
                                                data-bs-target="#orderDetail<?php echo $order['id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <?php if ($can_cancel): ?>
                                            <a href="orders.php?cancel=<?php echo $order['id']; ?>" class="btn btn-sm btn-danger" style="border-radius: 10px;"
                                               onclick="return confirm('Yakin ingin membatalkan pesanan ini?')">
                                                <i class="fas fa-times"></i> Batal
                                            </a>
                                        <?php else: ?>
                                            <button class="btn btn-sm btn-secondary" style="border-radius: 10px;" disabled>
                                                <i class="fas fa-ban"></i>
                                            </button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                
                                <!-- Order Detail Modal -->
                                <div class="modal fade" id="orderDetail<?php echo $order['id']; ?>" tabindex="-1">
                                    <div class="modal-dialog modal-lg">
                                        <div class="modal-content" style="border-radius: 20px; border: none;">
                                            <div class="modal-header">
                                                <h5 class="modal-title fw-bold">Detail Pesanan #<?php echo $order['id']; ?></h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <div class="row mb-3">
                                                    <div class="col-md-6">
                                                        <strong>Tanggal:</strong> <?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <strong>Status:</strong> <?php echo ucfirst($order['status']); ?>
                                                    </div>
                                                </div>
                                                <div class="row mb-3">
                                                    <div class="col-md-6">
                                                        <strong>Total:</strong> Rp <?php echo number_format($order['total'], 0, ',', '.'); ?>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <strong>Metode Pembayaran:</strong> <?php echo $payment_name; ?>
                                                    </div>
                                                </div>
                                                <?php if ($order['payment_account']): ?>
                                                <div class="row mb-3">
                                                    <div class="col-md-6">
                                                        <strong>No. Rekening:</strong> <?php echo $order['payment_account']; ?>
                                                    </div>
                                                </div>
                                                <?php endif; ?>
                                                <div class="alert alert-warning" style="border-radius: 15px;">
                                                    <i class="fas fa-clock me-2"></i>
                                                    <?php if ($can_cancel): ?>
                                                        Pesanan dapat dibatalkan dalam <?php echo ceil(30 - $time_diff); ?> menit lagi.
                                                    <?php else: ?>
                                                        <?php if ($order['status'] == 'pending'): ?>
                                                            Batas waktu pembatalan (30 menit) telah berlalu.
                                                        <?php else: ?>
                                                            Pesanan sudah <?php echo $order['status']; ?> dan tidak dapat dibatalkan.
                                                        <?php endif; ?>
                                                    <?php endif; ?>
                                                </div>
                                                <hr>
                                                <h6 class="fw-bold">Item Pesanan:</h6>
                                                <?php
                                                $order_items = $conn->query("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = " . $order['id']);
                                                ?>
                                                <table class="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Produk</th>
                                                            <th>Harga</th>
                                                            <th>Qty</th>
                                                            <th>Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php while ($item = $order_items->fetch_assoc()): ?>
                                                        <tr>
                                                            <td>
                                                                <?php if ($item['image']): ?>
                                                                    <img src="<?php echo $item['image']; ?>" class="img-thumbnail me-2" style="max-width: 40px; border-radius: 8px;">
                                                                <?php endif; ?>
                                                                <?php echo $item['name']; ?>
                                                            </td>
                                                            <td>Rp <?php echo number_format($item['price'], 0, ',', '.'); ?></td>
                                                            <td><?php echo $item['qty']; ?></td>
                                                            <td>Rp <?php echo number_format($item['price'] * $item['qty'], 0, ',', '.'); ?></td>
                                                        </tr>
                                                        <?php endwhile; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <div class="alert alert-info text-center" style="border-radius: 20px;">
                <i class="fas fa-shopping-bag fa-3x mb-3"></i>
                <h4>Belum ada pesanan</h4>
                <p>Anda belum melakukan pembelian apapun</p>
                <a href="index.php" class="btn btn-primary" style="border-radius: 15px;">Mulai Belanja</a>
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
                    <div class="mb-2">
                        <a href="https://wa.me/6281339638842" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-whatsapp me-2"></i>081339638842
                        </a>
                    </div>
                    <div class="mb-2">
                        <a href="https://instagram.com/rhmtmlyi__" target="_blank" class="text-white text-decoration-none">
                            <i class="fab fa-instagram me-2"></i>@rhmtmlyi__
                        </a>
                    </div>
                    <div>
                        <a href="mailto:rahmatmulyadifadillah@gmail.com" class="text-white text-decoration-none">
                            <i class="fas fa-envelope me-2"></i>rahmatmulyadifadillah@gmail.com
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
