<?php
require_once '../config/database.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['order_id']) && isset($_POST['status'])) {
    $order_id = $_POST['order_id'];
    $status = $_POST['status'];
    
    $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $order_id);
    $stmt->execute();
    $stmt->close();
    
    header('Location: orders.php');
    exit();
}

$orders = $conn->query("SELECT o.*, u.username, u.email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pesanan - MulLucky Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .sidebar {
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            border-right: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar .nav-link {
            transition: all 0.3s ease;
            border-radius: 10px;
            margin: 5px 10px;
        }
        
        .sidebar .nav-link:hover {
            background: rgba(102, 126, 234, 0.3);
            transform: translateX(5px);
        }
        
        .sidebar .nav-link.active {
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .main-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
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
        
        .card {
            border: none;
            border-radius: 20px;
        }
        
        .btn {
            border-radius: 15px;
            font-weight: 500;
        }
        
        .badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="d-flex">
        <div class="sidebar text-white">
            <div class="p-4">
                <h4 class="fw-bold mb-1">🍀 MulLucky Store</h4>
                <p class="text-muted small">Admin Panel</p>
            </div>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link text-white" href="dashboard.php">
                        <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="products.php">
                        <i class="fas fa-box me-2"></i> Produk
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active text-white" href="orders.php">
                        <i class="fas fa-shopping-cart me-2"></i> Pesanan
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="users.php">
                        <i class="fas fa-users me-2"></i> Users
                    </a>
                </li>
                <li class="nav-item mt-4">
                    <a class="nav-link text-white" href="../logout.php">
                        <i class="fas fa-sign-out-alt me-2"></i> Logout
                    </a>
                </li>
            </ul>
        </div>
        <div class="main-content flex-grow-1">
            <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                <div class="container-fluid">
                    <span class="navbar-brand mb-0 h1 fw-bold" style="color: #667eea;">Kelola Pesanan</span>
                    <div class="d-flex align-items-center">
                        <span class="me-3">Halo, <?php echo $_SESSION['username']; ?></span>
                        <span class="badge bg-primary">Admin</span>
                    </div>
                </div>
            </nav>

            <div class="container-fluid p-4">
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold">Daftar Pesanan</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th>Detail</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php while ($order = $orders->fetch_assoc()): ?>
                                    <tr>
                                        <td>#<?php echo $order['id']; ?></td>
                                        <td>
                                            <strong><?php echo $order['username']; ?></strong><br>
                                            <small class="text-muted"><?php echo $order['email']; ?></small>
                                        </td>
                                        <td>Rp <?php echo number_format($order['total'], 0, ',', '.'); ?></td>
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
                                        <td><?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?></td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-info" style="border-radius: 10px;" data-bs-toggle="modal" 
                                                    data-bs-target="#orderDetail<?php echo $order['id']; ?>">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <form method="POST" action="" class="d-inline">
                                                <input type="hidden" name="order_id" value="<?php echo $order['id']; ?>">
                                                <select name="status" class="form-select form-select-sm d-inline-block w-auto" style="border-radius: 10px;">
                                                    <option value="pending" <?php echo $order['status'] == 'pending' ? 'selected' : ''; ?>>Pending</option>
                                                    <option value="diproses" <?php echo $order['status'] == 'diproses' ? 'selected' : ''; ?>>Diproses</option>
                                                    <option value="dikirim" <?php echo $order['status'] == 'dikirim' ? 'selected' : ''; ?>>Dikirim</option>
                                                    <option value="selesai" <?php echo $order['status'] == 'selesai' ? 'selected' : ''; ?>>Selesai</option>
                                                    <option value="dibatalkan" <?php echo $order['status'] == 'dibatalkan' ? 'selected' : ''; ?>>Dibatalkan</option>
                                                </select>
                                                <button type="submit" class="btn btn-sm btn-primary" style="border-radius: 10px; background: linear-gradient(135deg, #667eea, #764ba2); border: none;">Update</button>
                                            </form>
                                        </td>
                                    </tr>

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
                                                            <strong>User:</strong> <?php echo $order['username']; ?>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <strong>Email:</strong> <?php echo $order['email']; ?>
                                                        </div>
                                                    </div>
                                                    <div class="row mb-3">
                                                        <div class="col-md-6">
                                                            <strong>Total:</strong> Rp <?php echo number_format($order['total'], 0, ',', '.'); ?>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <strong>Status:</strong> <?php echo ucfirst($order['status']); ?>
                                                        </div>
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
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
