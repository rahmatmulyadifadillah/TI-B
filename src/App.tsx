/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWidgets from './components/FloatingWidgets';

// Pages
import Home from './pages/Home';
import Lapangan from './pages/Lapangan';
import BookingPage from './pages/BookingPage';
import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import TentangKami from './pages/TentangKami';
import FAQPage from './pages/FAQPage';
import TurnamenPage from './pages/TurnamenPage';
import GaleriPage from './pages/GaleriPage';
import KontakPage from './pages/KontakPage';
import Pembayaran from './pages/Pembayaran';

import { Court, UserProfile, AppSettings, Promo, Article, GalleryItem, Sponsor, MenuItem, Facility, Testimonial } from './types';
import { API } from './api';

// Default Fallback Settings
const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode: false,
  siteName: 'UTM Sport Center',
  whatsappContact: '081339638842',
  instagramContact: 'rahmtmlydi__',
  emailContact: 'rahmatmulyadifadillah@gmail.com',
  address: 'Jl. Pemuda No. 12, Dasan Agung Baru, Kec. Selaparang, Kota Mataram, Nusa Tenggara Barat 83125, Indonesia',
  locationMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126244.62916167888!2d116.03541484831665!3d-8.577241285038318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3945.14819777598!2d116.1035515!3d-8.5833446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1710000000000'
};

export default function App() {
  const [view, setView] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);
  
  // Custom states matching Home requirements
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Dark mode tracking
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('utm_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync session & scroll on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Sync dark mode HTML classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('utm_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('utm_dark_mode', 'false');
    }
  }, [darkMode]);

  // Load initial content loaders
  useEffect(() => {
    // 1. Fields Catalog
    API.getCourts()
      .then(setCourts)
      .catch(console.error);

    // 2. Settings Config
    API.getSettings()
      .then(setSettings)
      .catch(console.error);

    // 3. User session (Synchronous retrieval)
    const currentUser = API.getCurrentUser();
    setUser(currentUser);

    // 4. Marketing Promos
    API.getPromos()
      .then(setPromos)
      .catch(console.error);

    // 5. Blog Articles
    API.getArticles()
      .then(setArticles)
      .catch(console.error);

    // 6. Photo Gallery
    API.getGallery()
      .then(setGallery)
      .catch(console.error);

    // 7. Sponsors
    API.getSponsors()
      .then(setSponsors)
      .catch(console.error);

    // 8. Navigation Menus
    API.getMenus()
      .then(setMenus)
      .catch(console.error);

    // 9. Facilities (Keunggulan)
    API.getFacilities()
      .then(setFacilities)
      .catch(console.error);

    // 10. Testimonials
    API.getTestimonials()
      .then(setTestimonials)
      .catch(console.error);
  }, []);

  const handleRefreshCMS = () => {
    API.getSettings().then(setSettings).catch(console.error);
    API.getPromos().then(setPromos).catch(console.error);
    API.getArticles().then(setArticles).catch(console.error);
    API.getGallery().then(setGallery).catch(console.error);
    API.getSponsors().then(setSponsors).catch(console.error);
    API.getMenus().then(setMenus).catch(console.error);
    API.getFacilities().then(setFacilities).catch(console.error);
    API.getTestimonials().then(setTestimonials).catch(console.error);
  };

  const handleRefreshCourts = () => {
    API.getCourts()
      .then(setCourts)
      .catch(console.error);
  };

  const handleBookingTrigger = (court: Court) => {
    setSelectedCourt(court);
    setView('booking');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    API.setCurrentUser(loggedInUser);
    setUser(loggedInUser);
    setView('home');
  };

  const handleLogout = () => {
    API.setCurrentUser(null);
    setUser(null);
    setView('home');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Safe navigation intercept for specific unmapped states
  const handleNavigate = (targetView: string, extraId?: string) => {
    if (targetView === 'pembayaran') {
      setPaymentBookingId(extraId || null);
      setView('pembayaran');
      return;
    }

    if (targetView === 'jadwal') {
      setView('lapangan');
    } else if (targetView === 'membership') {
      if (user) {
        setView('dashboard-user');
      } else {
        alert('Silakan masuk terlebih dahulu untuk melihat informasi program Membership.');
        setView('login');
      }
    } else if (targetView === 'promo') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById('promos-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (targetView === 'artikel') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById('articles-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (targetView === 'tentang') {
      setView('tentang-kami');
    } else {
      setView(targetView);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans">
      
      {/* Dynamic Navigation Header */}
      {view !== 'dashboard-admin' && (
        <Navbar 
          currentView={view} 
          onNavigate={handleNavigate} 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          settings={settings}
          menus={menus}
        />
      )}

      {/* Main Page Canvas area */}
      <main className="flex-grow">
        {view === 'home' && (
          <Home 
            courts={courts} 
            onNavigate={handleNavigate} 
            promos={promos}
            articles={articles}
            gallery={gallery}
            sponsors={sponsors}
            settings={settings}
            facilities={facilities}
            testimonials={testimonials}
          />
        )}
        
        {view === 'lapangan' && (
          <Lapangan 
            courts={courts} 
            user={user} 
            onBookingTrigger={handleBookingTrigger} 
            onNavigate={handleNavigate} 
          />
        )}

        {view === 'booking' && (
          <BookingPage 
            courts={courts} 
            user={user} 
            selectedCourtFromParent={selectedCourt} 
            onNavigate={handleNavigate} 
            onBookingSuccess={handleRefreshCourts} 
          />
        )}

        {view === 'pembayaran' && (
          <Pembayaran 
            user={user}
            bookingId={paymentBookingId}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'dashboard-user' && (
          <DashboardUser 
            user={user} 
            onNavigate={handleNavigate} 
            onUpdateUser={setUser} 
            onLogout={handleLogout} 
          />
        )}

        {view === 'dashboard-admin' && (
          <DashboardAdmin 
            user={user} 
            onNavigate={handleNavigate} 
            courts={courts} 
            onRefreshCourts={handleRefreshCourts} 
            onRefreshCMS={handleRefreshCMS}
            onUpdateUser={setUser}
          />
        )}

        {view === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onNavigate={handleNavigate} 
          />
        )}

        {view === 'register' && (
          <Register 
            onRegisterSuccess={handleLoginSuccess} 
            onNavigate={handleNavigate} 
          />
        )}

        {view === 'tentang-kami' && <TentangKami />}

        {view === 'faq' && <FAQPage />}

        {view === 'turnamen' && <TurnamenPage />}

        {view === 'galeri' && <GaleriPage />}

        {view === 'kontak' && <KontakPage />}
      </main>

      {/* Footer Branding and coordinates */}
      {view !== 'dashboard-admin' && <Footer onNavigate={handleNavigate} settings={settings} />}

      {/* Dynamic Widget overlays for live chats & whatsapp shortcuts */}
      {view !== 'dashboard-admin' && <FloatingWidgets user={user} settings={settings} />}

    </div>
  );
}
