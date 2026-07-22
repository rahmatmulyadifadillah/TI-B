/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, LogOut, LayoutDashboard, Award, Shield, Sparkles, HelpCircle } from 'lucide-react';
import { AppNotification, UserProfile, AppSettings, MenuItem } from '../types';
import { API } from '../api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  settings: AppSettings;
  menus: MenuItem[];
}

export default function Navbar({ 
  currentView, 
  onNavigate, 
  user, 
  onLogout, 
  darkMode, 
  onToggleDarkMode,
  settings,
  menus
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Auto dismiss toast after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    let intervalId: any;

    if (user) {
      // Keep track of shown notification IDs to prevent repeating toasts
      const shownNotifIds = new Set<string>();

      const fetchNotifications = (isInitial = false) => {
        API.getNotifications(user.id)
          .then(res => {
            if (!res || !Array.isArray(res)) return;
            if (isInitial) {
              // On initial load, just populate the list and mark them as "already known"
              res.forEach(n => shownNotifIds.add(n.id));
              setNotifications(res);
            } else {
              // On subsequent polls, check if there's any NEW unread notification
              const newUnread = res.find(n => !n.isRead && !shownNotifIds.has(n.id));
              if (newUnread) {
                // We found a brand-new unread notification! Show a toast!
                setActiveToast(newUnread);
                shownNotifIds.add(newUnread.id);
              }
              // Always keep shownNotifIds updated with all loaded IDs so we don't re-toast
              res.forEach(n => shownNotifIds.add(n.id));
              setNotifications(res);
            }
          })
          .catch(console.error);
      };

      // Initial fetch
      fetchNotifications(true);

      // Poll every 3 seconds for instant notification updates
      intervalId = setInterval(() => {
        fetchNotifications(false);
      }, 3000);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, currentView]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsAsRead = () => {
    if (user && unreadCount > 0) {
      API.markNotificationsRead(user.id)
        .then(() => {
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        })
        .catch(console.error);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (user) {
      API.markNotificationsRead(user.id)
        .then(() => {
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        })
        .catch(console.error);
    }
    onNavigate('dashboard-user');
    setActiveToast(null);
    setShowNotifications(false);
  };

  // Dynamic menus sorted by order, fallback to default if empty
  const sortedMenus = (menus && menus.length > 0 ? [...menus].sort((a, b) => a.order - b.order) : [])
    .map((item, index) => ({
      label: item.label,
      view: item.view || item.url || 'home',
      key: item.id || `menu-dyn-${index}`
    }));

  const finalNavItems = sortedMenus.length > 0 ? sortedMenus : [
    { label: 'Home', view: 'home', key: 'home' },
    { label: 'Lapangan', view: 'lapangan', key: 'lapangan' },
    { label: 'Membership', view: 'membership', key: 'membership' },
    { label: 'Turnamen & Event', view: 'turnamen', key: 'turnamen' },
    { label: 'Galeri', view: 'galeri', key: 'galeri' },
    { label: 'Tentang Kami', view: 'tentang', key: 'tentang' },
    { label: 'FAQ', view: 'faq', key: 'faq' }
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve custom branding
  const brandTitle = settings?.brandName || "UTM Sport Center";
  const brandSub = `${settings?.contactCity || "Mataram"} - ${settings?.contactProvince || "NTB"}`;

  return (
    <>
      <nav 
      id="main-navbar"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-sport-dark/95 shadow-md backdrop-blur-md py-3' 
          : 'bg-white/80 dark:bg-sport-dark/80 backdrop-blur-sm py-4'
      } border-b border-gray-100 dark:border-gray-800`}
    >
      <div className="responsive-container flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleNavClick('home')}
        >
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-9 h-9 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-2xl">🏆</span>
          )}
          <div>
            <h1 className="text-lg font-bold text-sport-navy dark:text-white leading-tight tracking-tight">
              {brandTitle}
            </h1>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase">{brandSub}</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1">
          {finalNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.view)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentView === item.view
                  ? 'text-white bg-sport-navy dark:bg-sport-navy-light shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-sport-navy dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* User / Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="flex items-center gap-2 relative">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                    if (!showNotifications) markAllNotificationsAsRead();
                  }}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-sport-slate rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="font-bold text-gray-800 dark:text-white">Notifikasi</span>
                      {unreadCount > 0 && <span className="text-xs bg-red-100 dark:bg-red-950/40 text-red-600 px-2 py-0.5 rounded-full font-medium">{unreadCount} Baru</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
                          Tidak ada notifikasi baru
                        </div>
                      ) : (
                        notifications.slice().reverse().map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left ${
                              !notif.isRead ? 'bg-sport-navy/5 dark:bg-sport-navy-light/10' : ''
                            }`}
                          >
                            <h4 className="font-semibold text-xs text-gray-800 dark:text-white flex items-center gap-1.5">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 block mt-1.5 font-mono">
                              {new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-sport-green"
                  />
                  <div className="hidden md:block text-left max-w-[120px]">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                    <span className="text-[10px] bg-sport-navy/10 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green px-1.5 py-0.2 rounded font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-sport-slate rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Loyalty Level</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-gray-800 dark:text-white capitalize">Member {user.membership}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-sport-green font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{user.points} Points</span>
                      </div>
                    </div>

                    {!(user.role === 'admin' || user.role === 'superadmin' || user.role === 'operator' || user.role === 'kasir') && (
                      <button
                        onClick={() => {
                          handleNavClick('dashboard-user');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <User className="w-4.5 h-4.5 text-gray-400" />
                        Dashboard User
                      </button>
                    )}

                    {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'operator' || user.role === 'kasir') && (
                      <button
                        onClick={() => {
                          handleNavClick('dashboard-admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-sport-navy dark:text-sport-green-bright hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer font-semibold"
                      >
                        <Shield className="w-4.5 h-4.5" />
                        Dashboard Admin
                      </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-sport-navy dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-sport-navy dark:bg-sport-navy-light text-white shadow-md hover:bg-sport-navy-light hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                Daftar
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-sport-dark border-t border-gray-100 dark:border-gray-800 py-3 px-4 shadow-xl flex flex-col gap-1 z-40 relative">
          {finalNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentView === item.view
                  ? 'text-white bg-sport-navy dark:bg-sport-navy-light shadow-md'
                  : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>

    {/* Real-time Toast Notification Banner */}
    {activeToast && (
      <div 
        onClick={() => handleNotificationClick(activeToast)}
        className="fixed top-24 right-4 z-[9999] max-w-sm w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-l-4 border-green-500 p-4 flex gap-3 animate-[bounce_1s_infinite_1] border border-gray-100 dark:border-gray-800 cursor-pointer pointer-events-auto hover:scale-102 transition-transform"
      >
        <div className="text-2xl shrink-0 animate-bounce">🔔</div>
        <div className="flex-grow text-left">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{activeToast.title}</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{activeToast.message}</p>
          <span className="text-[9px] text-sport-green font-bold mt-1.5 block">Klik untuk melihat detail</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActiveToast(null);
          }} 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold self-start cursor-pointer p-1"
        >
          ✕
        </button>
      </div>
    )}
  </>
);
}
