/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Phone, Key, Gift, ArrowRight } from 'lucide-react';
import { API } from '../api';
import { UserProfile } from '../types';

interface RegisterProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigate: (view: string) => void;
}

export default function Register({ onRegisterSuccess, onNavigate }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registeredUser = await API.register(email, name, phone, password);
      onRegisterSuccess(registeredUser);
      alert(refCode.trim() 
        ? 'Registrasi berhasil! Anda mendapatkan bonus +10 Point karena menggunakan kode referral.' 
        : 'Registrasi berhasil! Selamat datang di UTM Sport Center.'
      );
      onNavigate('dashboard-user');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registrasi gagal. Email mungkin sudah terdaftar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-lg p-4">
        
        {/* Card */}
        <div className="bg-white dark:bg-sport-slate rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sport-navy to-sport-green"></div>

          {/* Title */}
          <div className="text-center">
            <span className="text-xs font-black text-sport-green tracking-widest uppercase">UTM Sport Center</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Buat Akun Baru</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Gabung sekarang untuk booking lapangan futsal premium secara instan</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center border border-red-500/20">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Nama Lengkap:</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Rahmat Mulyadi"
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">No. WhatsApp:</label>
                <div className="relative">
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="081339638842"
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Alamat Email:</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="rahmatmulyadi@gmail.com"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Password:</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Konfirmasi Password:</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Kode Referral Teman (Opsional):</label>
              <div className="relative">
                <input 
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="e.g. UTM-1234"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono uppercase"
                />
                <Gift className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1 mt-2.5 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Card */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Sudah memiliki akun? <button onClick={() => onNavigate('login')} className="text-sport-navy dark:text-sport-green font-bold hover:underline cursor-pointer">Masuk Di Sini</button>
          </p>

        </div>

      </div>
    </div>
  );
}
