/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, Eye, Video, CheckCircle, HelpCircle, Heart, Share2, Sparkles, MessageSquare, Plus } from 'lucide-react';
import { Court, Review, UserProfile } from '../types';
import { API } from '../api';

interface LapanganProps {
  courts: Court[];
  user: UserProfile | null;
  onBookingTrigger: (court: Court) => void;
  onNavigate: (view: string) => void;
}

export default function Lapangan({ courts, user, onBookingTrigger, onNavigate }: LapanganProps) {
  const [activeCourt, setActiveCourt] = useState<Court | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Review inputs
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewPosted, setReviewPosted] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('utm_fav_courts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (activeCourt) {
      API.getReviews(activeCourt.id)
        .then(setReviews)
        .catch(console.error);
    }
  }, [activeCourt]);

  const toggleFavorite = (courtId: string) => {
    const updated = favorites.includes(courtId)
      ? favorites.filter(id => id !== courtId)
      : [...favorites, courtId];
    setFavorites(updated);
    localStorage.setItem('utm_fav_courts', JSON.stringify(updated));
  };

  const filteredCourts = courts;

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberikan ulasan');
      onNavigate('login');
      return;
    }
    if (!newReviewText.trim()) return;

    const reviewObj: Review = {
      id: `rev-${Date.now()}`,
      courtId: activeCourt!.id,
      userId: user.id,
      userName: user.name,
      userPhoto: user.photoUrl,
      rating: newRating,
      reviewText: newReviewText,
      createdAt: new Date().toISOString()
    };

    try {
      const saved = await API.createReview(reviewObj);
      setReviews(prev => [saved, ...prev]);
      setNewReviewText('');
      setReviewPosted(true);
      setTimeout(() => setReviewPosted(false), 3000);
      
      // Update local court statistics in-state
      activeCourt!.reviewsCount += 1;
      // recalculate rating
      const sum = [saved, ...reviews].reduce((acc, r) => acc + r.rating, 0);
      activeCourt!.rating = parseFloat((sum / ([saved, ...reviews].length)).toFixed(1));

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="font-sans py-12 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
          <span className="text-xs font-bold text-sport-green tracking-widest uppercase">Arena Olahraga UTM</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Katalog Lapangan Olahraga</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pilihlah lapangan dengan fasilitas terbaik. Tekan tombol detail untuk meninjau rating, review, dan info spesifikasi lapangan.
          </p>
        </div>



        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourts.map((court) => {
            const isFav = favorites.includes(court.id);
            return (
              <div 
                key={court.id}
                className="bg-white dark:bg-sport-slate rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
              >
                {/* Image & Badges */}
                <div className="relative h-56 shrink-0 overflow-hidden">
                  <img 
                    src={court.image} 
                    alt={court.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-sport-navy text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {court.category.toUpperCase()}
                  </div>
                  
                  {/* Favorite toggle */}
                  <button
                    onClick={() => toggleFavorite(court.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-sport-slate/90 hover:bg-white dark:hover:bg-sport-slate text-red-500 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {court.rating} ({court.reviewsCount} Ulasan)
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-snug group-hover:text-sport-green transition-colors">
                      {court.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 uppercase">Tipe: {court.courtType} | Dimensi: {court.size}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                      {court.description}
                    </p>
                    
                    {/* Facility Tags (Top 4) */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {court.facilities.slice(0, 4).map((f, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 dark:bg-sport-dark text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                          ✓ {f}
                        </span>
                      ))}
                      {court.facilities.length > 4 && (
                        <span className="text-[10px] bg-sport-navy/5 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green px-2 py-0.5 rounded-full font-bold">
                          +{court.facilities.length - 4} Lebih
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-5 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block">Tarif Sewa</span>
                      <span className="text-lg font-extrabold text-sport-navy dark:text-sport-green-bright font-mono">
                        Rp {court.price.toLocaleString('id-ID')}/Jam
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveCourt(court)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Tinjau Detail"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => onBookingTrigger(court)}
                        className="px-4 py-2 bg-sport-green hover:bg-sport-green-bright text-sport-dark text-xs font-extrabold rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Sewa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 360 & Review Details Modal overlay */}
        {activeCourt && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-250">
            <div className="bg-white dark:bg-sport-slate rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-sport-dark/55">
                <div>
                  <span className="text-[10px] bg-sport-navy text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{activeCourt.category}</span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white mt-1">{activeCourt.name}</h3>
                </div>
                <button 
                  onClick={() => {
                    setActiveCourt(null);
                    setReviews([]);
                  }}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Grid content */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                {/* Left pane: Image only */}
                <div className="flex flex-col gap-4">
                  {/* Photo representation */}
                  <div className="h-64 md:h-80 rounded-xl overflow-hidden relative shadow-lg">
                    <img src={activeCourt.image} alt={activeCourt.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold font-mono uppercase bg-sport-navy/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                        Dimensi Lapangan: {activeCourt.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right pane: Description, Facilities checklist, Reviews */}
                <div className="flex flex-col gap-5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Deskripsi Lapangan</h4>
                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{activeCourt.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Fasilitas Penunjang Tersedia</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activeCourt.facilities.map((fac, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-xs text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-sport-green shrink-0" />
                          <span>{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3.5">
                      <MessageSquare className="w-4.5 h-4.5 text-sport-green" /> Ulasan Pengguna ({reviews.length})
                    </h4>

                    {/* Write Review Form */}
                    {user ? (
                      <form onSubmit={handlePostReview} className="mb-5 p-3.5 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-200/60 dark:border-gray-800/80 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Beri Ulasan &amp; Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="p-0.5 focus:outline-none cursor-pointer"
                              >
                                <Star className={`w-4.5 h-4.5 ${star <= newRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-700'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          placeholder="Ceritakan pengalaman Anda bermain di lapangan ini..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          required
                          className="w-full h-16 bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                        ></textarea>

                        <button 
                          type="submit"
                          className="px-4 py-2 bg-sport-navy dark:bg-sport-navy-light text-white font-bold text-xs rounded-lg self-end hover:bg-sport-navy-light cursor-pointer shadow-md flex items-center gap-1 hover:scale-105 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Kirim Review
                        </button>

                        {reviewPosted && <span className="text-[10px] text-sport-green font-bold text-center">Terima kasih! Ulasan Anda telah diposkan.</span>}
                      </form>
                    ) : (
                      <div className="p-3 bg-sport-navy/5 text-center text-xs text-gray-500 dark:text-gray-400 rounded-xl mb-4">
                        Silakan <button onClick={() => { setActiveCourt(null); onNavigate('login'); }} className="text-sport-navy dark:text-sport-green font-bold hover:underline cursor-pointer">login</button> terlebih dahulu untuk membagikan ulasan Anda.
                      </div>
                    )}

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Belum ada ulasan untuk lapangan ini.</p>
                      ) : (
                        reviews.map((r) => (
                          <div key={r.id} className="p-3 bg-gray-50 dark:bg-sport-dark/40 rounded-xl border border-gray-100 dark:border-gray-800 flex gap-2.5 items-start">
                            <img src={r.userPhoto} alt={r.userName} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-800 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-bold text-gray-800 dark:text-white truncate">{r.userName}</h5>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 font-mono">{r.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal mt-1">{r.reviewText}</p>
                              <span className="text-[9px] text-gray-400 font-mono block mt-1.5">{new Date(r.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer pricing & final CTA */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-sport-dark/55 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block">Tarif Sewa</span>
                  <span className="text-lg font-extrabold text-sport-navy dark:text-sport-green font-mono">
                    Rp {activeCourt.price.toLocaleString('id-ID')} <span className="text-xs text-gray-400 font-normal">/ Jam</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    const court = activeCourt;
                    setActiveCourt(null);
                    onBookingTrigger(court);
                  }}
                  className="px-6 py-3 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-bold text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4.5 h-4.5" /> Booking Sekarang
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
