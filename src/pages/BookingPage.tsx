/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Receipt, Ticket, CreditCard, ShieldCheck, 
  Upload, Printer, Download, Eye, Sparkles, AlertCircle, ArrowLeft, Heart 
} from 'lucide-react';
import { Court, ScheduleSlot, UserProfile, Booking, Voucher, PaymentMethod, MembershipPackage } from '../types';
import { API } from '../api';

interface BookingPageProps {
  courts: Court[];
  user: UserProfile | null;
  selectedCourtFromParent: Court | null;
  onNavigate: (view: string, extraId?: string) => void;
  onBookingSuccess: () => void;
}

export default function BookingPage({ 
  courts, 
  user, 
  selectedCourtFromParent, 
  onNavigate,
  onBookingSuccess
}: BookingPageProps) {
  // Court & Date selections
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(selectedCourtFromParent || (courts.length > 0 ? courts[0] : null));
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [bookingType, setBookingType] = useState<'harian' | 'mingguan' | 'bulanan' | 'event' | 'turnamen'>('harian');
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // holds slot timeSlot strings
  const [notes, setNotes] = useState('');

  // Voucher / Promotion state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Payment method selection
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('BCA');
  const [membershipPackages, setMembershipPackages] = useState<MembershipPackage[]>([]);

  // Booking Flow Phase: 'form' | 'success'
  const [bookingPhase, setBookingPhase] = useState<'form' | 'success'>('form');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Upload proof of payment state
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load schedule slots for selected court & date
  useEffect(() => {
    if (selectedCourt) {
      API.getSchedules(selectedCourt.id, bookingDate)
        .then(setScheduleSlots)
        .catch(console.error);
    }
  }, [selectedCourt, bookingDate]);

  // Load payment channels and membership packages
  useEffect(() => {
    API.getPaymentMethods()
      .then(setPaymentMethods)
      .catch(console.error);

    API.getMembershipPackages()
      .then(setMembershipPackages)
      .catch(console.error);
  }, []);

  // Recalculate values
  const hourlyRate = selectedCourt ? selectedCourt.price : 0;
  const hoursBooked = selectedSlots.length;
  const subtotal = hourlyRate * hoursBooked;

  // Membership discount and priority days calculation
  let membershipDiscountPercent = 0;
  let priorityDays = 2; // Default for standard users is H-2
  if (user && user.membership) {
    const pkg = membershipPackages.find(p => p.id === user.membership || p.name.toLowerCase() === user.membership.toLowerCase());
    if (pkg) {
      membershipDiscountPercent = pkg.discountPercent;
      priorityDays = pkg.priorityDays;
    } else {
      // Fallback
      if (user.membership === 'bronze') {
        membershipDiscountPercent = 5;
        priorityDays = 3;
      } else if (user.membership === 'silver') {
        membershipDiscountPercent = 10;
        priorityDays = 5;
      } else if (user.membership === 'gold') {
        membershipDiscountPercent = 15;
        priorityDays = 7;
      }
    }
  }

  // Calculate the max allowed date in YYYY-MM-DD
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + priorityDays);
    return d.toISOString().split('T')[0];
  })();

  const membershipDiscount = subtotal * (membershipDiscountPercent / 100);

  // Voucher discount
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percent') {
      voucherDiscount = (subtotal - membershipDiscount) * (appliedVoucher.value / 100);
    } else {
      voucherDiscount = appliedVoucher.value;
    }
  }

  const finalAmount = Math.max(0, subtotal - membershipDiscount - voucherDiscount);

  const toggleSlotSelection = (timeSlot: string, status: string) => {
    if (status !== 'tersedia') return; // Cannot book ordered slots

    setSelectedSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(s => s !== timeSlot) 
        : [...prev, timeSlot]
    );
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const voucher = await API.verifyVoucher(voucherCode);
      if (subtotal < voucher.minPurchase) {
        setVoucherError(`Min. transaksi untuk voucher ini adalah Rp ${voucher.minPurchase.toLocaleString('id-ID')}`);
        return;
      }
      setAppliedVoucher(voucher);
      setVoucherSuccess(`Kupon ${voucher.code} berhasil diterapkan! Potongan Rp ${voucher.value} ${voucher.discountType === 'percent' ? '%' : ''}`);
    } catch (err: any) {
      setVoucherError(err.message || 'Kupon tidak ditemukan atau sudah habis masa berlakunya.');
      setAppliedVoucher(null);
    }
  };

  const handleCreateBooking = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk melakukan pemesanan!');
      onNavigate('login');
      return;
    }

    if (selectedSlots.length === 0) {
      alert('Silakan pilih minimal 1 slot jam bermain!');
      return;
    }

    // Programmatic priority booking validation check
    if (bookingDate > maxDate) {
      alert(`Maaf, batas booking untuk tingkat membership Anda saat ini adalah H-${priorityDays} (Hingga ${new Date(maxDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}). Silakan pilih tanggal lain atau tingkatkan paket membership Anda!`);
      return;
    }

    const bookingDetails = selectedSlots.map(slot => ({
      id: `det-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingId: '',
      courtId: selectedCourt!.id,
      courtName: selectedCourt!.name,
      date: bookingDate,
      timeSlot: slot,
      price: hourlyRate
    }));

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const bookingPayload: Booking = {
      id: `book-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      invoiceNumber,
      courtCategory: selectedCourt!.category,
      totalAmount: subtotal,
      discountAmount: membershipDiscount + voucherDiscount,
      finalAmount,
      paymentMethod: selectedPaymentMethod,
      bookingType,
      status: 'menunggu_pembayaran',
      notes,
      createdAt: new Date().toISOString(),
      details: bookingDetails,
      promoCode: appliedVoucher?.code,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invoiceNumber}`
    };

    try {
      const response = await API.createBooking(bookingPayload);
      setCreatedBooking(response);
      onBookingSuccess();
      
      // Update points in current local session as well
      const updatedUser = { ...user, points: user.points + Math.floor(finalAmount / 1000) };
      API.setCurrentUser(updatedUser);

      // Redirect immediately to payment page with booking id
      onNavigate('pembayaran', response.id);

    } catch (err: any) {
      alert(`Gagal membuat booking: ${err.message}`);
    }
  };

  // Image Upload Handler
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        setPaymentProof(base64Data);
        setIsUploading(false);
        setUploadSuccess(true);

        // Automatically submit payment proof to backend immediately
        if (createdBooking) {
          const updated: Booking = {
            ...createdBooking,
            status: 'diproses', // update status to diproses
            paymentProofUrl: base64Data
          };

          try {
            const res = await API.updateBooking(updated);
            setCreatedBooking(res);
            alert('Bukti pembayaran Anda berhasil diunggah! Operator kami akan memvalidasi pesanan Anda sesegera mungkin.');
          } catch (err: any) {
            alert(`Gagal mengirim bukti pembayaran: ${err.message}`);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit proof and change booking state
  const handleSubmitProof = async () => {
    if (!createdBooking || !paymentProof) return;

    const updated: Booking = {
      ...createdBooking,
      status: 'diproses', // update status to diproses
      paymentProofUrl: paymentProof
    };

    try {
      const res = await API.updateBooking(updated);
      setCreatedBooking(res);
      alert('Bukti pembayaran Anda berhasil diunggah! Operator kami akan memvalidasi pesanan Anda sesegera mungkin.');
    } catch (err: any) {
      alert(`Gagal mengirim bukti pembayaran: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (bookingPhase === 'success' && createdBooking) {
    const selectedPayChannel = paymentMethods.find(p => p.name === selectedPaymentMethod);
    return (
      <div className="py-12 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen font-sans">
        <div className="responsive-container max-w-3xl">
          
          {/* Booking Confirmation / Invoice view */}
          <div className="bg-white dark:bg-sport-slate rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col gap-6" id="invoice-print-area">
            
            {/* Header Success */}
            <div className="text-center pb-5 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center gap-1.5">
              <span className="text-4xl">🎉</span>
              <h2 className="text-2xl font-extrabold text-sport-navy dark:text-sport-green">Booking Berhasil Dibuat!</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">Invoice Number: {createdBooking.invoiceNumber}</p>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Order Info */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Informasi Penyewaan</h4>
                <div className="p-4 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Penyewa:</span>
                    <span className="font-bold">{createdBooking.userName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Lapangan:</span>
                    <span className="font-bold text-sport-navy dark:text-white">{selectedCourt?.name}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tanggal Main:</span>
                    <span className="font-bold font-mono">{bookingDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Jam Booking:</span>
                    <span className="font-bold text-xs">{selectedSlots.join(', ')}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Metode Bayar:</span>
                    <span className="font-bold text-sport-green">{createdBooking.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status Booking:</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-bold uppercase rounded font-mono">
                      {createdBooking.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* QR checkin & billing */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-100 dark:border-gray-800/80">
                <img src={createdBooking.qrCodeUrl} alt="Booking QR Code" className="w-32 h-32 object-contain bg-white p-2 rounded-lg border border-gray-200" />
                <p className="text-xs font-bold text-gray-800 dark:text-white mt-3 font-mono">Check-In QR Code</p>
                <p className="text-[10px] text-gray-500 text-center mt-1">Tunjukkan QR ini pada operator setiba di UTM Sport Center</p>
              </div>

            </div>

            {/* Price breakdown */}
            <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal Sewa ({selectedSlots.length} Jam):</span>
                <span className="font-mono font-bold">Rp {createdBooking.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              {createdBooking.discountAmount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Total Diskon (Kupon + Member):</span>
                  <span className="font-mono font-bold">- Rp {createdBooking.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-gray-100 dark:border-gray-800">
                <span className="text-gray-800 dark:text-white">Total Pembayaran:</span>
                <span className="font-mono text-sport-navy dark:text-sport-green">Rp {createdBooking.finalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Payment Transfer Instructions Box */}
            {createdBooking.status === 'pending' && (
              <div className="p-5 bg-sport-navy/5 rounded-xl border border-sport-navy/10 dark:border-sport-navy-light/20 flex flex-col gap-3.5">
                <h4 className="text-sm font-bold text-sport-navy dark:text-sport-green-bright flex items-center gap-1.5 uppercase font-mono">
                  <CreditCard className="w-4.5 h-4.5" /> Panduan Pembayaran Transfer
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Silakan lakukan transfer sejumlah nominal tepat sebesar <strong className="text-sport-navy dark:text-sport-green font-mono">Rp {createdBooking.finalAmount.toLocaleString('id-ID')}</strong> ke rekening pembayaran UTM Sport Center berikut ini:
                </p>

                {selectedPayChannel ? (
                  <div className="bg-white dark:bg-sport-slate/70 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <p className="text-xs"><span className="text-gray-400">Penerima/Bank:</span> <strong className="text-gray-800 dark:text-white">{selectedPayChannel.name} ({selectedPayChannel.type.toUpperCase()})</strong></p>
                    <p className="text-xs"><span className="text-gray-400">No. Rekening:</span> <strong className="text-sm text-sport-navy dark:text-sport-green font-mono tracking-wider">{selectedPayChannel.accountNumber}</strong></p>
                    <p className="text-xs"><span className="text-gray-400">Atas Nama:</span> <strong className="text-gray-800 dark:text-white">{selectedPayChannel.accountHolder}</strong></p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-sport-slate/70 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-xs">Metode Transfer: <strong className="text-gray-800 dark:text-white">{createdBooking.paymentMethod}</strong> (Silakan transfer ke nomor e-wallet / bank utama)</p>
                  </div>
                )}

                {/* Upload Bukti Pembayaran */}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 mt-1 flex flex-col gap-3">
                  <span className="text-xs font-bold text-gray-800 dark:text-white">Kirim Bukti Pembayaran (Upload Receipt):</span>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-24 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors p-2 text-center text-xs text-gray-400">
                      <Upload className="w-5 h-5 text-gray-300 mb-1" />
                      <span>{isUploading ? 'Sedang memuat...' : 'Pilih file atau ambil foto'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProofUpload} 
                        className="hidden" 
                      />
                    </label>

                    {paymentProof && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 relative shrink-0">
                        <img src={paymentProof} alt="Receipt Proof Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setPaymentProof(null)} 
                          className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {paymentProof && (
                    <button
                      onClick={handleSubmitProof}
                      className="w-full py-2 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-4 h-4" /> Kirim Bukti ke Admin
                    </button>
                  )}
                </div>
              </div>
            )}

            {createdBooking.status !== 'pending' && (
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1.5 font-bold">
                <ShieldCheck className="w-5 h-5" /> Bukti Pembayaran Berhasil Diunggah! Menunggu Validasi Operator.
              </div>
            )}

            {/* Print and Actions footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex justify-between no-print gap-3">
              <button
                onClick={() => setBookingPhase('form')}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Pemesanan Baru
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl text-xs font-bold shadow-md hover:bg-sport-navy-light flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Invoice
                </button>
                <button
                  onClick={() => {
                    onBookingSuccess();
                    onNavigate('dashboard-user');
                  }}
                  className="px-4.5 py-2.5 bg-sport-green text-sport-dark rounded-xl text-xs font-extrabold shadow-md hover:bg-sport-green-bright cursor-pointer"
                >
                  Dashboard User
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="font-sans py-12 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container max-w-5xl">
        
        {/* Page Back */}
        <button
          onClick={() => onNavigate('lapangan')}
          className="flex items-center gap-1.5 text-xs font-bold text-sport-navy dark:text-sport-green mb-6 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Lapangan
        </button>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Form Booking Lapangan Olahraga</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sewa harian, mingguan, bulanan secara instan dengan real-time availability.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Booking Controls (Left Grid) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Court Selection & Type */}
            <div className="bg-white dark:bg-sport-slate p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800/85 flex flex-col gap-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-sport-green" /> 1. Konfigurasi Lapangan &amp; Durasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">Pilih Lapangan Olahraga:</label>
                  <select 
                    value={selectedCourt?.id || ''}
                    onChange={(e) => {
                      const court = courts.find(c => c.id === e.target.value);
                      if (court) setSelectedCourt(court);
                    }}
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  >
                    {courts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Rp {c.price.toLocaleString('id-ID')}/Jam)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">Jenis Booking:</label>
                  <select 
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  >
                    <option value="harian">Booking Harian (Eceran Jam)</option>
                    <option value="mingguan">Booking Mingguan (Langganan)</option>
                    <option value="bulanan">Booking Bulanan (Spesial)</option>
                    <option value="event">Booking Event Komunitas</option>
                    <option value="turnamen">Booking Turnamen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Pilih Tanggal Main:</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedSlots([]); // reset slots
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    max={maxDate}
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Batas booking Anda: <strong className="text-sport-navy dark:text-sport-green-bright">H-{priorityDays}</strong> ({new Date(maxDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}).
                  </span>
                  {(!user || !user.membership) && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                      Beli Premium untuk akses booking hingga H-7!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time slot grid selector */}
            <div className="bg-white dark:bg-sport-slate p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800/85 flex flex-col gap-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-sport-green" /> 2. Pilih Jam Bermain
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{bookingDate}</span>
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal -mt-1">
                Tekan tombol jam untuk memilih. Anda diperbolehkan mem-booking beberapa jam sekaligus. Jam yang berwarna merah tidak tersedia/sudah dipesan.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                {scheduleSlots.map((slot) => {
                  const isSelected = selectedSlots.includes(slot.timeSlot);
                  let btnStyle = 'border-gray-200 dark:border-gray-700 hover:border-sport-navy dark:hover:border-sport-green dark:bg-sport-dark hover:bg-gray-50';
                  if (slot.status === 'dipesan') {
                    btnStyle = 'bg-red-50 text-red-500 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-950/30 cursor-not-allowed';
                  } else if (slot.status === 'terkunci') {
                    btnStyle = 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-800 cursor-not-allowed';
                  } else if (isSelected) {
                    btnStyle = 'bg-sport-navy text-white border-sport-navy dark:bg-sport-green dark:text-sport-dark dark:border-sport-green font-bold shadow-md';
                  }

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={slot.status !== 'tersedia'}
                      onClick={() => toggleSlotSelection(slot.timeSlot, slot.status)}
                      className={`py-3 px-2 text-center rounded-xl border text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-semibold font-mono">{slot.timeSlot}</span>
                      <span className="text-[9px] opacity-75">
                        {slot.status === 'tersedia' ? 'Tersedia' : slot.status === 'dipesan' ? 'Ordered' : 'Terkunci'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="bg-white dark:bg-sport-slate p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800/85">
              <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase font-mono tracking-wider">Catatan Tambahan (Opsional):</label>
              <textarea
                placeholder="Tulis pesan atau request khusus untuk admin (misal: sewa rompi tambahan, bola cadangan, dll)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-20 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
              ></textarea>
            </div>

          </div>

          {/* Pricing Billing Summary Card (Right Grid) */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-white dark:bg-sport-slate p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/85 flex flex-col gap-5 sticky top-24">
              <h3 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-sport-green" /> Ringkasan Biaya Sewa
              </h3>

              {/* Court Details */}
              {selectedCourt && (
                <div className="flex gap-3 items-start pb-4 border-b border-gray-100 dark:border-gray-800">
                  <img src={selectedCourt.image} className="w-16 h-12 rounded-lg object-cover" alt="Court" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{selectedCourt.name}</h4>
                    <span className="text-[10px] text-gray-400 capitalize">{selectedCourt.category} • {selectedCourt.courtType}</span>
                    <span className="text-[10px] text-sport-navy dark:text-sport-green block font-mono font-bold">Rp {selectedCourt.price.toLocaleString('id-ID')}/Jam</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown lines */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Durasi Booking:</span>
                  <span className="font-bold font-mono">{hoursBooked} Jam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal Sewa:</span>
                  <span className="font-bold font-mono text-gray-800 dark:text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Membership Reduction */}
                {user && membershipDiscountPercent > 0 && (
                  <div className="flex justify-between text-sport-green">
                    <span>Loyalty Level Discount ({user.membership.toUpperCase()} - {membershipDiscountPercent}%):</span>
                    <span className="font-bold font-mono">- Rp {membershipDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {/* Voucher Reduction */}
                {appliedVoucher && (
                  <div className="flex justify-between text-red-500">
                    <span>Kupon ({appliedVoucher.code}):</span>
                    <span className="font-bold font-mono">- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Real-time Voucher coupon Input */}
              <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 block mb-0.5 uppercase font-mono tracking-wider">Masukkan Kode Kupon:</span>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-sport-dark">
                  <input 
                    type="text" 
                    placeholder="Kode Kupon (contoh: UTM10)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="px-3.5 py-2 w-full text-xs text-gray-800 dark:text-white bg-transparent focus:outline-none uppercase font-mono"
                  />
                  <button 
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-4 bg-sport-navy dark:bg-sport-navy-light text-white text-xs font-bold hover:bg-sport-navy-light transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
                {voucherError && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {voucherError}</span>}
                {voucherSuccess && <span className="text-[10px] text-sport-green font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {voucherSuccess}</span>}
              </div>

              {/* Total Billing */}
              <div className="flex justify-between items-end">
                <span className="text-xs text-gray-500">Total Pembayaran:</span>
                <span className="text-xl font-black text-sport-navy dark:text-sport-green-bright font-mono">Rp {finalAmount.toLocaleString('id-ID')}</span>
              </div>

              {/* Payment Methods Dropdown */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-xs font-bold text-gray-400 block mb-0.5 uppercase font-mono tracking-wider">Pilih Saluran Pembayaran:</span>
                <select 
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                >
                  <option value="" disabled>-- Transfer Bank --</option>
                  <option value="BCA">BCA Transfer Bank</option>
                  <option value="BRI">BRI Transfer Bank</option>
                  <option value="Bank NTB Syariah">Bank NTB Syariah</option>
                  <option value="" disabled>-- E-Wallet QRIS --</option>
                  <option value="DANA">DANA E-Wallet</option>
                  <option value="OVO">OVO E-Wallet</option>
                  <option value="GoPay">GoPay E-Wallet</option>
                </select>
              </div>

              {/* CTA Booking Button */}
              {user ? (
                <button
                  type="button"
                  onClick={handleCreateBooking}
                  className="w-full py-4.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-5 h-5" /> Proses Booking Sekarang
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full py-4 bg-sport-navy dark:bg-sport-navy-light text-white font-bold text-xs rounded-xl shadow-md hover:bg-sport-navy-light cursor-pointer"
                >
                  Login Terlebih Dahulu Untuk Booking
                </button>
              )}

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-normal">
                Dengan melanjutkan, Anda menyetujui syarat &amp; ketentuan sewa UTM Sport Center Mataram.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
