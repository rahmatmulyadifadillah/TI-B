/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import { AppSettings } from '../types';

interface FooterProps {
  onNavigate: (view: string) => void;
  settings: AppSettings;
}

export default function Footer({ onNavigate, settings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleLinkClick = (view: string) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandTitle = settings?.brandName || "UTM Sport Center";
  const brandSub = `${settings?.contactCity || "Mataram"} - ${settings?.contactProvince || "NTB"}`;
  const brandAbout = settings?.footerText || "Sistem sewa lapangan futsal terintegrasi secara real-time. Lapangan standard internasional dengan lantai Vinyl premium, interlock kokoh, dan rumput sintetis higienis.";
  const brandCopyright = settings?.footerCopyright || `&copy; ${new Date().getFullYear()} ${brandTitle}. All Rights Reserved.`;

  return (
    <footer className="bg-sport-dark text-gray-300 border-t border-gray-800 pt-16 pb-8 font-sans">
      <div className="responsive-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* About Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-3xl">🏆</span>
            )}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{brandTitle}</h2>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">{brandSub}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">
            {brandAbout}
          </p>
          <div className="flex items-center gap-3 mt-4">
            {settings?.instagramContact && (
              <a 
                href={`https://instagram.com/${settings.instagramContact.replace('@', '')}`} 
                target="_blank" 
                referrerPolicy="no-referrer" 
                className="p-2 bg-gray-800 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white rounded-full transition-all duration-300"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings?.facebookContact && (
              <a 
                href={settings.facebookContact.startsWith('http') ? settings.facebookContact : `https://facebook.com/${settings.facebookContact}`} 
                target="_blank" 
                referrerPolicy="no-referrer" 
                className="p-2 bg-gray-800 hover:bg-blue-600 hover:text-white rounded-full transition-all duration-300"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings?.youtubeContact && (
              <a 
                href={settings.youtubeContact.startsWith('http') ? settings.youtubeContact : `https://youtube.com/${settings.youtubeContact}`} 
                target="_blank" 
                referrerPolicy="no-referrer" 
                className="p-2 bg-gray-800 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-sport-green">Sitemap</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
            <button onClick={() => handleLinkClick('home')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Home</button>
            <button onClick={() => handleLinkClick('lapangan')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Lapangan</button>
            <button onClick={() => handleLinkClick('jadwal')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Jadwal</button>
            <button onClick={() => handleLinkClick('membership')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Membership</button>
            <button onClick={() => handleLinkClick('promo')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Promo</button>
            <button onClick={() => handleLinkClick('turnamen')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Turnamen</button>
            <button onClick={() => handleLinkClick('galeri')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Galeri</button>
            <button onClick={() => handleLinkClick('artikel')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Artikel</button>
            <button onClick={() => handleLinkClick('faq')} className="text-left hover:text-sport-green transition-colors cursor-pointer">FAQ</button>
            <button onClick={() => handleLinkClick('kontak')} className="text-left hover:text-sport-green transition-colors cursor-pointer">Kontak Kami</button>
          </div>
        </div>

        {/* Contact Info & Hours */}
        <div className="flex flex-col gap-4 text-sm">
          <h3 className="text-lg font-bold text-white relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-sport-green">Hubungi Kami</h3>
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex gap-2.5 items-start">
              <MapPin className="w-5 h-5 text-sport-green shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed text-gray-400">{settings?.address || "Jl. Pemuda No. 45, Kota Mataram"}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Phone className="w-5 h-5 text-sport-green shrink-0" />
              <span className="text-xs font-mono">{settings?.whatsappContact || "08123456789"}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Mail className="w-5 h-5 text-sport-green shrink-0" />
              <span className="text-xs truncate">{settings?.emailContact || "info@utmsportcenter.com"}</span>
            </div>
          </div>
          <div className="mt-2 p-3 bg-gray-900/60 rounded-lg border border-gray-800/80">
            <p className="text-xs font-bold text-white">Jam Operasional:</p>
            <p className="text-[11px] text-gray-400 mt-1">Senin - Minggu: 07:00 - 23:00 WITA</p>
          </div>
        </div>

        {/* Google Maps Embed & Newsletter */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-sport-green">Lokasi Kami</h3>
          <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-800 shadow-md">
           <iframe
    title="Lokasi Kota Mataram"
    src={settings.locationMapsUrl}
    width="100%"
    height="100%"
    style={{ border: 0 }}
    loading="lazy"
    allowFullScreen
            ></iframe>
          </div>
          {/* Newsletter Form */}
          <form onSubmit={handleSubscribe} className="mt-2 flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Berlangganan Newsletter:</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-700 bg-gray-900 focus-within:border-sport-green transition-colors">
              <input 
                type="email" 
                required
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-1.5 w-full text-xs text-white bg-transparent focus:outline-none"
              />
              <button 
                type="submit" 
                className="px-3 bg-sport-green text-sport-dark hover:bg-sport-green-bright hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && <span className="text-[10px] text-sport-green font-semibold">Sukses berlangganan! Terima kasih.</span>}
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800/60 mt-12 pt-6 pb-2 text-center text-xs text-gray-500 font-mono">
        <p dangerouslySetInnerHTML={{ __html: brandCopyright }}></p>
        <p className="mt-1 text-[10px] text-gray-600">Created by Senior Web Developer &amp; UI Architect</p>
      </div>
    </footer>
  );
}
