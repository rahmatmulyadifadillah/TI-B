/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, PhoneCall } from 'lucide-react';
import { UserProfile, ChatMessage, AppSettings } from '../types';
import { API } from '../api';

interface FloatingWidgetsProps {
  user: UserProfile | null;
  settings: AppSettings;
}

export default function FloatingWidgets({ user, settings }: FloatingWidgetsProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync / fetch chats
  useEffect(() => {
    if (isChatOpen) {
      API.getChats()
        .then(chats => {
          // If no chats exist for this session, add a welcome message from the system
          const filtered = chats.filter(
            c => (c.senderId === user?.id && c.receiverId === 'admin') ||
                 (c.senderId === 'admin' && c.receiverId === user?.id)
          );

          if (filtered.length === 0) {
            const welcome: ChatMessage = {
              id: 'welcome-chat',
              senderId: 'admin',
              senderName: 'UTM Sport Assistant',
              receiverId: user?.id || 'guest',
              message: `Selamat datang ${user ? user.name : 'Sahabat Olahraga'}! Ada kendala apa yang sedang Anda hadapi atau bisa kami bantu hari ini? 😊`,
              createdAt: new Date().toISOString(),
              isRead: true
            };
            setMessages([welcome]);
          } else {
            setMessages(filtered);
          }
        })
        .catch(console.error);
    }
  }, [isChatOpen, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const senderId = user ? user.id : 'guest';
    const senderName = user ? user.name : 'Tamu Pengunjung';

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId,
      senderName,
      receiverId: 'admin',
      message: inputMessage,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    try {
      // Save msg in backend
      await API.sendChatMessage(newMsg);

      // Trigger automatic operator response
      setIsTyping(true);
      setTimeout(async () => {
        let replyText = 'Terima kasih atas pertanyaannya. Admin kami akan segera menghubungi Anda kembali melalui WhatsApp atau Email.';
        
        const q = inputMessage.toLowerCase();
        if (q.includes('harga') || q.includes('biaya') || q.includes('sewa')) {
          replyText = 'Sewa lapangan di UTM Sport Center mulai dari Rp 120.000 hingga Rp 150.000 (Futsal Vinyl) per jam. Anda dapat melihat detail harga lengkap di menu "Lapangan".';
        } else if (q.includes('batal') || q.includes('refund') || q.includes('cancel')) {
          replyText = 'Batal booking diperbolehkan maksimal 24 jam sebelum bermain. Dana akan dikembalikan 80% dalam bentuk Point Reward di akun Anda.';
        } else if (q.includes('member') || q.includes('membership')) {
          replyText = 'Kami memiliki program membership Bronze, Silver, dan Gold dengan keuntungan diskon booking otomatis hingga 15% setiap main serta poin reward berlipat ganda!';
        } else if (q.includes('lokasi') || q.includes('alamat') || q.includes('mataram')) {
          replyText = `UTM Sport Center berlokasi di Kota Mataram, Nusa Tenggara Barat. Detail alamat: ${settings.address}. Lokasi peta interaktif dapat dilihat di bagian kaki (footer) website kami.`;
        } else if (q.includes('promo') || q.includes('diskon')) {
          replyText = 'Promo aktif hari ini adalah Flash Sale Selasa Hebat (Diskon 20% jam 08:00 - 14:00 WITA) dan voucher UTM10 (potongan 10%). Masukkan kode voucher saat memesan!';
        } else if (q.includes('turnamen') || q.includes('event')) {
          replyText = 'Saat ini kami sedang membuka pendaftaran untuk "UTM Futsal Cup Mataram 2026" dengan total hadiah Rp 15.000.000! Daftar sekarang di menu Turnamen.';
        }

        const replyMsg: ChatMessage = {
          id: `chat-reply-${Date.now()}`,
          senderId: 'admin',
          senderName: 'UTM Sport Assistant',
          receiverId: senderId,
          message: replyText,
          createdAt: new Date().toISOString(),
          isRead: true
        };

        setMessages(prev => [...prev, replyMsg]);
        await API.sendChatMessage(replyMsg);
        setIsTyping(false);
      }, 1500);

    } catch (err) {
      console.error('Failed to process message', err);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Admin UTM Sport Center, saya tertarik untuk booking lapangan olahraga. Bisa dibantu ketersediaan hari ini?`
    );
    window.open(`https://wa.me/${settings.whatsappContact.replace(/\D/g, '')}?text=${text}`, '_blank', 'noreferrer');
  };

  return (
    <div id="floating-widgets-container" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3.5 font-sans">
      
      {/* Live Chat Floating Trigger / Widget */}
      {isChatOpen ? (
        <div className="w-80 md:w-96 h-[450px] bg-white dark:bg-sport-slate rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Chat Header */}
          <div className="bg-sport-navy text-white px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              <div>
                <h4 className="font-bold text-sm">Live Chat UTM Sport</h4>
                <p className="text-[10px] text-gray-300">Respon dalam beberapa detik</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-sport-dark/60">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.senderId === (user?.id || 'guest') ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-medium px-1">
                  {msg.senderName}
                </span>
                <div 
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.senderId === (user?.id || 'guest')
                      ? 'bg-sport-navy text-white rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-sport-slate text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-mono px-1">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-medium px-1">UTM Sport Assistant</span>
                <div className="bg-white dark:bg-sport-slate px-3 py-2.5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Footer Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-sport-slate border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ketik pesan Anda..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-navy dark:focus:border-sport-green text-gray-800 dark:text-white"
            />
            <button 
              type="submit"
              className="p-2 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl hover:bg-sport-navy-light cursor-pointer shadow-md transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-13 h-13 bg-sport-navy text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-sport-navy-light hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
          title="Tanya Admin UTM Sport Center"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute right-15 bg-sport-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Live Chat Admin
          </span>
        </button>
      )}

    </div>
  );
}
