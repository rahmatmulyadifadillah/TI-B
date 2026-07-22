/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Key, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import { API } from '../api';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (view: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const user = await API.login(email, password);
      onLoginSuccess(user);
      
      if (user.role === 'admin') {
        onNavigate('dashboard-admin');
      } else {
        onNavigate('dashboard-user');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md p-4">
        
        {/* Card */}
        <div className="bg-white dark:bg-sport-slate rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sport-navy to-sport-green"></div>

          {/* Title */}
          <div className="text-center">
            <span className="text-xs font-black text-sport-green tracking-widest uppercase">UTM Sport Center</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Sesi Masuk</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Gunakan akun Anda untuk melakukan booking lapangan olahraga</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center border border-red-500/20">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Alamat Email:</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 block font-mono uppercase tracking-wider">Password:</label>
                <button 
                  type="button" 
                  onClick={() => alert('Fitur reset password disimulasikan. Silakan hubungi admin di WA: 081339638842')}
                  className="text-[10px] text-sport-navy dark:text-sport-green font-bold hover:underline cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sport-navy dark:bg-sport-navy-light text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-sport-navy-light transition-all cursor-pointer flex items-center justify-center gap-1 mt-2.5 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk Akun'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Card */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Belum memiliki akun? <button onClick={() => onNavigate('register')} className="text-sport-navy dark:text-sport-green font-bold hover:underline cursor-pointer">Registrasi Sekarang</button>
          </p>

          {/* Quick Demo Credentials Help */}
          <div className="bg-sport-navy/5 p-4 rounded-xl border border-sport-navy/10 dark:border-sport-navy-light/10 text-xs text-gray-500 dark:text-gray-400 mt-4">
            <span className="font-bold text-sport-navy dark:text-sport-green-bright block mb-2 text-[11px] uppercase tracking-wider">💡 Info Login Pengguna & Admin:</span>
            <div className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Akses Admin (Full Control):</span>
                <p className="flex justify-between font-mono text-[11px] bg-white dark:bg-sport-dark p-1.5 rounded border border-gray-200/50 dark:border-gray-800">
                  <span>Email: <strong className="text-gray-800 dark:text-white select-all">admin@utm.com</strong></span>
                  <span>Pass: <strong className="text-gray-800 dark:text-white">admin123</strong></span>
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Akses Pelanggan:</span>
                <p className="flex justify-between font-mono text-[11px] bg-white dark:bg-sport-dark p-1.5 rounded border border-gray-200/50 dark:border-gray-800">
                  <span>Email: <strong className="text-gray-800 dark:text-white select-all">user@utm.com</strong></span>
                  <span>Pass: <strong className="text-gray-800 dark:text-white">user123</strong></span>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
