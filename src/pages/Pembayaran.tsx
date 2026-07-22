/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Upload, FileText, ArrowLeft, 
  Info, CheckCircle, Calendar, Clock, Sparkles, Loader2, Landmark
} from 'lucide-react';
import { Booking, Payment, PaymentMethod, UserProfile } from '../types';
import { API } from '../api';

interface PembayaranProps {
  user: UserProfile | null;
  bookingId: string | null;
  onNavigate: (view: string) => void;
}

export default function Pembayaran({ user, bookingId, onNavigate }: PembayaranProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [transferTime, setTransferTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [paymentNotes, setPaymentNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch booking details & bank accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Bank Accounts
        const banks = await API.getPaymentMethods();
        setBankAccounts(banks || []);

        let targetId = bookingId;
        if (!targetId) {
          // If no bookingId provided via props, look up the user's latest pending/rejected bookings
          if (user) {
            const allBookings = await API.getBookings();
            const userPendingBookings = allBookings
              .filter(b => b.userId === user.id && (b.status === 'menunggu_pembayaran' || b.status === 'pembayaran_ditolak'))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            if (userPendingBookings.length > 0) {
              targetId = userPendingBookings[0].id;
            }
          }
        }

        if (targetId) {
          const allBookings = await API.getBookings();
          const found = allBookings.find(
  b => String(b.id) === String(targetId)
);
          if (found) {
            setBooking(found);
            // Pre-fill sender name from booking user
            setSenderName(found.userName);
            // Calculate total with 3-digit nominal unique code
            const uniqueCode = getUniqueCode(found.id);
            setTransferAmount(found.finalAmount + uniqueCode);
          } else {
            setError('Booking tidak ditemukan.');
          }
        } else {
          setError('Tidak ada tagihan pembayaran aktif.');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data pembayaran.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, user]);

  // Deterministic 3-digit unique code based on booking ID hash
  const getUniqueCode = (id: string) => {
    const num = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (num % 899) + 100; // ensures a number between 100 and 999
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal adalah 5 MB.');
      setSelectedFile(null);
      return;
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setFileError('Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau PDF.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (!senderName.trim()) {
      alert('Nama pengirim wajib diisi!');
      return;
    }
    if (!senderBank.trim()) {
      alert('Bank pengirim wajib diisi!');
      return;
    }
    if (!transferAmount || transferAmount <= 0) {
      alert('Nominal transfer harus lebih dari 0!');
      return;
    }
    if (!selectedFile) {
      alert('Silakan upload file bukti pembayaran terlebih dahulu!');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;

      // 1. Upload the payment proof file
      const uploadRes = await API.uploadPaymentProof(selectedFile.name, base64Data);

      // 2. Submit payment information
      const paymentPayload: Partial<Payment> = {
        id: `pay-${Date.now()}`,
        bookingId: booking.id,
        senderName,
        senderBank,
        paymentMethod: booking.paymentMethod,
        amountTransfer: transferAmount,
        transferDate,
        transferTime,
        paymentProofUrl: uploadRes.url,
        notes: paymentNotes,
        status: 'sedang_diverifikasi',
        createdAt: new Date().toISOString()
      };

      await API.submitPayment(paymentPayload);
      setSubmitSuccess(true);
    } catch (err: any) {
      alert(`Gagal mengirim bukti pembayaran: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 dark:bg-sport-dark text-gray-800 dark:text-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-sport-green" />
        <p className="text-sm font-medium text-gray-500">Memuat rincian transaksi pembayaran...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-16 min-h-[70vh] bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 font-sans">
        <div className="responsive-container max-w-xl text-center">
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-xl font-bold text-sport-navy dark:text-white">Ada Masalah</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'Tidak ada transaksi pembayaran aktif untuk ditampilkan.'}</p>
            <button 
              onClick={() => onNavigate('home')} 
              className="mt-4 px-6 py-2 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-navy text-sm font-semibold rounded-lg shadow hover:opacity-90"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 font-sans">
        <div className="responsive-container max-w-xl text-center">
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-5">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center text-green-500 dark:text-green-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-sport-navy dark:text-white">Bukti Pembayaran Dikirim!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Bukti transfer untuk booking <span className="font-mono font-bold">#{booking.invoiceNumber}</span> berhasil dikirim. 
              Status pesanan Anda sekarang <span className="font-bold text-amber-500">SEDANG DIVERIFIKASI</span>. 
              Admin akan memeriksa transfer Anda maksimal dalam 10-15 menit.
            </p>
            <div className="w-full border-t border-gray-100 dark:border-gray-800/80 pt-4 flex gap-3">
              <button 
                onClick={() => onNavigate('dashboard-user')} 
                className="flex-1 px-5 py-2.5 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-navy text-sm font-semibold rounded-xl hover:opacity-95 transition"
              >
                Ke Booking Saya
              </button>
              <button 
                onClick={() => onNavigate('home')} 
                className="flex-1 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate booking duration
  const durationHours = booking.details.length;
  const uniqueCode = getUniqueCode(booking.id);
  const totalWithCode = booking.finalAmount + uniqueCode;

  return (
    <div className="py-8 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 font-sans">
      <div className="responsive-container max-w-4xl">
        
        {/* Back navigation */}
        <button 
          onClick={() => onNavigate('dashboard-user')} 
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-sport-navy dark:hover:text-sport-green transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Saya</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Billing Summary & Transfer Guide */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Invoice & Schedule details */}
            <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800/80 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-sport-navy dark:text-white">Rincian Tagihan Booking</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">Invoice: #{booking.invoiceNumber}</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded font-mono">
                  Menunggu Pembayaran
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Pemesan</span>
                  <span className="font-bold">{booking.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lapangan</span>
                  <span className="font-bold text-sport-navy dark:text-sport-green">
                    {booking.details[0]?.courtName || 'Lapangan Futsal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal Main</span>
                  <span className="font-bold font-mono flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-sport-green" />
                    {booking.details[0]?.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jam & Durasi</span>
                  <span className="font-bold flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-xs text-right">
                    <Clock className="w-3.5 h-3.5 text-sport-green inline" />
                    {booking.details.map(d => d.timeSlot).join(', ')} ({durationHours} Jam)
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-100 dark:border-gray-800/80 pt-4 mt-4">
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Biaya Sewa</span>
                    <span>Rp {booking.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  {booking.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 text-xs mt-1">
                      <span>Potongan Diskon</span>
                      <span>-Rp {booking.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      Kode Unik Pembayaran
                      <span className="group relative cursor-pointer text-sport-green">
                        <Info className="w-3 h-3 inline" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity w-48 text-center leading-normal z-50">
                          3 digit kode acak untuk mempermudah verifikasi transfer otomatis oleh sistem kami.
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-sport-green font-bold">+Rp {uniqueCode}</span>
                  </div>

                  <div className="flex justify-between items-center mt-3 bg-gray-50 dark:bg-sport-dark/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/60">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Total Transfer</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-sport-navy dark:text-sport-green font-mono">
                        Rp {totalWithCode.toLocaleString('id-ID')}
                      </span>
                      <p className="text-[10px] text-amber-500 font-bold mt-0.5">Transfer harus tepat s/d angka terakhir!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Guide */}
            <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800">
              <h3 className="text-md font-bold text-sport-navy dark:text-white flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-sport-green" />
                <span>Rekening Pembayaran Resmi UTM</span>
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Silakan lakukan transfer ke salah satu rekening bank resmi UTM Sport Center di bawah ini:
              </p>

              <div className="space-y-4">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((bank, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-100 dark:border-gray-800/80 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase rounded font-mono">
                            {bank.name}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">An. {bank.accountHolder}</span>
                        </div>
                        <p className="text-md font-extrabold text-gray-800 dark:text-white font-mono mt-1.5 tracking-wider">
                          {bank.accountNumber}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(bank.accountNumber);
                          alert(`Nomor rekening ${bank.name} disalin ke papan klip!`);
                        }} 
                        className="px-3 py-1 bg-white dark:bg-sport-slate hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold rounded-lg transition"
                      >
                        Salin No.Rek
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Tidak ada data bank resmi yang tersedia.</p>
                )}
              </div>

              <div className="mt-5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="font-bold">PENTING:</span> Harap transfer persis sesuai total tagihan (<span className="font-bold font-mono">Rp {totalWithCode.toLocaleString('id-ID')}</span>) termasuk kode unik agar verifikasi pembayaran dapat diproses dengan cepat. Simpan bukti transfer Anda!
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Upload Form */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 sticky top-4">
              <h3 className="text-md font-extrabold text-sport-navy dark:text-white mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sport-green" />
                <span>Form Konfirmasi Pembayaran</span>
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nama Pengirim</label>
                  <input 
                    type="text" 
                    value={senderName} 
                    onChange={e => setSenderName(e.target.value)} 
                    placeholder="Nama lengkap pengirim di struk" 
                    required 
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:border-sport-green outline-none font-medium transition text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bank Asal / Pengirim</label>
                  <input 
                    type="text" 
                    value={senderBank} 
                    onChange={e => setSenderBank(e.target.value)} 
                    placeholder="Contoh: BCA, Mandiri, BRI, DANA" 
                    required 
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:border-sport-green outline-none font-medium transition text-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nominal Transfer (Rp)</label>
                  <input 
                    type="number" 
                    value={transferAmount} 
                    onChange={e => setTransferAmount(Number(e.target.value))} 
                    placeholder="Masukkan jumlah yang di-transfer" 
                    required 
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:border-sport-green outline-none font-mono font-bold transition text-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Transfer</label>
                    <input 
                      type="date" 
                      value={transferDate} 
                      onChange={e => setTransferDate(e.target.value)} 
                      required 
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-xs focus:border-sport-green outline-none font-medium font-mono transition text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Jam Transfer</label>
                    <input 
                      type="time" 
                      value={transferTime} 
                      onChange={e => setTransferTime(e.target.value)} 
                      required 
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-xs focus:border-sport-green outline-none font-medium font-mono transition text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea 
                    value={paymentNotes} 
                    onChange={e => setPaymentNotes(e.target.value)} 
                    placeholder="Misal: Sudah transfer via m-BCA" 
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:border-sport-green outline-none font-medium transition text-gray-800 dark:text-white resize-none"
                  />
                </div>

                {/* Upload Bukti */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Upload Bukti Transfer</label>
                  
                  <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center cursor-pointer hover:border-sport-green dark:hover:border-sport-green transition flex flex-col items-center gap-1.5 bg-gray-50 dark:bg-sport-dark/20">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {selectedFile ? selectedFile.name : 'Pilih file atau seret kemari'}
                    </span>
                    <span className="text-[10px] text-gray-400">JPG, JPEG, PNG, atau PDF (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>

                  {fileError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1.5">{fileError}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !!fileError}
                  className="w-full py-3 bg-sport-navy dark:bg-sport-green disabled:opacity-55 text-white dark:text-sport-navy font-extrabold text-sm rounded-xl shadow-lg shadow-sport-navy/10 hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Konfirmasi...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Kirim Bukti Pembayaran</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
