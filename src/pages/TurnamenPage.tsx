/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Award, ShieldCheck, Star, Sparkles } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  category: 'futsal';
  date: string;
  prize: string;
  limit: number;
  joined: number;
  status: 'buka' | 'penuh' | 'selesai';
  desc: string;
}

export default function TurnamenPage() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Form input
  const [teamName, setTeamName] = useState('');
  const [captain, setCaptain] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const tournaments: Tournament[] = [
    {
      id: 'tour-1',
      title: 'UTM Champions League Futsal 2026',
      category: 'futsal',
      date: '25-28 Juli 2026',
      prize: 'Rp 10.000.000',
      limit: 16,
      joined: 12,
      status: 'buka',
      desc: 'Turnamen futsal bergengsi se-Kota Mataram untuk memperebutkan Piala Utama UTM Sport Center Season 1. Terbuka untuk umum kelas amatir.'
    },
    {
      id: 'tour-3',
      title: 'Kemerdekaan Futsal Youth Cup',
      category: 'futsal',
      date: '17-19 Agustus 2026',
      prize: 'Rp 5.000.000',
      limit: 24,
      joined: 5,
      status: 'buka',
      desc: 'Turnamen futsal memperingati HUT RI ke-81 khusus kategori remaja U-19. Asah bakat mudamu di sini!'
    }
  ];

  const filteredTournaments = tournaments;

  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captain || !phone) return;

    setIsRegistered(true);
    setTimeout(() => {
      alert(`Tim ${teamName} berhasil didaftarkan untuk turnamen ${selectedTournament?.title}! Admin kami akan menghubungi Kapten ${captain} via WA untuk verifikasi berkas.`);
      setIsRegistered(false);
      setSelectedTournament(null);
      setTeamName('');
      setCaptain('');
      setPhone('');
    }, 1500);
  };

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
          <span className="text-xs font-black text-sport-green tracking-widest uppercase">Kompetisi Arena UTM</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Turnamen &amp; Event Olahraga</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftarkan tim terbaik Anda, asah bakat, menangkan hadiah jutaan rupiah, dan rasakan atmosfer pertandingan profesional.</p>
        </div>



        {/* Grid tournaments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map(tour => (
            <div 
              key={tour.id}
              className="bg-white dark:bg-sport-slate rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    tour.status === 'buka'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {tour.status === 'buka' ? 'Pendaftaran Buka' : 'Pendaftaran Penuh'}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">{tour.category}</span>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight mb-2">{tour.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{tour.desc}</p>

                <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-sport-dark/65 rounded-xl border border-gray-200/50 dark:border-gray-800/80 text-xs">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Tanggal Event:</span>
                    <strong className="text-gray-700 dark:text-white">{tour.date}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Total Hadiah:</span>
                    <strong className="text-sport-green">{tour.prize}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Kapasitas Slot:</span>
                    <strong className="text-gray-700 dark:text-white font-mono">{tour.joined} / {tour.limit} Tim</strong>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  disabled={tour.status !== 'buka'}
                  onClick={() => setSelectedTournament(tour)}
                  className="w-full py-2.5 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl text-xs font-bold hover:bg-sport-navy-light transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {tour.status === 'buka' ? 'Daftar Sekarang' : 'Kuota Penuh'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Register Team Modal Overlay */}
        {selectedTournament && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleRegisterTeam} className="bg-white dark:bg-sport-slate rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] bg-sport-green text-sport-dark px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">REGISTRASI CLUB</span>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mt-1">Form Registrasi Turnamen</h4>
                </div>
                <button type="button" onClick={() => setSelectedTournament(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">✕</button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 leading-normal">
                Pendaftaran untuk turnamen: <strong>{selectedTournament.title}</strong>. Biaya registrasi akan dihubungi oleh bendahara resmi UTM Sport Center.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono">Nama Club/Tim Anda:</label>
                <input 
                  type="text" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Mataram United FC"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono">Nama Kapten Tim:</label>
                <input 
                  type="text" 
                  value={captain}
                  onChange={(e) => setCaptain(e.target.value)}
                  required
                  placeholder="e.g. Rahmat Mulyadi"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono">No. WhatsApp Kapten:</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="081339638842"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setSelectedTournament(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                <button 
                  type="submit"
                  disabled={isRegistered}
                  className="px-5 py-2 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                >
                  {isRegistered ? 'Mendaftarkan...' : 'Kirim Berkas'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
