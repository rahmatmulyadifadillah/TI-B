/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageSquare } from 'lucide-react';

export default function KontakPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Sewa Lapangan');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setTimeout(() => {
      // Simulate WhatsApp redirection or success prompt
      const textPreset = `Halo Admin UTM Sport Center, Saya *${name}* (${email}). Ingin menanyakan tentang: *${subject}*. Pesan: ${message}`;
      const waUrl = `https://wa.me/6281339638842?text=${encodeURIComponent(textPreset)}`;
      
      alert('Saran / Pertanyaan Anda berhasil dikirim! Kami juga akan mengarahkan Anda langsung ke WhatsApp Operator kami.');
      window.open(waUrl, '_blank');
      
      setSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
          <span className="text-xs font-black text-sport-green tracking-widest uppercase">Hubungi Kami</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Kontak &amp; Hubungi Operator</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kami siap melayani kebutuhan sewa lapangan, kemitraan sponsorship, dan keluhan layanan Anda secara sigap.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left panel: Info & Maps */}
          <div className="flex flex-col gap-8">
            <div className="bg-white dark:bg-sport-slate rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-md space-y-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sport-green" /> Informasi Kontak Utama
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-gray-100 dark:bg-sport-dark rounded-xl text-sport-navy dark:text-sport-green shrink-0"><Phone className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">WhatsApp Hotline</span>
                    <p className="text-sm font-bold text-gray-800 dark:text-white font-mono mt-0.5">081339638842</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-gray-100 dark:bg-sport-dark rounded-xl text-sport-navy dark:text-sport-green shrink-0"><Mail className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Email Support</span>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">rahmatmulyadifadillah@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-gray-100 dark:bg-sport-dark rounded-xl text-sport-navy dark:text-sport-green shrink-0"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Alamat Kompleks Arena</span>
                    <p className="text-xs text-gray-500 dark:text-gray-300 leading-normal mt-0.5">Kota Mataram, Nusa Tenggara Barat, Indonesia.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map Embed representation */}
            <div className="bg-white dark:bg-sport-slate rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-md h-72">
              <iframe
                title="Peta UTM Arena Mataram"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126250.32014022415!2d116.03842324905188!3d-8.579624538805217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcbc20fd18b877d%3A0xc66fbfa9e67f08c3!2sMataram%2C%20Mataram%20City%2C%20West%20Nusa%20Tenggara!5e0!3m2!1sen!2sid!4v1710574828192!5m2!1sen!2sid"
                width="100%"
                height="100%"
                className="border-0 rounded-2xl bg-gray-100"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Right panel: Inquiry Form */}
          <form onSubmit={handleSubmitInquiry} className="bg-white dark:bg-sport-slate rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-md flex flex-col gap-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sport-green" /> Formulir Saran &amp; Tanya Jawab
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono">Nama Lengkap:</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Rahmat Mulyadi"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono">Alamat Email:</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="rahmatmulyadi@gmail.com"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block font-mono">Subjek Pertanyaan:</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
              >
                <option value="Sewa Lapangan">Tanya Mengenai Sewa Lapangan</option>
                <option value="Kerjasama Event">Kemitraan Turnamen &amp; Event</option>
                <option value="Sponsorship">Sponsor &amp; Media Partner</option>
                <option value="Keluhan Teknis">Masalah Teknis Website / Bayar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block font-mono">Pesan / Saran Anda:</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Tulis kritik, saran, pertanyaan, atau rincian penawaran kerjasama Anda di sini..."
                className="w-full h-32 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Mengirim...' : 'Kirim Lewat WhatsApp'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
