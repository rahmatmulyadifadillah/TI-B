/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  cat: 'booking' | 'payment' | 'facility';
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'booking' | 'payment' | 'facility'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: 'Bagaimana cara melakukan booking lapangan secara online?',
      a: 'Sangat mudah! Buat akun terlebih dahulu, pilih menu "Daftar Lapangan", tinjau lapangan yang Anda inginkan, klik "Sewa", pilih tanggal dan slot jam bermain yang tersedia, lalu selesaikan pembayaran melalui transfer bank atau e-wallet yang tersedia.',
      cat: 'booking'
    },
    {
      q: 'Apakah saya bisa membatalkan jadwal booking yang sudah dibayar?',
      a: 'Bisa. Pembatalan dapat dilakukan melalui Dashboard User maksimal H-1 jadwal bermain. Sistem kami akan secara otomatis mengembalikan dana sebesar 80% dalam bentuk Point Reward yang bisa digunakan kembali untuk sewa lapangan berikutnya.',
      cat: 'booking'
    },
    {
      q: 'Bagaimana sistem Point Reward bekerja?',
      a: 'Setiap melakukan sewa lapangan olahraga senilai kelipatan Rp 1.000, Anda akan meraih 1 Point Reward. Poin ini terkumpul di saldo akun Anda dan dapat langsung digunakan untuk memotong total tagihan booking lapangan di masa mendatang.',
      cat: 'payment'
    },
    {
      q: 'Bagaimana cara mendaftar program Membership?',
      a: 'Masuk ke menu Dashboard User Anda, lalu buka tab "Paket Membership". Tersedia opsi Bronze, Silver, dan Gold. Setelah berlangganan, seluruh booking lapangan Anda berikutnya akan otomatis terpotong diskon langsung (Bronze 5%, Silver 10%, Gold 15%).',
      cat: 'payment'
    },
    {
      q: 'Fasilitas umum apa saja yang tersedia secara gratis?',
      a: 'UTM Sport Center menyediakan lahan parkir kendaraan luas yang dijaga sekuriti, musholla, toilet & shower bersih, ruang ganti baju, locker penyimpanan barang berharga, kantin sehat, wifi gratis, dan tribun untuk penonton.',
      cat: 'facility'
    },
    {
      q: 'Apakah lapangan dibuka untuk bermain pada malam hari?',
      a: 'Ya, UTM Sport Center beroperasi mulai jam 07:00 pagi hingga jam 24:00 malam WITA. Lapangan kami dilengkapi dengan lampu sorot LED berdaya tinggi (night spotlights) berstandar turnamen, sehingga bermain di malam hari tetap terang benderang.',
      cat: 'facility'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchCat = activeCategory === 'all' || faq.cat === activeCategory;
    const matchSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container max-w-4xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
          <span className="text-xs font-black text-sport-green tracking-widest uppercase">Pusat Bantuan UTM</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Frequently Asked Questions (FAQ)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Temukan jawaban cepat atas pertanyaan Anda seputar teknis booking, sewa, pembayaran, dan aturan bermain.</p>
        </div>

        {/* Search and Category Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Cari pertanyaan Anda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Category badges */}
          <div className="flex gap-2.5 flex-wrap">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'booking', label: 'Sewa & Booking' },
              { id: 'payment', label: 'Pembayaran & Poin' },
              { id: 'facility', label: 'Fasilitas & Jam' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setExpandedIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-sport-navy dark:bg-sport-navy-light text-white'
                    : 'bg-white dark:bg-sport-slate text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Lists */}
        {filteredFaqs.length === 0 ? (
          <p className="text-xs text-gray-400 py-12 text-center">Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian Anda.</p>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-sport-slate rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4.5 flex justify-between items-center font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4.5 h-4.5 text-sport-green shrink-0" /> {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
