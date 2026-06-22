<?php
require_once '../config/database.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('Location: ../login.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name']);
    $price = $_POST['price'];
    $description = trim($_POST['description']);
    $stock = $_POST['stock'];
    $image = $_FILES['image'];
    
    if (empty($name) || empty($price) || empty($stock)) {
        $error = 'Nama, harga, dan stok harus diisi!';
    } else {
        $image_path = '';
        if ($image['name']) {
            $target_dir = '../assets/images/';
            $image_path = $target_dir . time() . '_' . basename($image['name']);
            move_uploaded_file($image['tmp_name'], $image_path);
        }
        
        if (isset($_POST['product_id']) && !empty($_POST['product_id'])) {
            $product_id = $_POST['product_id'];
            if ($image['name']) {
                $stmt = $conn->prepare("UPDATE products SET name=?, price=?, description=?, image=?, stock=? WHERE id=?");
                $stmt->bind_param("sdssii", $name, $price, $description, $image_path, $stock, $product_id);
            } else {
                $stmt = $conn->prepare("UPDATE products SET name=?, price=?, description=?, stock=? WHERE id=?");
                $stmt->bind_param("sdsii", $name, $price, $description, $stock, $product_id);
            }
            $stmt->execute();
            $success = 'Produk berhasil diperbarui!';
        } else {
            $stmt = $conn->prepare("INSERT INTO products (name, price, description, image, stock) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sdssi", $name, $price, $description, $image_path, $stock);
            $stmt->execute();
            $success = 'Produk berhasil ditambahkan!';
        }
        $stmt->close();
    }
}

if (isset($_GET['delete'])) {
    $product_id = $_GET['delete'];
    $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $stmt->close();
    header('Location: products.php');
    exit();
}

$products = $conn->query("SELECT * FROM products ORDER BY created_at DESC");

$edit_product = null;
if (isset($_GET['edit'])) {
    $product_id = $_GET['edit'];
    $stmt = $conn->prepare("SELECT * FROM products WHERE id=?");
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $edit_product = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Produk - MulLucky Store</title>
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
                    <a class="nav-link active text-white" href="products.php">
                        <i class="fas fa-box me-2"></i> Produk
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="orders.php">
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
                    <span class="navbar-brand mb-0 h1 fw-bold" style="color: #667eea;">Kelola Produk</span>
                    <div class="d-flex align-items-center">
                        <span class="me-3">Halo, <?php echo $_SESSION['username']; ?></span>
                        <span class="badge bg-primary">Admin</span>
                    </div>
                </div>
            </nav>

            <div class="container-fluid p-4">
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
                <div class="card shadow mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold"><?php echo $edit_product ? 'Edit Produk' : 'Tambah Produk Baru'; ?></h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="" enctype="multipart/form-data">
                            <?php if ($edit_product): ?>
                                <input type="hidden" name="product_id" value="<?php echo $edit_product['id']; ?>">
                            <?php endif; ?>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="name" class="form-label fw-semibold">Nama Produk</label>
                                        <input type="text" class="form-control" id="name" name="name" required 
                                               value="<?php echo $edit_product ? $edit_product['name'] : ''; ?>" style="border-radius: 15px;">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="price" class="form-label fw-semibold">Harga (Rp)</label>
                                        <input type="number" class="form-control" id="price" name="price" required 
                                               value="<?php echo $edit_product ? $edit_product['price'] : ''; ?>" style="border-radius: 15px;">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label for="stock" class="form-label fw-semibold">Stok</label>
                                        <input type="number" class="form-control" id="stock" name="stock" required 
                                               value="<?php echo $edit_product ? $edit_product['stock'] : ''; ?>" style="border-radius: 15px;">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label fw-semibold">Deskripsi</label>
                                <textarea class="form-control" id="description" name="description" rows="3" style="border-radius: 15px;"><?php echo $edit_product ? $edit_product['description'] : ''; ?></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="image" class="form-label fw-semibold">Foto Produk</label>
                                <input type="file" class="form-control" id="image" name="image" accept="image/*" style="border-radius: 15px;">
                                <?php if ($edit_product && $edit_product['image']): ?>
                                    <small class="text-muted">Foto saat ini: <?php echo basename($edit_product['image']); ?></small>
                                <?php endif; ?>
                            </div>
                            <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #667eea, #764ba2); border: none;">
                                <?php echo $edit_product ? 'Update Produk' : 'Tambah Produk'; ?>
                            </button>
                            <?php if ($edit_product): ?>
                                <a href="products.php" class="btn btn-secondary" style="border-radius: 15px;">Batal</a>
                            <?php endif; ?>
                        </form>
                    </div>
                </div>
                <div class="card shadow">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold">Daftar Produk</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>Nama</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Rating</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php while ($product = $products->fetch_assoc()): ?>
                                    <tr>
                                        <td>
                                            <?php if ($product['image']): ?>
                                                <img src="<?php echo $product['image']; ?>" alt="<?php echo $product['name']; ?>" 
                                                     class="img-thumbnail" style="max-width: 50px; max-height: 50px; border-radius: 10px;">
                                            <?php else: ?>
                                                <span class="text-muted">No image</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo $product['name']; ?></td>
                                        <td>Rp <?php echo number_format($product['price'], 0, ',', '.'); ?></td>
                                        <td><?php echo $product['stock']; ?></td>
                                        <td>
                                            <?php if ($product['rating_count'] > 0): ?>
                                                <?php echo $product['rating']; ?> ⭐ (<?php echo $product['rating_count']; ?>)
                                            <?php else: ?>
                                                -
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <a href="products.php?edit=<?php echo $product['id']; ?>" class="btn btn-sm btn-warning" style="border-radius: 10px;">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="products.php?delete=<?php echo $product['id']; ?>" class="btn btn-sm btn-danger" style="border-radius: 10px;"
                                               onclick="return confirm('Yakin ingin menghapus produk ini?')">
                                                <i class="fas fa-trash"></i>
                                            </a>
                                        </td>
                                    </tr>
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
