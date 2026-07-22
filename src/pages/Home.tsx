/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Calendar, Users, Trophy, Star, ChevronRight, MapPin, CheckCircle, Sparkles, Flame, Clock, Quote } from 'lucide-react';
import { Court, Promo, Article, GalleryItem, Sponsor, AppSettings, Facility, Testimonial } from '../types';
import { API } from '../api';

interface HomeProps {
  onNavigate: (view: string, targetId?: string) => void;
  courts: Court[];
  promos: Promo[];
  articles: Article[];
  gallery: GalleryItem[];
  sponsors: Sponsor[];
  settings: AppSettings;
  facilities: Facility[];
  testimonials: Testimonial[];
}

// Icon Resolver for Dynamic Facilities
const renderFacilityIcon = (iconName: string) => {
  switch (iconName) {
    case 'CheckCircle': return <CheckCircle className="w-6 h-6" />;
    case 'Clock': return <Clock className="w-6 h-6" />;
    case 'Star': return <Star className="w-6 h-6" />;
    case 'Users': return <Users className="w-6 h-6" />;
    case 'Trophy': return <Trophy className="w-6 h-6" />;
    case 'MapPin': return <MapPin className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export default function Home({ 
  onNavigate, 
  courts, 
  promos, 
  articles, 
  gallery, 
  sponsors,
  settings,
  facilities,
  testimonials
}: HomeProps) {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    if (promos.length > 0) {
      const promoTimer = setInterval(() => {
        setCurrentPromoIndex(prev => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(promoTimer);
    }
  }, [promos]);

  return (
    <div className="font-sans text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-sport-dark transition-colors duration-300">
      
      {/* Running Text Marquee CMS-controlled */}
      {settings?.runningTextActive !== false && settings?.runningText && (
        <div 
          className="py-2.5 overflow-hidden border-b font-bold font-mono tracking-wide shadow-sm flex items-center justify-center select-none"
          style={{
            backgroundColor: settings.runningTextBgColor || '#10B981',
            color: settings.runningTextColor || '#0F172A',
            borderColor: 'rgba(0,0,0,0.1)'
          }}
        >
          <div 
            className="animate-marquee whitespace-nowrap flex gap-16 text-sm"
            style={{
              animationDuration: `${settings.runningTextSpeed || 25}s`
            }}
          >
            <span>{settings.runningText}</span>
            <span>{settings.runningText}</span>
            <span>{settings.runningText}</span>
            <span>{settings.runningText}</span>
          </div>
        </div>
      )}

      {/* 1. Hero Banner Full Screen with Video/Image Background CMS-driven */}
      <section id="hero-section" className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-sport-navy text-white">
        {/* Absolute Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={settings?.heroImage || "https://images.unsplash.com/photo-1540747737956-378724044602?auto=format&fit=crop&q=80&w=1920"} 
            alt="Sport Field Background" 
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sport-dark via-sport-navy/80 to-sport-navy/95"></div>
        </div>

        <div className="responsive-container relative z-10 text-center flex flex-col items-center gap-5 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sport-green/10 text-sport-green border border-sport-green/30 text-xs font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="w-4.5 h-4.5" />
            {settings?.brandName || "UTM Sport Center"} - {settings?.contactCity || "Mataram, NTB"}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {settings?.heroTitle || "Rasakan Sensasi Bermain di Lapangan Premium"}
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            {settings?.heroSubtitle || "Sistem sewa lapangan futsal terintegrasi secara real-time. Lapangan standard internasional dengan lantai Vinyl premium, interlock kokoh, dan rumput sintetis higienis."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 mt-4 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('lapangan')}
              className="px-8 py-3.5 bg-sport-green text-sport-dark font-bold rounded-xl hover:bg-sport-green-bright hover:scale-105 shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {settings?.heroCtaText || "Booking Sekarang"}
            </button>
            <button 
              onClick={() => onNavigate('jadwal')}
              className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20 backdrop-blur-md hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              Lihat Jadwal Lapangan
            </button>
          </div>
        </div>

        {/* Waves divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent dark:from-sport-dark pointer-events-none"></div>
      </section>

      {/* Wave divider spacing */}
      <div className="h-12"></div>

      {/* 4. Keunggulan Section (Dynamic Facilities) */}
      <section className="py-16 responsive-container">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
          <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Kualitas Berkelas Dunia</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mengapa Harus {settings?.brandName || "UTM Sport Center"}?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kami mengedepankan kualitas pelayanan, higienitas, dan kenyamanan fasilitas demi menjamin kepuasan olahraga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facilities && facilities.length > 0 ? (
            facilities.map((fac) => (
              <div 
                key={fac.id} 
                className="bg-white dark:bg-sport-slate rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md flex gap-4 items-start hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                <div className="p-3 bg-sport-green/10 text-sport-green rounded-xl shrink-0">
                  {renderFacilityIcon(fac.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{fac.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md flex gap-4 items-start hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-sport-green/10 text-sport-green rounded-xl shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Lantai Standard Internasional</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Menggunakan material Vinyl Premium, Interlock, dan rumput sintetis bermutu tinggi yang ramah sendi kaki dan anti-selip.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md flex gap-4 items-start hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-sport-green/10 text-sport-green rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Booking Real-Time &amp; Cepat</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Jadwal lapangan sinkron secara otomatis. Pilih tanggal dan jam sesuka hati, bayar secara instan tanpa ribet antre.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md flex gap-4 items-start hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-sport-green/10 text-sport-green rounded-xl shrink-0">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Fasilitas Penunjang Lengkap</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Dilengkapi dengan kantin, ruang ganti baju bersih, locker penyimpanan aman, musholla, toilet higienis, serta parkiran luas.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. Lapangan List Highlight */}
      <section className="py-16 bg-white dark:bg-sport-slate border-y border-gray-100 dark:border-gray-800">
        <div className="responsive-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Daftar Lapangan</span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">Pilih Lapangan Olahraga Anda</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dapatkan harga promo terbaik untuk booking lapangan Futsal sekarang.</p>
            </div>
            <button 
              onClick={() => onNavigate('lapangan')}
              className="px-5 py-2.5 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl text-sm font-bold shadow-md hover:bg-sport-navy-light flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
            >
              Lihat Semua Lapangan
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courts.slice(0, 3).map((court) => (
              <div 
                key={court.id}
                className="bg-gray-50 dark:bg-sport-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative h-52 shrink-0">
                  <img 
                    src={court.image} 
                    alt={court.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-sport-navy text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {court.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-sport-slate/95 text-gray-800 dark:text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {court.rating} ({court.reviewsCount})
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-snug hover:text-sport-green transition-colors">
                      {court.name}
                    </h4>
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 uppercase">Tipe: {court.courtType} | Ukuran: {court.size}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {court.description}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-800 mt-5 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block">Mulai Dari</span>
                      <span className="text-lg font-extrabold text-sport-navy dark:text-sport-green-bright font-mono">
                        Rp {court.price.toLocaleString('id-ID')}/Jam
                      </span>
                    </div>
                    <button 
                      onClick={() => onNavigate('lapangan')}
                      className="px-4.5 py-2 bg-sport-green hover:bg-sport-green-bright text-sport-dark text-xs font-extrabold rounded-lg hover:scale-105 transition-all shadow-md cursor-pointer"
                    >
                      Sewa Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Galeri Grid Highlight */}
      <section className="py-16 responsive-container">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
          <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Media Galeri</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dokumentasi UTM Sport</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Potret keseruan latihan, turnamen, dan kemegahan fasilitas kami.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.slice(0, 4).map((g) => (
            <div 
              key={g.id}
              className="relative rounded-xl overflow-hidden group h-44 shadow-md cursor-pointer border border-gray-100 dark:border-gray-800"
              onClick={() => onNavigate('galeri')}
            >
              <img 
                src={g.imageUrl} 
                alt={g.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div>
                  <span className="text-[9px] bg-sport-green text-sport-dark px-2 py-0.5 rounded-full uppercase font-bold">{g.category}</span>
                  <h5 className="text-xs font-bold text-white mt-1.5 truncate">{g.title}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Artikel Terbaru */}
      <section className="py-16 bg-white dark:bg-sport-slate border-y border-gray-100 dark:border-gray-800">
        <div className="responsive-container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Kabar &amp; Edukasi</span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">Artikel &amp; Tips Olahraga</h2>
            </div>
            <button 
              onClick={() => onNavigate('artikel')}
              className="text-xs font-bold text-sport-navy dark:text-sport-green hover:underline flex items-center gap-1 cursor-pointer"
            >
              Baca Semua Artikel
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.slice(0, 2).map((art) => (
              <div 
                key={art.id}
                className="bg-gray-50 dark:bg-sport-dark rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-800 shadow-sm flex flex-col md:flex-row h-full hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-full md:w-2/5 h-48 md:h-auto relative shrink-0">
                  <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block mb-1">OLEH {art.author.toUpperCase()} | {art.date}</span>
                    <h4 
                      className="font-bold text-base text-gray-900 dark:text-white leading-snug hover:text-sport-green transition-colors cursor-pointer"
                      onClick={() => onNavigate('artikel')}
                    >
                      {art.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('artikel')}
                    className="text-xs font-bold text-sport-green hover:text-sport-green-bright self-start mt-4 flex items-center gap-1 cursor-pointer"
                  >
                    Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7.5. Testimonials Section (Dynamic CMS driven) */}
      <section className="py-16 bg-gray-50 dark:bg-sport-dark transition-colors duration-300">
        <div className="responsive-container">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
            <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Testimoni Pelanggan</span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Apa Kata Mereka?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ulasan jujur dari tim futsal, komunitas, dan atlit yang telah rutin menggunakan lapangan kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((test) => (
                <div 
                  key={test.id} 
                  className="bg-white dark:bg-sport-slate rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md relative flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-sport-green/10" />
                  
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: test.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed mb-6">
                      "{test.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                    {test.avatar ? (
                      <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sport-navy text-white flex items-center justify-center font-bold text-sm uppercase">
                        {test.name ? test.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white">{test.name}</h5>
                      <span className="text-xs text-gray-400 font-mono block">{test.role}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-400 col-span-3">Belum ada testimoni.</p>
            )}
          </div>
        </div>
      </section>

      {/* 8. Sponsors / Partners */}
      <section className="py-12 responsive-container">
        <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-6">Partner &amp; Sponsor Resmi</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {sponsors.map((sp) => (
            <div key={sp.id} className="h-10 md:h-12 flex items-center grayscale hover:grayscale-0 opacity-55 hover:opacity-100 transition-all duration-300">
              <img src={sp.imageUrl} alt={sp.name} className="h-full object-contain" />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
