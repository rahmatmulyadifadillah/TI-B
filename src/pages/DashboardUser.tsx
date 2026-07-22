/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Compass, Award, Star, Settings, Key, 
  Trash2, Upload, Printer, Download, Sparkles, HelpCircle, Phone, CreditCard, LogOut, X
} from 'lucide-react';
import { UserProfile, Booking, BookingStatus, Payment, MembershipPackage } from '../types';
import { API } from '../api';

interface DashboardUserProps {
  user: UserProfile | null;
  onNavigate: (view: string, extraId?: string) => void;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export default function DashboardUser({ user, onNavigate, onUpdateUser, onLogout }: DashboardUserProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photoUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploadingPhoto(true);
      try {
        const res = await API.uploadImage(file.name, base64);
        setProfilePhoto(res.url);
        alert('Foto profil berhasil diunggah!');
      } catch (err: any) {
        alert('Gagal mengunggah foto profil: ' + err.message);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
  };
  const [activeTab, setActiveTab] = useState<'profil' | 'bookings' | 'riwayatPembayaran' | 'referral' | 'membership'>('bookings');
  
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
  
  // Membership purchase state
  const [buyingMembershipTier, setBuyingMembershipTier] = useState<string | null>(null);
  const [membershipPaymentMethod, setMembershipPaymentMethod] = useState('');
  const [membershipProofImage, setMembershipProofImage] = useState<string | null>(null);
  const [isUploadingMembership, setIsUploadingMembership] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [membershipPackagesList, setMembershipPackagesList] = useState<MembershipPackage[]>([]);

  // Proof upload overlay state
  const [uploadingBooking, setUploadingBooking] = useState<Booking | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);

  // Load user bookings and bank accounts with real-time polling
  useEffect(() => {
    if (!user) return;

    const loadUserData = () => {
      // Load user details to sync membership/points/etc. in real-time
      API.getUsers()
        .then(usersList => {
          const freshUser = usersList.find(u => u.id === user.id);
          if (freshUser) {
            const hasChanged = 
              freshUser.membership !== user.membership ||
              freshUser.points !== user.points ||
              freshUser.membershipExpiresAt !== user.membershipExpiresAt ||
              freshUser.name !== user.name ||
              freshUser.email !== user.email ||
              freshUser.phone !== user.phone ||
              freshUser.photoUrl !== user.photoUrl;
              
            if (hasChanged) {
              API.setCurrentUser(freshUser);
              if (onUpdateUser) {
                onUpdateUser(freshUser);
              }
            }
          }
        })
        .catch(console.error);

      API.getBookings()
        .then(res => {
          const myBooks = res.filter(b => b.userId === user.id);
          setBookings(myBooks);
          
          // Load related payments
          API.getPayments()
            .then(payRes => {
              const myBookingIds = myBooks.map(b => b.id);
              const myPayments = payRes.filter(p => myBookingIds.includes(p.bookingId));
              setUserPayments(myPayments);
            })
            .catch(console.error);
        })
        .catch(console.error);
    };

    loadUserData();
    
    API.getPaymentMethods()
      .then(setBankAccounts)
      .catch(console.error);

    API.getMembershipPackages()
      .then(setMembershipPackagesList)
      .catch(console.error);

    // Poll every 4 seconds for real-time state synchronization
    const interval = setInterval(loadUserData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="py-16 text-center responsive-container font-sans min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Silakan login terlebih dahulu untuk mengakses dashboard Anda.</p>
        <button 
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-sport-navy text-white rounded-xl font-bold cursor-pointer hover:bg-sport-navy-light"
        >
          Ke Halaman Login
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: profileName,
      phone: profilePhone,
      photoUrl: profilePhoto
    };

    try {
      const res = await API.updateUser(updated);
      onUpdateUser(res);
      alert('Profil Anda berhasil diperbarui!');
    } catch (err: any) {
      alert(`Gagal mengupdate profil: ${err.message}`);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan sewa lapangan ini? Pembatalan akan mengembalikan 80% nominal sewa dalam bentuk Point Reward.')) {
      return;
    }

    const pointsRefunded = Math.floor((booking.finalAmount * 0.8) / 100); // 80% point reward credit

    const updated: Booking = {
      ...booking,
      status: 'ditolak', // cancel releases slots in backend
      notes: `${booking.notes || ''} (Dibatalkan oleh user. Refund +${pointsRefunded} Points)`
    };

    try {
      const res = await API.updateBooking(updated);
      
      // Update local bookings state
      setBookings(prev => prev.map(b => b.id === booking.id ? res : b));

      // Update user points
      const updatedUser: UserProfile = {
        ...user,
        points: user.points + pointsRefunded
      };
      const resUser = await API.updateUser(updatedUser);
      onUpdateUser(resUser);

      alert(`Pemesanan berhasil dibatalkan. +${pointsRefunded} Point Reward telah dikreditkan ke akun Anda.`);
    } catch (err: any) {
      alert(`Gagal membatalkan: ${err.message}`);
    }
  };

  const handlePrintReceipt = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up diizinkan di browser Anda.');
      return;
    }
    
