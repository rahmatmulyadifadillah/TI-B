/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DB } from './server/db';
import { Booking, BookingStatus, UserProfile } from './src/types';

const app = express();
const PORT = 3000;

// Initialize Database
DB.initialize();

// Security / Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple Logging / CSRF simulation
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Mock Email Transporter / Notification System
function sendMockEmailNotification(userEmail: string, userName: string, booking: Booking) {
  const emailContent = `
========================================================================
📧 EMAIL NOTIFICATION - UTM SPORT CENTER
To: ${userEmail}
Subject: [UTM SPORT CENTER] Konfirmasi Pemesanan Lapangan Berhasil! - #${booking.invoiceNumber}
========================================================================

Halo ${userName},

Pemesanan lapangan Anda telah berhasil dikonfirmasi dan divalidasi oleh sistem!

DETAIL PEMESANAN:
- No. Invoice    : ${booking.invoiceNumber}
- Kategori        : ${booking.courtCategory.toUpperCase()}
- Total Pembayaran: Rp ${booking.finalAmount.toLocaleString('id-ID')}
- Status          : DIKONFIRMASI / LUNAS
- Metode Bayar    : ${booking.paymentMethod}

JADWAL MAIN:
${booking.details.map(d => `- ${d.courtName} (${d.date} | Jam ${d.timeSlot})`).join('\n')}

Silakan tunjukkan QR Code Booking di Dashboard User Anda kepada petugas lapangan (operator) saat tiba di lokasi untuk proses check-in.

Terima kasih atas kepercayaan Anda memilih UTM Sport Center Mataram!

Salam Olahraga,
UTM Sport Center Team
Mataram, Nusa Tenggara Barat
WhatsApp: 081339638842
========================================================================
  `;
  console.log(emailContent);

  // Auto push notification to user
  DB.addNotification({
    id: `notif-email-${Date.now()}`,
    userId: booking.userId,
    title: '📧 Email Konfirmasi Dikirim!',
    message: `Email konfirmasi booking #${booking.invoiceNumber} telah sukses dikirim ke ${userEmail}.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });
}

// ====================================================================
// REST APIs (/api/*)
// ====================================================================

// Settings Endpoints
app.get('/api/settings', (req, res) => {
  res.json(DB.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = DB.updateSettings(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_SETTINGS', 'Mengubah pengaturan website');
  res.json(updated);
});

// Membership Packages Endpoints (CRUD)
app.get('/api/membership-packages', (req, res) => {
  res.json(DB.getMembershipPackages());
});

app.post('/api/membership-packages', (req, res) => {
  const p = DB.createMembershipPackage(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_MEMBERSHIP_PACKAGE', `Membuat paket membership baru: ${p.name}`);
  res.status(201).json(p);
});

app.put('/api/membership-packages/:id', (req, res) => {
  const p = DB.updateMembershipPackage(req.body);
  if (p) {
    DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_MEMBERSHIP_PACKAGE', `Mengubah paket membership: ${p.name}`);
    res.json(p);
  } else {
    res.status(404).json({ error: 'Paket membership tidak ditemukan' });
  }
});

app.delete('/api/membership-packages/:id', (req, res) => {
  DB.deleteMembershipPackage(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_MEMBERSHIP_PACKAGE', `Menghapus paket membership ID: ${req.params.id}`);
  res.json({ success: true });
});

// Bank accounts
app.get('/api/payment-methods', (req, res) => {
  res.json(DB.getBankAccounts());
});

// Courts Endpoints
app.get('/api/courts', (req, res) => {
  res.json(DB.getCourts());
});

app.get('/api/courts/:id', (req, res) => {
  const court = DB.getCourtById(req.params.id);
  if (court) res.json(court);
  else res.status(404).json({ error: 'Lapangan tidak ditemukan' });
});

app.post('/api/courts', (req, res) => {
  const court = DB.createCourt(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_COURT', `Menambahkan lapangan: ${court.name}`);
  res.status(201).json(court);
});

app.put('/api/courts/:id', (req, res) => {
  const updated = DB.updateCourt(req.body);
  if (updated) {
    DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_COURT', `Mengupdate lapangan: ${updated.name}`);
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Lapangan gagal diupdate' });
  }
});

app.delete('/api/courts/:id', (req, res) => {
  DB.deleteCourt(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_COURT', `Menghapus lapangan dengan ID: ${req.params.id}`);
  res.json({ success: true });
});

// Schedules Endpoints
app.get('/api/schedules', (req, res) => {
  const { courtId, date } = req.query;
  if (!courtId || !date) {
    return res.status(400).json({ error: 'courtId dan date wajib disertakan' });
  }
  res.json(DB.getSchedules(courtId as string, date as string));
});

app.post('/api/schedules/lock', (req, res) => {
  const { courtId, date, timeSlot, status } = req.body;
  const slot = DB.updateScheduleSlot(courtId, date, timeSlot, status);
  if (slot) {
    DB.addLog('admin', 'admin@utmsport.com', 'LOCK_SCHEDULE', `Mengubah status jadwal lapangan ${courtId} tanggal ${date} jam ${timeSlot} menjadi ${status}`);
    res.json(slot);
  } else {
    res.status(404).json({ error: 'Slot jadwal tidak ditemukan' });
  }
});

// Auth / Users Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  if (user.status === 'nonaktif') {
    return res.status(403).json({ error: 'Akun Anda dinonaktifkan oleh admin' });
  }

  // Log successful login
  DB.addLog(user.id, user.email, 'LOGIN', 'Melakukan login berhasil');
  res.json(user);
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Data registrasi tidak lengkap' });
  }

  const existing = DB.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email sudah terdaftar' });
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    email,
    name,
    phone: phone || '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    role: 'user',
    status: 'aktif',
    points: 10, // Register bonus
    referralCode: `UTM-${name.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
    membership: 'regular',
    createdAt: new Date().toISOString()
  };

  DB.createUser(newUser);
  DB.addLog(newUser.id, newUser.email, 'REGISTER', 'Mendaftar akun baru');
  res.status(201).json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(DB.getUsers());
});

app.put('/api/users/:id', (req, res) => {
  const updated = DB.updateUser(req.body);
  if (updated) {
    DB.addLog(updated.id, updated.email, 'UPDATE_PROFILE', 'Mengupdate profil user');
    res.json(updated);
  } else {
    res.status(404).json({ error: 'User tidak ditemukan' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  DB.deleteUser(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_USER', `Menghapus user ID: ${req.params.id}`);
  res.json({ success: true });
});

// Vouchers Endpoints
app.get('/api/vouchers', (req, res) => {
  res.json(DB.getVouchers());
});

app.post('/api/vouchers', (req, res) => {
  const v = DB.createVoucher(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_VOUCHER', `Membuat voucher baru: ${v.code}`);
  res.status(201).json(v);
});

app.put('/api/vouchers/:id', (req, res) => {
  const v = DB.updateVoucher(req.body);
  if (v) {
    DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_VOUCHER', `Mengubah voucher: ${v.code}`);
    res.json(v);
  } else {
    res.status(404).json({ error: 'Voucher gagal diperbarui' });
  }
});

app.delete('/api/vouchers/:id', (req, res) => {
  DB.deleteVoucher(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_VOUCHER', `Menghapus voucher dengan ID: ${req.params.id}`);
  res.json({ success: true });
});

// Vouchers Verify
app.post('/api/vouchers/verify', (req, res) => {
  const { code } = req.body;
  const voucher = DB.getVoucherByCode(code);
  if (voucher) {
    res.json(voucher);
  } else {
    res.status(404).json({ error: 'Voucher tidak valid atau sudah expired' });
  }
});

// Bookings Endpoints
app.get('/api/bookings', (req, res) => {
  res.json(DB.getBookings());
});

app.post('/api/bookings', (req, res) => {
  const booking = DB.createBooking(req.body);
  res.status(201).json(booking);
});

app.put('/api/bookings/:id', (req, res) => {
  const previousBooking = DB.getBookingById(req.params.id);
  const previousStatus = previousBooking ? previousBooking.status : null;
  const updated = DB.updateBooking(req.body);
  if (updated) {
    // Handle membership auto-activation on booking approval
    if (updated.bookingType === 'membership' && (updated.status === 'dikonfirmasi' || updated.status === 'booking_diproses')) {
      let tier: 'bronze' | 'silver' | 'gold' = 'bronze';
      if (updated.notes?.toLowerCase().includes('silver') || updated.details?.[0]?.courtName?.toLowerCase().includes('silver')) {
        tier = 'silver';
      } else if (updated.notes?.toLowerCase().includes('gold') || updated.details?.[0]?.courtName?.toLowerCase().includes('gold')) {
        tier = 'gold';
      }

      let pointsRewardBonus = 50; 
      if (tier === 'silver') pointsRewardBonus = 100;
      if (tier === 'gold') pointsRewardBonus = 200;

      const targetUser = DB.getUserById(updated.userId);
      if (targetUser && targetUser.membership !== tier) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        targetUser.membership = tier;
        targetUser.points += pointsRewardBonus;
        targetUser.membershipExpiresAt = expiresAt.toISOString();
        DB.updateUser(targetUser);

        // Notify user of activation
        DB.addNotification({
          id: `notif-memb-active-${Date.now()}`,
          userId: targetUser.id,
          title: `Membership ${tier.toUpperCase()} Aktif! 🎉`,
          message: `Selamat, paket membership ${tier.toUpperCase()} Anda telah diaktifkan oleh admin. Nikmati diskon otomatis dan point multiplier!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        DB.addLog('admin', 'admin@utmsport.com', 'ACTIVATE_MEMBERSHIP', `Mengaktifkan membership ${tier.toUpperCase()} untuk user ${targetUser.name}`);
      }
    }

    // If confirmation is successful, trigger simulated email
    if (updated.status === 'dikonfirmasi' || updated.status === 'booking_diproses') {
      sendMockEmailNotification(updated.userEmail, updated.userName, updated);
    }

    // Check if status changed to add user notification
    if (!previousBooking || previousStatus !== updated.status) {
      if (updated.status === 'dikonfirmasi' || updated.status === 'booking_diproses') {
        DB.addNotification({
          id: `notif-user-approved-${Date.now()}`,
          userId: updated.userId,
          title: 'Booking Dikonfirmasi! 🏆',
          message: `Booking Anda untuk #${updated.invoiceNumber} telah dikonfirmasi oleh admin. Selamat bermain!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (updated.status === 'ditolak' || updated.status === 'pembayaran_ditolak') {
        DB.addNotification({
          id: `notif-user-rejected-${Date.now()}`,
          userId: updated.userId,
          title: 'Booking Ditolak ❌',
          message: `Mohon maaf, sewa lapangan #${updated.invoiceNumber} ditolak oleh admin. Silakan periksa atau lakukan pemesanan ulang.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (updated.status === 'pending' || updated.status === 'menunggu_pembayaran') {
        DB.addNotification({
          id: `notif-user-reset-${Date.now()}`,
          userId: updated.userId,
          title: 'Status Booking Di-reset ⚠️',
          message: `Pemesanan #${updated.invoiceNumber} dikembalikan ke status Belum Bayar/Pending oleh admin.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json(updated);
  } else {
    res.status(404).json({ error: 'Booking tidak ditemukan' });
  }
});

// Payments & Logs Endpoints
app.get('/api/payments', (req, res) => {
  res.json(DB.getPayments());
});

app.get('/api/payments/booking/:bookingId', (req, res) => {
  const payment = DB.getPaymentByBookingId(req.params.bookingId);
  res.json(payment || null);
});

app.get('/api/bookings/history/:bookingId', (req, res) => {
  res.json(DB.getBookingStatusHistory(req.params.bookingId));
});

app.get('/api/payments/logs', (req, res) => {
  res.json(DB.getPaymentLogs(req.query.bookingId as string));
});

// Upload Payment Proof Endpoint (PDF/JPG/JPEG/PNG, max 5MB, stored in /uploads/payments/)
app.post('/api/upload-payment', (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'Data upload tidak lengkap' });
  }

  try {
    const fileExt = path.extname(fileName).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    if (!allowedExts.includes(fileExt)) {
      return res.status(400).json({ error: 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau PDF.' });
    }

    const base64Clean = base64Data.replace(/^data:(image\/\w+|application\/pdf);base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // Max 5 MB validation
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Ukuran file maksimal adalah 5 MB.' });
    }

    const paymentsDir = path.join(process.cwd(), 'uploads', 'payments');
    if (!fs.existsSync(paymentsDir)) {
      fs.mkdirSync(paymentsDir, { recursive: true });
    }

    // Unique filename with UUID-like or timestamp
    const uniqueFileName = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${fileExt}`;
    const filePath = path.join(paymentsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `/uploads/payments/${uniqueFileName}`;
    res.status(201).json({ url: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: `Gagal mengupload bukti pembayaran: ${err.message}` });
  }
});

// Submit payment
app.post('/api/payments', (req, res) => {
  const paymentData = req.body;
  const payment = DB.createPayment(paymentData);

  // Update corresponding booking status to 'sedang_diverifikasi' (or 'pembayaran_dikirim' based on flow)
  const booking = DB.getBookingById(payment.bookingId);
  if (booking) {
    booking.status = 'sedang_diverifikasi'; // 'sedang_diverifikasi' matches "Sedang Diverifikasi"
    booking.paymentProofUrl = payment.paymentProofUrl;
    DB.updateBooking(booking);

    // Create Notification for Admin (user-superadmin or other admins)
    DB.addNotification({
      id: `notif-admin-${Date.now()}`,
      userId: 'user-superadmin', // admin id
      title: 'Pembayaran Masuk!',
      message: `Pembayaran baru dari ${payment.senderName} untuk Invoice ${booking.invoiceNumber}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Create Notification for User
    DB.addNotification({
      id: `notif-user-${Date.now()}`,
      userId: booking.userId,
      title: 'Pembayaran Dikirim',
      message: `Bukti pembayaran untuk #${booking.invoiceNumber} berhasil dikirim dan sedang diverifikasi oleh admin.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json(payment);
});

// Verify payment (Approve/Reject)
app.post('/api/payments/verify', (req, res) => {
  const { bookingId, status, rejectionReason } = req.body; // status: 'pembayaran_diterima' or 'pembayaran_ditolak'
  
  const booking = DB.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking tidak ditemukan' });
  }

  const payment = DB.getPaymentByBookingId(bookingId);
  
  if (status === 'pembayaran_diterima') {
    // 1. Update booking status to 'booking_diproses' (Booking Diproses)
    booking.status = 'booking_diproses';
    DB.updateBooking(booking);

    // Lock schedule slots permanently
    booking.details.forEach(det => {
      DB.updateScheduleSlot(det.courtId, det.date, det.timeSlot, 'dipesan');
    });

    // Handle membership auto-activation on payment approval
    if (booking.bookingType === 'membership') {
      let tier: 'bronze' | 'silver' | 'gold' = 'bronze';
      if (booking.notes?.toLowerCase().includes('silver') || booking.details?.[0]?.courtName?.toLowerCase().includes('silver')) {
        tier = 'silver';
      } else if (booking.notes?.toLowerCase().includes('gold') || booking.details?.[0]?.courtName?.toLowerCase().includes('gold')) {
        tier = 'gold';
      }

      let pointsRewardBonus = 50; 
      if (tier === 'silver') pointsRewardBonus = 100;
      if (tier === 'gold') pointsRewardBonus = 200;

      const targetUser = DB.getUserById(booking.userId);
      if (targetUser && targetUser.membership !== tier) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        targetUser.membership = tier;
        targetUser.points += pointsRewardBonus;
        targetUser.membershipExpiresAt = expiresAt.toISOString();
        DB.updateUser(targetUser);

        // Notify user of activation
        DB.addNotification({
          id: `notif-memb-active-${Date.now()}`,
          userId: targetUser.id,
          title: `Membership ${tier.toUpperCase()} Aktif! 🎉`,
          message: `Selamat, paket membership ${tier.toUpperCase()} Anda telah diaktifkan oleh admin. Nikmati diskon otomatis dan point multiplier!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        DB.addLog('admin', 'admin@utmsport.com', 'ACTIVATE_MEMBERSHIP', `Mengaktifkan membership ${tier.toUpperCase()} untuk user ${targetUser.name}`);
      }
    }

    // 2. Update payment status if exists
    if (payment) {
      payment.status = 'pembayaran_diterima';
      DB.updatePayment(payment);
    }

    // 3. Add to status history
    DB.addBookingStatusHistory({
      id: `history-${Date.now()}`,
      bookingId,
      status: 'booking_diproses',
      changedBy: 'admin',
      notes: 'Pembayaran berhasil diverifikasi. Booking diproses dan dikonfirmasi.',
      createdAt: new Date().toISOString()
    });

    // 4. Add to payment logs
    DB.addPaymentLog({
      id: `paylog-${Date.now()}`,
      bookingId,
      action: 'PAYMENT_APPROVED',
      details: 'Admin menyetujui pembayaran dan mengonfirmasi pesanan.',
      createdAt: new Date().toISOString()
    });

    // 5. Send notifications
    // Admin gets confirmation log
    DB.addLog('admin', 'admin@utmsport.com', 'VERIFY_PAYMENT_APPROVE', `Menerima pembayaran booking #${booking.invoiceNumber}`);

    // User gets notifications
    DB.addNotification({
      id: `notif-user-approved-${Date.now()}`,
      userId: booking.userId,
      title: 'Pembayaran Diterima!',
      message: 'Pembayaran Anda berhasil diverifikasi. Booking Anda telah dikonfirmasi.',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Simulated Email
    sendMockEmailNotification(booking.userEmail, booking.userName, booking);

    res.json({ success: true, booking, payment });
  } else if (status === 'pembayaran_ditolak') {
    // 1. Update booking status to 'pembayaran_ditolak' (Pembayaran Ditolak)
    booking.status = 'pembayaran_ditolak';
    DB.updateBooking(booking);

    // Release schedule slots so others can book?
    booking.details.forEach(det => {
      DB.updateScheduleSlot(det.courtId, det.date, det.timeSlot, 'tersedia');
    });

    // 2. Update payment status
    if (payment) {
      payment.status = 'pembayaran_ditolak';
      payment.rejectionReason = rejectionReason || 'Bukti tidak jelas atau nominal tidak sesuai';
      DB.updatePayment(payment);
    }

    // 3. Add to status history
    DB.addBookingStatusHistory({
      id: `history-${Date.now()}`,
      bookingId,
      status: 'pembayaran_ditolak',
      changedBy: 'admin',
      notes: `Pembayaran ditolak. Alasan: ${rejectionReason}`,
      createdAt: new Date().toISOString()
    });

    // 4. Add to payment logs
    DB.addPaymentLog({
      id: `paylog-${Date.now()}`,
      bookingId,
      action: 'PAYMENT_REJECTED',
      details: `Admin menolak pembayaran. Alasan: ${rejectionReason}`,
      createdAt: new Date().toISOString()
    });

    // 5. Send notifications
    DB.addLog('admin', 'admin@utmsport.com', 'VERIFY_PAYMENT_REJECT', `Menolak pembayaran booking #${booking.invoiceNumber}. Alasan: ${rejectionReason}`);

    DB.addNotification({
      id: `notif-user-rejected-${Date.now()}`,
      userId: booking.userId,
      title: 'Pembayaran Ditolak',
      message: `Pembayaran Anda ditolak. Alasan: ${rejectionReason}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, booking, payment });
  } else {
    res.status(400).json({ error: 'Status tidak valid' });
  }
});

// Content API - GALLERY
app.get('/api/gallery', (req, res) => res.json(DB.getGallery()));
app.post('/api/gallery', (req, res) => {
  const item = DB.createGalleryItem(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_GALLERY', `Menambah galeri foto: ${item.title}`);
  res.status(201).json(item);
});
app.put('/api/gallery/:id', (req, res) => {
  const item = DB.updateGalleryItem(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_GALLERY', `Mengubah galeri foto: ${req.body.title}`);
  res.json(item);
});
app.delete('/api/gallery/:id', (req, res) => {
  DB.deleteGalleryItem(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_GALLERY', `Menghapus galeri foto ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - FAQs
app.get('/api/faqs', (req, res) => res.json(DB.getFAQ()));
app.post('/api/faqs', (req, res) => {
  const item = DB.createFAQ(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_FAQ', `Menambah FAQ: ${item.question}`);
  res.status(201).json(item);
});
app.put('/api/faqs/:id', (req, res) => {
  const item = DB.updateFAQ(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_FAQ', `Mengubah FAQ: ${req.body.question}`);
  res.json(item);
});
app.delete('/api/faqs/:id', (req, res) => {
  DB.deleteFAQ(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_FAQ', `Menghapus FAQ ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - ARTICLES
app.get('/api/articles', (req, res) => res.json(DB.getArticles()));
app.post('/api/articles', (req, res) => {
  const item = DB.createArticle(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_ARTICLE', `Menambah artikel berita: ${item.title}`);
  res.status(201).json(item);
});
app.put('/api/articles/:id', (req, res) => {
  const item = DB.updateArticle(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_ARTICLE', `Mengubah artikel berita: ${req.body.title}`);
  res.json(item);
});
app.delete('/api/articles/:id', (req, res) => {
  DB.deleteArticle(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_ARTICLE', `Menghapus artikel ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - PROMOS
app.get('/api/promos', (req, res) => res.json(DB.getPromos()));
app.post('/api/promos', (req, res) => {
  const item = DB.createPromo(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_PROMO', `Menambah promo banner: ${item.title}`);
  res.status(201).json(item);
});
app.put('/api/promos/:id', (req, res) => {
  const item = DB.updatePromo(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_PROMO', `Mengubah promo banner: ${req.body.title}`);
  res.json(item);
});
app.delete('/api/promos/:id', (req, res) => {
  DB.deletePromo(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_PROMO', `Menghapus promo ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - TOURNAMENTS
app.get('/api/tournaments', (req, res) => res.json(DB.getTournaments()));
app.post('/api/tournaments', (req, res) => {
  const item = DB.createTournament(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_TOURNAMENT', `Menambah turnamen: ${item.name}`);
  res.status(201).json(item);
});
app.put('/api/tournaments/:id', (req, res) => {
  const item = DB.updateTournament(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_TOURNAMENT', `Mengubah turnamen: ${req.body.name}`);
  res.json(item);
});
app.delete('/api/tournaments/:id', (req, res) => {
  DB.deleteTournament(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_TOURNAMENT', `Menghapus turnamen ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - EVENTS
app.get('/api/events', (req, res) => res.json(DB.getEvents()));
app.post('/api/events', (req, res) => {
  const item = DB.createEvent(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_EVENT', `Menambah event olahraga: ${item.name}`);
  res.status(201).json(item);
});
app.put('/api/events/:id', (req, res) => {
  const item = DB.updateEvent(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_EVENT', `Mengubah event olahraga: ${req.body.name}`);
  res.json(item);
});
app.delete('/api/events/:id', (req, res) => {
  DB.deleteEvent(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_EVENT', `Menghapus event ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - SPONSORS
app.get('/api/sponsors', (req, res) => res.json(DB.getSponsors()));
app.post('/api/sponsors', (req, res) => {
  const item = DB.createSponsor(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_SPONSOR', `Menambah sponsor logo: ${item.name}`);
  res.status(201).json(item);
});
app.put('/api/sponsors/:id', (req, res) => {
  const item = DB.updateSponsor(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_SPONSOR', `Mengubah sponsor logo: ${req.body.name}`);
  res.json(item);
});
app.delete('/api/sponsors/:id', (req, res) => {
  DB.deleteSponsor(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_SPONSOR', `Menghapus sponsor ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - FACILITIES
app.get('/api/facilities', (req, res) => res.json(DB.getFacilities()));
app.post('/api/facilities', (req, res) => {
  const item = DB.createFacility(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_FACILITY', `Menambah fasilitas: ${item.name}`);
  res.status(201).json(item);
});
app.put('/api/facilities/:id', (req, res) => {
  const item = DB.updateFacility(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_FACILITY', `Mengubah fasilitas: ${req.body.name}`);
  res.json(item);
});
app.delete('/api/facilities/:id', (req, res) => {
  DB.deleteFacility(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_FACILITY', `Menghapus fasilitas ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - TESTIMONIALS
app.get('/api/testimonials', (req, res) => res.json(DB.getTestimonials()));
app.post('/api/testimonials', (req, res) => {
  const item = DB.createTestimonial(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_TESTIMONIAL', `Menambah testimoni: ${item.name}`);
  res.status(201).json(item);
});
app.put('/api/testimonials/:id', (req, res) => {
  const item = DB.updateTestimonial(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_TESTIMONIAL', `Mengubah testimoni: ${req.body.name}`);
  res.json(item);
});
app.delete('/api/testimonials/:id', (req, res) => {
  DB.deleteTestimonial(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_TESTIMONIAL', `Menghapus testimoni ID: ${req.params.id}`);
  res.json({ success: true });
});

// Content API - MENUS
app.get('/api/menus', (req, res) => res.json(DB.getMenus()));
app.post('/api/menus', (req, res) => {
  const item = DB.createMenu(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'CREATE_MENU', `Menambah menu navigasi: ${item.label}`);
  res.status(201).json(item);
});
app.put('/api/menus/:id', (req, res) => {
  const item = DB.updateMenu(req.body);
  DB.addLog('admin', 'admin@utmsport.com', 'UPDATE_MENU', `Mengubah menu navigasi: ${req.body.label}`);
  res.json(item);
});
app.delete('/api/menus/:id', (req, res) => {
  DB.deleteMenu(req.params.id);
  DB.addLog('admin', 'admin@utmsport.com', 'DELETE_MENU', `Menghapus menu navigasi ID: ${req.params.id}`);
  res.json({ success: true });
});

// RESTORE DATABASE
app.post('/api/database/restore', (req, res) => {
  const result = DB.restoreDatabase(req.body);
  if (result.success) {
    DB.addLog('admin', 'admin@utmsport.com', 'RESTORE_DATABASE', 'Melakukan restore database dari file cadangan.');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Reviews
app.get('/api/reviews', (req, res) => {
  res.json(DB.getReviews(req.query.courtId as string));
});

app.post('/api/reviews', (req, res) => {
  const review = DB.createReview(req.body);
  res.status(201).json(review);
});

// Chat Endpoints
app.get('/api/chats', (req, res) => {
  res.json(DB.getChats());
});

app.post('/api/chats', (req, res) => {
  const chat = DB.addChatMessage(req.body);
  res.status(201).json(chat);
});

// Notifications
app.get('/api/notifications/:userId', (req, res) => {
  res.json(DB.getNotifications(req.params.userId));
});

app.post('/api/notifications/read/:userId', (req, res) => {
  DB.markNotificationsRead(req.params.userId);
  res.json({ success: true });
});

// Audit Logs
app.get('/api/logs', (req, res) => {
  res.json(DB.getLogs());
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// File Upload Endpoint
app.post('/api/upload', (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'Data upload tidak lengkap' });
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    
    const fileExt = path.extname(fileName) || '.jpg';
    const uniqueFileName = `upload-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `/uploads/${uniqueFileName}`;
    res.status(201).json({ url: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: `Gagal mengupload gambar: ${err.message}` });
  }
});

// SQL Database Backup Download Endpoint
app.get('/api/database/backup', (req, res) => {
  const sqlDump = DB.generateSQLDump();
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename=utm_sport_center.sql');
  res.send(sqlDump);
});

// ====================================================================
// Serve Frontend & Vite Development Engine
// ====================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server UTM Sport Center running on http://localhost:${PORT}`);
    console.log(`- Database persisted in data/db.json`);
    console.log(`- SQL database export available at /api/database/backup`);
  });
}

startServer();
