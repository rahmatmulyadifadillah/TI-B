/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, Award, Users, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function TentangKami() {
  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-black text-sport-green tracking-widest uppercase font-mono">UTM Sport Center Mataram</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Menyediakan Lapangan Olahraga Berstandar Internasional</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-2">
            Kami hadir di tengah Kota Mataram, Nusa Tenggara Barat untuk mendukung gaya hidup sehat dan prestasi olahraga masyarakat melalui sarana fasilitas lapangan premium yang nyaman, modern, dan terjangkau.
          </p>
        </div>

        {/* Vision & Mission Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-sport-slate p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800/85 flex flex-col gap-4">
            <div className="p-3 bg-sport-navy/10 text-sport-navy dark:text-sport-green rounded-2xl w-fit"><Target className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Visi Kami</h3>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Menjadi pusat pembinaan, penyewaan, dan ekosistem olahraga online paling tepercaya dan terlengkap di wilayah Nusa Tenggara Barat, yang menjembatani teknologi modern dengan kemudahan akses kesehatan fisik bagi seluruh kalangan masyarakat.
            </p>
          </div>

          <div className="bg-white dark:bg-sport-slate p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800/85 flex flex-col gap-4">
            <div className="p-3 bg-sport-green/10 text-sport-green rounded-2xl w-fit"><Award className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Misi Kami</h3>
            <ul className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 space-y-2.5">
              <li>• Menyediakan lapangan futsal dengan standar material lantai vinyl dan interlock premium dunia.</li>
              <li>• Menyajikan kemudahan manajemen pemesanan secara digital dan transparan demi kenyamanan pengguna.</li>
              <li>• Mendukung turnamen-turnamen komunitas lokal Mataram dalam mengasah bakat atlet muda NTB.</li>
            </ul>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mengapa Memilih Kami?</h3>
          <p className="text-xs text-gray-400 mt-1">Kami berkomitmen memberikan pelayanan prima bagi setiap pemain.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Standar Internasional',
              desc: 'Material lantai khusus vinyl dan jaring pengaman kuat memastikan performa maksimal pemain.',
              icon: <ShieldCheck className="w-5 h-5 text-sport-green" />
            },
            {
              title: 'Kemudahan Booking',
              desc: 'Pemesanan real-time, kupon voucher promo, loyalty point, dan invoice pembayaran otomatis.',
              icon: <Heart className="w-5 h-5 text-sport-green" />
            },
            {
              title: 'Fasilitas Terlengkap',
              desc: 'Musholla bersih, locker room, kantin sehat, shower air hangat, dan tribun penonton luas.',
              icon: <Users className="w-5 h-5 text-sport-green" />
            },
            {
              title: 'Lokasi Strategis',
              desc: 'Terletak di jantung Kota Mataram, Nusa Tenggara Barat dengan akses parkir luas dan aman.',
              icon: <MapPin className="w-5 h-5 text-sport-green" />
            }
          ].map((val, i) => (
            <div key={i} className="bg-white dark:bg-sport-slate p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3.5">{val.icon}</div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{val.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