    const detailsHtml = booking.details.map(d => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; color: #1e293b; text-align: left;">
          <strong>${d.courtName}</strong><br/>
          <span style="color: #64748b; font-size: 11px;">${d.date} • Jam ${d.timeSlot}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; text-align: right; font-size: 13px; font-weight: bold; font-family: monospace; color: #1e293b;">
          Rp ${d.price.toLocaleString('id-ID')}
        </td>
      </tr>
    `).join('');

    const qrGridHtml = Array.from({length: 16}).map((_, i) => `
      <div style="background-color: ${(i * 7 + 13) % 3 === 0 ? '#0B2F64' : 'transparent'}; width: 100%; height: 100%; border-radius: 2px;"></div>
    `).join('');

    const isLunas = booking.status === 'dikonfirmasi' || booking.status === 'selesai' || booking.status === 'booking_diproses' || booking.status === 'booking_selesai';
    const statusText = isLunas ? '✅ LUNAS & TERVERIFIKASI' : (booking.status === 'sedang_diverifikasi' || booking.status === 'diproses') ? '⏳ SEDANG DIVERIFIKASI' : '⚠️ BELUM LUNAS';
    const statusColor = isLunas ? '#065f46' : '#d97706';
    const statusBg = isLunas ? '#ecfdf5' : '#fffbeb';
    const statusBorder = isLunas ? '#a7f3d0' : '#fef3c7';

    printWindow.document.write(`
      <html>
        <head>
          <title>E-Tiket_Kwitansi_${booking.invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f1f5f9;
              color: #0f172a;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .ticket-card {
              width: 100%;
              max-width: 440px;
              background: #ffffff;
              border-radius: 24px;
              box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
              overflow: hidden;
              position: relative;
              box-sizing: border-box;
            }
            .header {
              background: #0B2F64;
              color: #ffffff;
              padding: 30px 24px;
              text-align: center;
            }
            .brand {
              font-weight: 800;
              font-size: 20px;
              letter-spacing: 0.05em;
              margin: 0;
              color: #10B981;
            }
            .subtitle {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #93c5fd;
              margin: 4px 0 0 0;
              font-weight: 600;
            }
            .content {
              padding: 24px;
              text-align: center;
            }
            .status-badge {
              display: inline-block;
              background: ${statusBg};
              color: ${statusColor};
              padding: 6px 14px;
              border-radius: 99px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.05em;
              margin-bottom: 20px;
              text-transform: uppercase;
              border: 1px solid ${statusBorder};
            }
            .invoice-num {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              font-weight: 700;
              color: #64748b;
              margin-bottom: 15px;
              text-align: left;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 20px;
              border-bottom: 1px dashed #e2e8f0;
              padding-bottom: 15px;
              text-align: left;
            }
            .info-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #94a3b8;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .info-value {
              font-size: 12px;
              font-weight: 600;
              color: #1e293b;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .total-section {
              background: #f8fafc;
              border-radius: 16px;
              padding: 14px;
              margin-bottom: 20px;
              border: 1px solid #f1f5f9;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .total-row:last-child {
              margin-bottom: 0;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              color: #0f172a;
              font-weight: 800;
              font-size: 14px;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
              background: #f8fafc;
              padding: 16px;
              border-radius: 16px;
              border: 1px solid #e2e8f0;
            }
            .qr-box {
              width: 110px;
              height: 110px;
              background-color: #000;
              position: relative;
              padding: 10px;
              box-sizing: border-box;
              border-radius: 10px;
            }
            .qr-corner {
              position: absolute;
              width: 10px;
              height: 10px;
              border-color: #10B981;
              border-style: solid;
            }
            .qr-top-left { top: 6px; left: 6px; border-width: 2.5px 0 0 2.5px; }
            .qr-top-right { top: 6px; right: 6px; border-width: 2.5px 2.5px 0 0; }
            .qr-bottom-left { bottom: 6px; left: 6px; border-width: 0 0 2.5px 2.5px; }
            .qr-bottom-right { bottom: 6px; right: 6px; border-width: 0 2.5px 2.5px 0; }
            
            .qr-grid {
              width: 100%;
              height: 100%;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 4px;
            }
            .footer-note {
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              margin-top: 20px;
              line-height: 1.4;
              font-weight: 500;
            }
            @media print {
              body {
                background: none;
                padding: 0;
                margin: 0;
                display: block;
              }
              .ticket-card {
                box-shadow: none;
                border: none;
                max-width: 100%;
                margin: 0 auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <h1 class="brand">UTM SPORT ARENA</h1>
              <p class="subtitle">Kuitansi & E-Tiket Resmi</p>
            </div>
            <div class="content">
              <span class="status-badge">${statusText}</span>
              
              <div class="invoice-num">INVOICE #${booking.invoiceNumber}</div>
              
              <div class="info-grid">
                <div>
                  <div class="info-label">Nama Pemesan</div>
                  <div class="info-value">${booking.userName}</div>
                </div>
                <div>
                  <div class="info-label">No. Telepon</div>
                  <div class="info-value">${booking.userPhone || '-'}</div>
                </div>
                <div>
                  <div class="info-label">Metode Bayar</div>
                  <div class="info-value">${booking.paymentMethod}</div>
                </div>
                <div>
                  <div class="info-label">Tanggal Cetak</div>
                  <div class="info-value">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                </div>
              </div>

              <div style="text-align: left;" class="info-label">Daftar Sewa Lapangan</div>
              <table class="details-table">
                <tbody>
                  ${detailsHtml}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal Harga</span>
                  <span style="font-family: monospace;">Rp ${booking.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                ${booking.discountAmount > 0 ? `
                <div class="total-row" style="color: #ef4444;">
                  <span>Diskon / Voucher</span>
                  <span style="font-family: monospace;">-Rp ${booking.discountAmount.toLocaleString('id-ID')}</span>
                </div>
                ` : ''}
                <div class="total-row">
                  <span>Total Pembayaran</span>
                  <span style="font-family: monospace; color: #0b2f64; font-weight: 800;">Rp ${booking.finalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              ${isLunas ? `
              <div class="qr-container">
                <div class="qr-box">
                  <div class="qr-corner qr-top-left"></div>
                  <div class="qr-corner qr-top-right"></div>
                  <div class="qr-corner qr-bottom-left"></div>
                  <div class="qr-corner qr-bottom-right"></div>
                  <div class="qr-grid">
                    ${qrGridHtml}
                  </div>
                </div>
                <span style="font-size: 9px; font-weight: 800; color: #0B2F64; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace; margin-top: 4px;">SCAN CHECK-IN MANDIRI</span>
                <p style="font-size: 9px; color: #64748b; margin: 4px 0 0 0; text-align: center; line-height: 1.3;">
                  Tunjukkan QR Code di atas pada petugas UTM Sport Arena saat memasuki lapangan.
                </p>
              </div>
              ` : `
              <div style="background: #fffbeb; border: 1px dashed #fef3c7; border-radius: 12px; padding: 12px; font-size: 10px; color: #b45309; line-height: 1.3;">
                QR Code Check-in akan aktif secara otomatis setelah pembayaran Anda diverifikasi lunas oleh admin UTM Sport.
              </div>
              `}

              <p class="footer-note">
                Kuitansi ini diterbitkan secara sah oleh sistem UTM Sport Arena.<br/>
                Terima kasih telah berolahraga bersama kami!
              </p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleBuyMembership = (tier: string) => {
    setBuyingMembershipTier(tier);
    setMembershipPaymentMethod('');
    setMembershipProofImage(null);
  };

  const handleSubmitMembershipPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingMembershipTier || !membershipPaymentMethod || !membershipProofImage) {
      alert('Silakan pilih metode pembayaran dan upload bukti transfer terlebih dahulu.');
      return;
    }

    const selectedPkg = membershipPackagesList.find(p => p.id === buyingMembershipTier || p.name.toLowerCase() === buyingMembershipTier.toLowerCase());
    const cost = selectedPkg ? selectedPkg.price : (buyingMembershipTier === 'silver' ? 100000 : (buyingMembershipTier === 'gold' ? 200000 : 50000));
    const tierName = selectedPkg ? selectedPkg.name : buyingMembershipTier;

    const bookingId = `booking-memb-${Date.now()}`;
    const newBooking: Booking = {
      id: bookingId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      invoiceNumber: `UTM-MEMB-${Math.floor(1000 + Math.random() * 9000)}`,
      courtCategory: 'futsal',
      totalAmount: cost,
      discountAmount: 0,
      finalAmount: cost,
      paymentMethod: membershipPaymentMethod,
      bookingType: 'membership',
      status: 'diproses',
      createdAt: new Date().toISOString(),
      paymentProofUrl: membershipProofImage,
      details: [
        {
          id: `det-memb-${Date.now()}`,
          bookingId: bookingId,
          courtId: 'membership',
          courtName: `Paket Membership ${tierName.toUpperCase()}`,
          date: '-',
          timeSlot: '-',
          price: cost
        }
      ],
      notes: `Pendaftaran Paket Membership ${tierName.toUpperCase()}`
    };

    setIsUploadingMembership(true);
    try {
      const res = await API.createBooking(newBooking);
      setBookings(prev => [res, ...prev]);
      setBuyingMembershipTier(null);
      setMembershipPaymentMethod('');
      setMembershipProofImage(null);
      alert('Pendaftaran membership berhasil diajukan! Admin kami akan memverifikasi bukti pembayaran Anda segera.');
    } catch (err: any) {
      alert('Gagal mengajukan membership: ' + err.message);
    } finally {
      setIsUploadingMembership(false);
    }
  };

  const handleUploadProofSubmit = async () => {
    if (!uploadingBooking || !proofImage) return;

    const updated: Booking = {
      ...uploadingBooking,
      status: 'diproses',
      paymentProofUrl: proofImage
    };

    try {
      const res = await API.updateBooking(updated);
      setBookings(prev => prev.map(b => b.id === uploadingBooking.id ? res : b));
      setUploadingBooking(null);
      setProofImage(null);
      alert('Bukti pembayaran Anda sukses diunggah! Operator kami akan segera memverifikasi.');
    } catch (err: any) {
      alert(`Gagal mengunggah bukti pembayaran: ${err.message}`);
    }
  };

  return (
    <div className="font-sans py-12 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-sport-navy to-sport-navy-light text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <img 
              src={user.photoUrl} 
              alt={user.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-sport-green shadow-lg shrink-0"
            />
            <div>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight">{user.name}</h2>
              <p className="text-xs text-gray-300 font-mono mt-1">{user.email} | {user.phone}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2.5">
                <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-white/10">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Member {user.membership}
                </span>
                <span className="bg-sport-green/10 text-sport-green-bright text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-sport-green/20">
                  <Sparkles className="w-3.5 h-3.5" /> {user.points} Points
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1 shrink-0 text-center md:text-right">
            <span className="text-[10px] text-gray-300 uppercase tracking-widest font-mono">Kode Referral Saya</span>
            <span className="text-xl font-black text-sport-green-bright tracking-wider font-mono select-all">{user.referralCode}</span>
            <span className="text-[9px] text-gray-400 mt-0.5">Bagikan kode Anda &amp; raih bonus 50 poin!</span>
          </div>
        </div>

        {/* Navigation Sidebar vs Content Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation links */}
          <div className="flex flex-col gap-1 bg-white dark:bg-sport-slate rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800/80 h-fit">
            {[
              { id: 'bookings', label: 'Booking Saya', icon: <Calendar className="w-4.5 h-4.5" /> },
              { id: 'riwayatPembayaran', label: 'Riwayat Pembayaran', icon: <CreditCard className="w-4.5 h-4.5" /> },
              { id: 'profil', label: 'Pengaturan Profil', icon: <User className="w-4.5 h-4.5" /> },
              { id: 'membership', label: 'Paket Membership', icon: <Award className="w-4.5 h-4.5" /> },
              { id: 'referral', label: 'Afiliasi & Referral', icon: <Compass className="w-4.5 h-4.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sport-navy text-white dark:bg-sport-navy-light shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
            
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              Keluar Sesi
            </button>
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-3">
            
            {/* BOOKINGS HISTORY TAB */}
            {activeTab === 'bookings' && (
              <div className="flex flex-col gap-6 bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Booking Saya</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Kelola penyewaan lapangan aktif Anda secara real-time.</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-sport-navy/5 text-sport-navy dark:bg-sport-navy/20 dark:text-sport-green rounded-lg">
                    Total: {bookings.length} Pesanan
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-3">
                    <span className="text-4xl">🗓️</span>
                    <p className="text-sm font-semibold text-gray-400">Anda belum pernah melakukan pemesanan lapangan olahraga.</p>
                    <button 
                      onClick={() => onNavigate('lapangan')}
                      className="px-5 py-2.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark text-xs font-black rounded-xl transition duration-300"
                    >
                      Pesan Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.slice().reverse().map((book) => {
                      const associatedPayment = userPayments.find(p => p.bookingId === book.id);
                      
                      // Map the 4 user-facing payment statuses:
                      // 1. Menunggu Pembayaran
                      const isWaitingPayment = book.status === 'menunggu_pembayaran' || book.status === 'pending';
                      // 2. Sedang Diverifikasi
                      const isVerifying = book.status === 'sedang_diverifikasi' || book.status === 'diproses';
                      // 3. Dikonfirmasi
                      const isConfirmed = book.status === 'dikonfirmasi' || book.status === 'selesai' || book.status === 'booking_diproses' || book.status === 'booking_selesai';
                      // 4. Pembayaran Ditolak
                      const isRejected = book.status === 'pembayaran_ditolak' || book.status === 'ditolak' || book.status === 'booking_dibatalkan';

                      return (
                        <div 
                          key={book.id}
                          className="p-5 bg-gray-50 dark:bg-sport-dark/65 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex flex-col gap-5 hover:border-gray-300 dark:hover:border-gray-700 transition duration-300"
                        >
                          {/* Card Header Info */}
                          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-150 dark:border-gray-800 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-black text-gray-900 dark:text-white">#{book.invoiceNumber}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{new Date(book.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Badge status */}
                            {isWaitingPayment && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 text-[10px] font-black uppercase tracking-wider rounded-lg font-mono">
                                Menunggu Pembayaran
                              </span>
                            )}
                            {isVerifying && (
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg font-mono animate-pulse">
                                Sedang Diverifikasi
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-lg font-mono">
                                Dikonfirmasi
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg font-mono">
                                Pembayaran Ditolak / Batal
                              </span>
                            )}
                          </div>

                          {/* Mid Section: Details and Dynamic UI Block based on status */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* Rental details */}
                            <div className="lg:col-span-6 space-y-3">
                              <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Informasi Lapangan & Slot</h4>
                                <div className="mt-2 space-y-1.5">
                                  {book.details.map((d, i) => (
                                    <p key={i} className="text-xs text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                      ⚽ <strong className="text-gray-900 dark:text-white font-semibold">{d.courtName}</strong> ({d.date} • Jam {d.timeSlot})
                                    </p>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Pemesan</span>
                                <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 font-bold">{book.userName} <span className="text-gray-500 font-mono">({book.userPhone})</span></p>
                                {book.notes && (
                                  <p className="text-[11px] text-gray-500 italic mt-1 bg-white dark:bg-sport-slate/30 p-2 rounded border border-gray-100 dark:border-gray-800">
                                    Catatan: "{book.notes}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Dynamic state representation layout (Right block) */}
                            <div className="lg:col-span-6 bg-white dark:bg-sport-slate/60 p-4 rounded-2xl border border-gray-150 dark:border-gray-800">
                              {isWaitingPayment && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                    <span>⚠️</span>
                                    <p>Selesaikan pembayaran untuk mengamankan slot bermain Anda!</p>
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Batas transfer sewa sebelum dibatalkan otomatis adalah 60 menit dari pemesanan sewa ini.</p>
                                  <div className="flex items-baseline justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <span className="text-[10px] font-bold text-gray-400">Total Tagihan:</span>
                                    <span className="text-base font-black text-sport-navy dark:text-sport-green font-mono">Rp {book.finalAmount.toLocaleString('id-ID')}</span>
                                  </div>
                                </div>
                              )}

                              {isVerifying && (
                                <div className="space-y-3 text-center py-2">
                                  <span className="text-2xl animate-spin block">🔄</span>
                                  <p className="text-xs font-black text-amber-700 dark:text-amber-400">Pembayaran Anda Sedang Diperiksa</p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Bukti transfer sudah diunggah oleh Anda. Harap tunggu verifikasi manual dari Admin dalam 5-10 menit.</p>
                                  {associatedPayment && (
                                    <div className="mt-2 bg-gray-50 dark:bg-sport-dark/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 text-[10px] text-left space-y-1 font-mono text-gray-500">
                                      <p>• Pengirim: {associatedPayment.senderName}</p>
                                      <p>• Bank: {associatedPayment.senderBank.toUpperCase()}</p>
                                      <p>• Transfer: Rp {associatedPayment.amountTransfer.toLocaleString('id-ID')}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {isConfirmed && (
                                <div className="flex flex-col items-center text-center gap-3">
                                  {/* QR Code Container */}
                                  <div className="p-3 bg-white rounded-xl border border-gray-250 shadow-sm flex flex-col items-center gap-1.5">
                                    {/* Styled high tech vector QR placeholder */}
                                    <div className="w-24 h-24 bg-gray-950 relative flex items-center justify-center rounded overflow-hidden">
                                      {/* Decorative corner lines */}
                                      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-sport-green"></div>
                                      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-sport-green"></div>
                                      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-sport-green"></div>
                                      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-sport-green"></div>
                                      
                                      {/* QR core pixel grid simulations */}
                                      <div className="w-16 h-16 grid grid-cols-4 gap-1">
                                        {[...Array(16)].map((_, i) => (
                                          <div 
                                            key={i} 
                                            className={`rounded-sm ${(i * 7 + 13) % 3 === 0 ? 'bg-white' : 'bg-transparent'}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <span className="text-[8px] text-gray-400 font-mono font-bold tracking-widest">SCAN CHECK-IN</span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <p className="text-xs font-black text-green-700 dark:text-green-400 flex items-center justify-center gap-1">
                                      <span>✅</span> KUITANSI ELEKTRONIK SAH
                                    </p>
                                    <p className="text-[10px] text-gray-500">Gunakan Kode QR diatas untuk verifikasi saat memasuki area lapangan UTM Sport.</p>
                                    <span className="text-[11px] font-mono font-black text-gray-700 dark:text-white">Total Lunas: Rp {book.finalAmount.toLocaleString('id-ID')}</span>
                                  </div>
                                </div>
                              )}

                              {isRejected && (
                                <div className="space-y-3">
                                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-1">
                                    <p className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1">
                                      <span>❌</span> Transaksi Gagal / Ditolak
                                    </p>
                                    <p className="text-[10px] text-red-700 dark:text-red-400 font-medium">
                                      Alasan: "{book.notes?.includes('Alasan:') ? book.notes.substring(book.notes.indexOf('Alasan:')) : 'Bukti transfer tidak cocok atau kedaluwarsa.'}"
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-gray-500 leading-relaxed">Harap periksa kembali nomor rekening tujuan dan nominal transfer, kemudian kirim ulang bukti bayar yang benar.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer: Action buttons row */}
                          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-800 pt-3">
                            <span className="text-xs font-bold font-mono text-gray-700 dark:text-white">
                              Total Bayar: Rp {book.finalAmount.toLocaleString('id-ID')}
                            </span>

                            <div className="flex gap-2 flex-wrap">
                              {isWaitingPayment && (
                                <>
                                  <button
                                    onClick={() => onNavigate('pembayaran', book.id)}
                                    className="px-4 py-2 bg-sport-navy hover:bg-sport-navy-light text-white font-extrabold text-[10px] rounded-xl shadow transition duration-200 flex items-center gap-1 cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" /> BAYAR SEKARANG
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(book)}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-extrabold text-[10px] rounded-xl transition duration-200 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> BATALKAN BOOKING
                                  </button>
                                </>
                              )}

                              {isConfirmed && (
                                <button
                                  onClick={() => setSelectedBookingForReceipt(book)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-extrabold text-[10px] rounded-xl shadow transition duration-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" /> LIHAT & CETAK E-TIKET
                                </button>
                              )}

                              {(isWaitingPayment || isVerifying) && (
                                <button
                                  onClick={() => setSelectedBookingForReceipt(book)}
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-extrabold text-[10px] rounded-xl transition duration-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-gray-400" /> LIHAT INVOICE / DETAIL
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  onClick={() => onNavigate('pembayaran', book.id)}
                                  className="px-4 py-2 bg-sport-navy hover:bg-sport-navy-light text-white font-extrabold text-[10px] rounded-xl shadow transition duration-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" /> KIRIM ULANG BUKTI PEMBAYARAN
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RIWAYAT PEMBAYARAN (TRANSAKSI) TAB */}
            {activeTab === 'riwayatPembayaran' && (
              <div className="flex flex-col gap-6 bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Riwayat Pembayaran</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Laporan transaksi penyewaan lapangan Anda.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-lg">
                    Selesai: {userPayments.length} Transaksi
                  </span>
                </div>

                {userPayments.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <span className="text-3xl block mb-2">💸</span>
                    <p className="text-xs font-semibold">Anda belum memiliki riwayat transaksi pembayaran.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-sport-dark text-gray-500 font-bold border-b border-gray-250 dark:border-gray-800">
                          <th className="p-3.5 font-mono">Invoice ID</th>
                          <th className="p-3.5">Nama Pengirim</th>
                          <th className="p-3.5 font-mono">Bank Asal</th>
                          <th className="p-3.5 font-mono">Nominal</th>
                          <th className="p-3.5 font-mono">Tanggal Transfer</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                        {userPayments.map((pay) => {
                          const matchingBook = bookings.find(b => b.id === pay.bookingId);
                          return (
                            <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-sport-dark/20 text-gray-700 dark:text-gray-300">
                              <td className="p-3.5 font-mono font-bold text-gray-950 dark:text-white">
                                #{matchingBook?.invoiceNumber || pay.bookingId}
                              </td>
                              <td className="p-3.5 font-semibold text-gray-850 dark:text-white">{pay.senderName}</td>
                              <td className="p-3.5 font-mono uppercase font-semibold">{pay.senderBank}</td>
                              <td className="p-3.5 font-mono font-bold text-gray-950 dark:text-white">
                                Rp {pay.amountTransfer.toLocaleString('id-ID')}
                              </td>
                              <td className="p-3.5 font-mono">{pay.transferDate} • {pay.transferTime}</td>
                              <td className="p-3.5">
                                {pay.status === 'sedang_diverifikasi' && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded text-[10px] font-bold uppercase font-mono animate-pulse">
                                    VERIFIKASI
                                  </span>
                                )}
                                {(pay.status === 'berhasil' || pay.status === 'pembayaran_diterima') && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400 rounded text-[10px] font-bold uppercase font-mono">
                                    BERHASIL
                                  </span>
                                )}
                                {(pay.status === 'gagal' || pay.status === 'pembayaran_ditolak') && (
                                  <div>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 rounded text-[10px] font-bold uppercase font-mono">
                                      DITOLAK
                                    </span>
                                    {pay.rejectionReason && (
                                      <p className="text-[10px] text-red-500 font-semibold mt-1">Alasan: "{pay.rejectionReason}"</p>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === 'profil' && (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Edit Profil Pengguna</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Nama Lengkap:</label>
                    <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">No. Telepon / WhatsApp:</label>
                    <input 
                      type="tel" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2">Foto Profil:</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-sport-dark relative shrink-0">
                      <img 
                        src={profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                        alt="profile preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-sport-navy hover:bg-sport-navy-light text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-sport-green" />
                        <span>{isUploadingPhoto ? 'Mengunggah...' : 'Pilih & Upload Foto Profil'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProfilePhotoUpload} 
                          disabled={isUploadingPhoto}
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1.5">Mendukung format PNG, JPG, JPEG maks. 5MB. Foto profil baru akan diterapkan setelah Anda mengunggah.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex justify-end gap-2">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-bold text-xs rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

            {/* MEMBERSHIP TAB */}
            {activeTab === 'membership' && (
              <div className="flex flex-col gap-6 bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Program Loyalitas Membership</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-sport-navy/10 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green px-2 py-0.5 rounded-full font-bold uppercase">
                      Aktif: {user.membership || 'Standard'}
                    </span>
                    {user.membershipExpiresAt && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        Expires: {new Date(user.membershipExpiresAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed -mt-2">
                  Bergabunglah dengan program loyalitas UTM Sport Center untuk mendapatkan potongan harga langsung secara otomatis untuk seluruh pemesanan lapangan Futsal kami.
                </p>

                {/* Display Current Pending Requests */}
                {(() => {
                  const pendingMemb = bookings.find(b => b.bookingType === 'membership' && b.status === 'diproses');
                  if (!pendingMemb) return null;
                  return (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-700 dark:text-yellow-400 flex flex-col gap-1.5 animate-pulse">
                      <span className="font-bold">⏳ Pendaftaran Membership Sedang Diproses</span>
                      <p>Pendaftaran paket membership Anda sedang diverifikasi oleh admin. Kami akan mengaktifkan benefit Anda secara otomatis setelah pembayaran disetujui.</p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                  {(membershipPackagesList.length > 0 ? membershipPackagesList : [
                    {
                      id: 'bronze',
                      name: 'Bronze',
                      price: 50000,
                      discountPercent: 5,
                      cashbackMultiplier: 1.0,
                      priorityDays: 3,
                      description: 'Akses jadwal prioritas H-3 dan diskon pemesanan langsung sebesar 5%.',
                      features: []
                    },
                    {
                      id: 'silver',
                      name: 'Silver',
                      price: 100000,
                      discountPercent: 10,
                      cashbackMultiplier: 1.5,
                      priorityDays: 5,
                      description: 'Akses jadwal prioritas H-5 dan diskon pemesanan langsung sebesar 10%.',
                      features: []
                    },
                    {
                      id: 'gold',
                      name: 'Gold',
                      price: 200000,
                      discountPercent: 15,
                      cashbackMultiplier: 2.0,
                      priorityDays: 7,
                      description: 'Benefit maksimal dengan diskon 15%, cashback point 2x, prioritas booking H-7, dan VIP Lounge Gratis.',
                      features: ['VIP Lounge Gratis']
                    }
                  ]).map((pkg) => {
                    const isCurrent = user.membership?.toLowerCase() === pkg.id.toLowerCase() || user.membership?.toLowerCase() === pkg.name.toLowerCase();
                    const isDowngradeOrCurrent = user.membership && (
                      (user.membership.toLowerCase() === 'gold' && (pkg.name.toLowerCase() === 'silver' || pkg.name.toLowerCase() === 'bronze')) ||
                      (user.membership.toLowerCase() === 'silver' && pkg.name.toLowerCase() === 'bronze') ||
                      isCurrent
                    );

                    return (
                      <div 
                        key={pkg.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                          isCurrent 
                            ? 'border-sport-green bg-sport-green/5 dark:bg-sport-green/10' 
                            : 'border-gray-100 dark:border-gray-800'
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            pkg.name.toLowerCase() === 'bronze' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                            pkg.name.toLowerCase() === 'silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-300' :
                            pkg.name.toLowerCase() === 'gold' ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/40' :
                            'bg-sport-navy/10 text-sport-navy dark:bg-sport-green/15 dark:text-sport-green'
                          }`}>
                            {pkg.name} LEVEL
                          </span>
                          <p className="text-2xl font-black mt-2 text-gray-900 dark:text-white">
                            Rp {pkg.price.toLocaleString('id-ID')}
                            <span className="text-xs text-gray-400 font-normal">/bulan</span>
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{pkg.description}</p>
                          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                            <li>• Diskon Booking Lapangan <strong>{pkg.discountPercent}%</strong></li>
                            <li>• Cashback Point Reward <strong>{pkg.cashbackMultiplier}x</strong></li>
                            <li>• Akses jadwal prioritas <strong>H-{pkg.priorityDays}</strong></li>
                            {pkg.features && pkg.features.map((feat, fIdx) => (
                              <li key={fIdx}>• {feat}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => handleBuyMembership(pkg.id)}
                          disabled={isDowngradeOrCurrent}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrent 
                              ? 'bg-sport-green text-sport-navy' 
                              : 'bg-sport-navy dark:bg-sport-navy-light text-white hover:bg-sport-navy-light'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {isCurrent ? 'Tier Aktif' : isDowngradeOrCurrent ? 'Tingkatan Aktif' : 'Aktifkan'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REFERRAL TAB */}
            {activeTab === 'referral' && (
              <div className="flex flex-col gap-6 bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 text-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Sistem Afiliasi &amp; Referral</h3>

                <div className="p-4 bg-sport-navy/5 rounded-xl border border-sport-navy/10 dark:border-sport-navy-light/20 leading-relaxed text-gray-600 dark:text-gray-300">
                  <p className="font-semibold text-sport-navy dark:text-sport-green mb-1">Dapatkan Poin Melimpah!</p>
                  Setiap kali teman Anda mendaftar menggunakan Kode Referral Anda dan melakukan booking pertamanya, Anda akan otomatis mendapatkan <strong className="text-sport-navy dark:text-sport-green">50 Point Reward</strong> gratis, dan teman Anda akan meraih <strong className="text-sport-navy dark:text-sport-green">10 Point Reward</strong> bonus registrasi!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-200/60 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono uppercase">Kode Referral Anda:</span>
                    <span className="text-2xl font-black text-sport-navy dark:text-sport-green-bright font-mono tracking-wider select-all mt-1 block">{user.referralCode}</span>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-medium">Point dari Referral:</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-white mt-1">0 Poin (0 Teman bergabung)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Upload payment receipt overlay modal */}
      {uploadingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sport-slate rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-sm uppercase font-mono text-gray-400">Kirim Bukti Bayar - #{uploadingBooking.invoiceNumber}</h3>
              <button onClick={() => setUploadingBooking(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">✕</button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">Silakan unggah foto struk/bukti transfer bank atau tangkapan layar pembayaran e-wallet Anda.</p>

            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-28 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors p-2 text-center text-xs text-gray-400">
                <Upload className="w-6 h-6 text-gray-300 mb-1" />
                <span>Pilih file gambar</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProofImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {proofImage && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 relative shrink-0">
                  <img src={proofImage} alt="receipt" className="w-full h-full object-cover" />
                  <button onClick={() => setProofImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]">✕</button>
                </div>
              )}
            </div>

            <button
              onClick={handleUploadProofSubmit}
              disabled={!proofImage}
              className="w-full py-2.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40"
            >
              Kirim Bukti Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* Membership purchase payment form modal */}
      {(() => {
        if (!buyingMembershipTier) return null;
        const selectedPkg = membershipPackagesList.find(p => p.id === buyingMembershipTier || p.name.toLowerCase() === buyingMembershipTier.toLowerCase());
        const cost = selectedPkg ? selectedPkg.price : (buyingMembershipTier === 'bronze' ? 50000 : (buyingMembershipTier === 'silver' ? 100000 : 200000));
        const tierName = selectedPkg ? selectedPkg.name : buyingMembershipTier;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-sport-slate rounded-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-bold text-sm uppercase font-mono text-gray-500 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Pendaftaran Membership {tierName.toUpperCase()}</span>
                </h3>
                <button 
                  onClick={() => setBuyingMembershipTier(null)} 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
                <p className="font-bold">Informasi Tagihan:</p>
                <p className="mt-1 font-sans text-sm">
                  Total Transfer: <strong className="font-mono text-base text-sport-navy dark:text-sport-green-bright">
                    Rp {cost.toLocaleString('id-ID')}
                  </strong>
                </p>
                <p className="text-[11px] mt-1 text-gray-500 dark:text-gray-400">
                  Pendaftaran Anda akan diproses oleh admin setelah mengunggah struk transfer yang valid.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">1. Kirim Transfer ke Rekening:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {bankAccounts.map((account, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-sport-dark/40 flex flex-col gap-1 text-xs"
                    >
                      <span className="font-bold text-sport-navy dark:text-sport-green-bright text-xs">{account.name}</span>
                      <p className="font-mono text-sm font-bold tracking-wider select-all text-gray-900 dark:text-white">{account.accountNumber}</p>
                      <p className="text-[10px] text-gray-500">A/N {account.accountHolder}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitMembershipPurchase} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">2. Pilih Rekening Tujuan Transfer Anda:</label>
                    <select
                      required
                      value={membershipPaymentMethod}
                      onChange={(e) => setMembershipPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:outline-none focus:border-sport-navy"
                    >
                      <option value="" className="dark:bg-sport-slate">-- Pilih Rekening Tujuan --</option>
                      {bankAccounts.map((acc, i) => (
                        <option key={i} value={acc.name} className="dark:bg-sport-slate">
                          {acc.name} - {acc.accountNumber} ({acc.accountHolder})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">3. Unggah Struk / Bukti Pembayaran (Wajib &amp; Dapat Dipreview):</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-24 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors p-2 text-center text-xs text-gray-400">
                        <Upload className="w-5 h-5 text-gray-300 mb-1" />
                        <span>Pilih file gambar struk</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setMembershipProofImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {membershipProofImage && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative shrink-0">
                          <img src={membershipProofImage} alt="receipt" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setMembershipProofImage(null)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!membershipPaymentMethod || !membershipProofImage || isUploadingMembership}
                    className="w-full py-2.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark text-xs font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploadingMembership ? 'Mengirim...' : 'Kirim Bukti & Daftar Membership'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* E-Ticket & Receipt Modal Overlay */}
      {selectedBookingForReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-sport-slate rounded-3xl w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden max-h-[95vh] relative animate-in fade-in zoom-in duration-200">
            {/* Top Close Button */}
            <button 
              onClick={() => setSelectedBookingForReceipt(null)}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 cursor-pointer z-10 transition duration-150"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ticket Header */}
            <div className="bg-sport-navy text-white px-6 py-7 text-center relative border-b border-gray-150 dark:border-gray-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-sport-green font-mono">UTM SPORT ARENA</span>
              <h3 className="font-extrabold text-base tracking-tight mt-1">KUITANSI & E-TIKET DIGITAL</h3>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">#{selectedBookingForReceipt.invoiceNumber}</p>
            </div>

            {/* Ticket Body Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 select-none">
              {/* Status Badge Centered */}
              <div className="text-center">
                {(() => {
                  const s = selectedBookingForReceipt.status;
                  if (s === 'dikonfirmasi' || s === 'selesai' || s === 'booking_diproses' || s === 'booking_selesai') {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-600 dark:text-sport-green border border-green-500/20 text-[10px] font-black uppercase tracking-wider rounded-full font-mono">
                        ✅ LUNAS & TERVERIFIKASI
                      </span>
                    );
                  } else if (s === 'sedang_diverifikasi' || s === 'diproses') {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider rounded-full font-mono animate-pulse">
                        ⏳ SEDANG DIVERIFIKASI
                      </span>
                    );
                  } else if (s === 'menunggu_pembayaran' || s === 'pending') {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[10px] font-black uppercase tracking-wider rounded-full font-mono">
                        ⚠️ BELUM LUNAS (MENUNGGU BAYAR)
                      </span>
                    );
                  } else {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-black uppercase tracking-wider rounded-full font-mono">
                        ❌ GAGAL / DIBATALKAN
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-b border-gray-150 dark:border-gray-850 pb-4 text-xs text-left">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Nama Pemesan</span>
                  <span className="font-extrabold text-gray-850 dark:text-gray-100 mt-0.5 block">{selectedBookingForReceipt.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">No. Telepon</span>
                  <span className="font-semibold text-gray-850 dark:text-gray-200 mt-0.5 block font-mono">{selectedBookingForReceipt.userPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Metode Bayar</span>
                  <span className="font-bold text-gray-850 dark:text-gray-200 mt-0.5 block uppercase font-mono">{selectedBookingForReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Tgl Pembelian</span>
                  <span className="font-semibold text-gray-850 dark:text-gray-200 mt-0.5 block font-mono">
                    {new Date(selectedBookingForReceipt.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-gray-150 dark:border-gray-850 pb-4 text-left">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-1">Rincian Sewa Lapangan</span>
                {selectedBookingForReceipt.details.map((d, i) => (
                  <div key={i} className="flex justify-between items-start gap-4 text-xs bg-gray-50 dark:bg-sport-dark/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-gray-800 dark:text-white block">{d.courtName}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{d.date} • Jam {d.timeSlot}</span>
                    </div>
                    <span className="font-bold font-mono text-gray-900 dark:text-white shrink-0">
                      Rp {d.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Billing Summary Box */}
              <div className="bg-gray-50/50 dark:bg-sport-dark/20 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono">Rp {selectedBookingForReceipt.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                {selectedBookingForReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-red-500">
                    <span>Diskon Voucher</span>
                    <span className="font-mono">-Rp {selectedBookingForReceipt.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white border-t border-dashed border-gray-200 dark:border-gray-800 pt-2">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-green-600 dark:text-sport-green">
                    Rp {selectedBookingForReceipt.finalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Simulated High-Tech QR Code */}
              {(selectedBookingForReceipt.status === 'dikonfirmasi' || selectedBookingForReceipt.status === 'selesai' || selectedBookingForReceipt.status === 'booking_diproses' || selectedBookingForReceipt.status === 'booking_selesai') ? (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="p-3 bg-white rounded-2xl border border-gray-250 shadow-sm flex flex-col items-center gap-1.5">
                    <div className="w-32 h-32 bg-gray-950 relative flex items-center justify-center rounded-xl overflow-hidden">
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 border-t-3 border-l-3 border-sport-green"></div>
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 border-t-3 border-r-3 border-sport-green"></div>
                      <div className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-3 border-l-3 border-sport-green"></div>
                      <div className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-3 border-r-3 border-sport-green"></div>
                      
                      <div className="w-20 h-20 grid grid-cols-4 gap-1.5">
                        {[...Array(16)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-sm ${(i * 7 + 13) % 3 === 0 ? 'bg-white' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono font-bold tracking-widest uppercase">SCAN UNTUK CHECK-IN</span>
                </div>
              ) : (
                <div className="text-center py-2 bg-amber-500/5 rounded-xl border border-dashed border-amber-500/20">
                  <p className="text-[10px] text-amber-600 font-medium">QR Code Check-in akan aktif setelah pembayaran diverifikasi oleh admin.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 dark:bg-sport-dark/50 border-t border-gray-150 dark:border-gray-800/80 flex gap-3">
              <button
                onClick={() => setSelectedBookingForReceipt(null)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => handlePrintReceipt(selectedBookingForReceipt)}
                className="flex-1 py-2.5 bg-sport-navy hover:bg-sport-navy-light dark:bg-sport-navy-light text-white text-xs font-black rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-sport-green" /> Cetak / Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
