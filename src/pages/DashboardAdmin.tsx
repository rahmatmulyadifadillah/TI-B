/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Calendar, Users, DollarSign, Sparkles, Check, X, 
  Plus, Edit, Trash2, Settings, ListCollapse, Database, ShieldAlert, Eye,
  MessageSquare, Upload, LogOut, Home, ZoomIn, ZoomOut, Maximize2, Minimize2, Download
} from 'lucide-react';
import { Court, Booking, UserProfile, Voucher, LogActivity, AppSettings, Payment, PaymentLog, MenuItem, Facility, Testimonial, MembershipPackage, GalleryItem } from '../types';
import { API } from '../api';
import { Quote, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface DashboardAdminProps {
  user: UserProfile | null;
  onNavigate: (view: string) => void;
  courts: Court[];
  onRefreshCourts: () => void;
  onRefreshCMS?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export default function DashboardAdmin({ user, onNavigate, courts, onRefreshCourts, onRefreshCMS, onUpdateUser }: DashboardAdminProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [logs, setLogs] = useState<LogActivity[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentLogsList, setPaymentLogsList] = useState<PaymentLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // CMS dynamic sub-collections state
  const [menusList, setMenusList] = useState<MenuItem[]>([]);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuLabel, setMenuLabel] = useState('');
  const [menuView, setMenuView] = useState('');
  const [menuOrder, setMenuOrder] = useState(1);

  const [facilitiesList, setFacilitiesList] = useState<Facility[]>([]);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityName, setFacilityName] = useState('');
  const [facilityDesc, setFacilityDesc] = useState('');
  const [facilityIcon, setFacilityIcon] = useState('CheckCircle');

  // --- GALLERY (Dokumentasi UTM) CRUD ---
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<string>('fasilitas');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploadingGalleryImage(true);
      try {
        const res = await API.uploadImage(file.name, base64);
        setGalleryImageUrl(res.url);
        alert('Foto galeri UTM berhasil diupload!');
      } catch (err: any) {
        alert('Gagal mengupload foto galeri: ' + err.message);
      } finally {
        setIsUploadingGalleryImage(false);
      }
    };
  };

  const resetGalleryForm = () => {
    setEditingGalleryItem(null);
    setGalleryTitle('');
    setGalleryCategory('fasilitas');
    setGalleryImageUrl('');
  };

  const loadGallery = () => {
    API.getGallery().then(setGalleryList).catch(console.error);
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!galleryTitle.trim()) {
      alert('Judul galeri wajib diisi!');
      return;
    }
    if (!galleryImageUrl) {
      alert('Silakan upload foto galeri terlebih dahulu!');
      return;
    }

    try {
      if (editingGalleryItem) {
        const payload: GalleryItem = {
          ...editingGalleryItem,
          title: galleryTitle.trim(),
          category: galleryCategory,
          imageUrl: galleryImageUrl
        };
        await API.updateGalleryItem(payload);
        alert('Galeri berhasil diperbarui!');
      } else {
        const payload: GalleryItem = {
          id: `g-${Date.now()}`,
          title: galleryTitle.trim(),
          category: galleryCategory,
          imageUrl: galleryImageUrl
        };
        await API.createGalleryItem(payload);
        alert('Galeri baru berhasil ditambahkan!');
      }

      resetGalleryForm();
      loadGallery();
      onRefreshCMS?.();
    } catch (err: any) {
      alert('Gagal menyimpan galeri: ' + err.message);
    }
  };

  const handleEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryTitle(item.title);
    setGalleryCategory(item.category || 'fasilitas');
    setGalleryImageUrl(item.imageUrl);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus item galeri ini?')) return;
    try {
      await API.deleteGalleryItem(id);
      alert('Item galeri berhasil dihapus!');
      loadGallery();
      onRefreshCMS?.();
    } catch (err: any) {
      alert('Gagal menghapus galeri: ' + err.message);
    }
  };

  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('');
  const [testimonialMessage, setTestimonialMessage] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialAvatar, setTestimonialAvatar] = useState('');

  // CMS sub-tab inside settings
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'menus' | 'facilities' | 'testimonials' | 'membership' | 'galeri' | 'database' | 'profile'>('general');

  const [membershipPackagesList, setMembershipPackagesList] = useState<MembershipPackage[]>([]);
  const [editingMembershipPackage, setEditingMembershipPackage] = useState<MembershipPackage | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState(50000);
  const [pkgDiscountPercent, setPkgDiscountPercent] = useState(5);
  const [pkgCashbackMultiplier, setPkgCashbackMultiplier] = useState(1.0);
  const [pkgPriorityDays, setPkgPriorityDays] = useState(3);
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgFeatures, setPkgFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminPhone, setAdminPhone] = useState(user?.phone || '');
  const [adminPhoto, setAdminPhoto] = useState(user?.photoUrl || '');
  const [isUploadingAdminPhoto, setIsUploadingAdminPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setAdminName(user.name || '');
      setAdminPhone(user.phone || '');
      setAdminPhoto(user.photoUrl || '');
    }
  }, [user]);

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploadingAdminPhoto(true);
      try {
        const res = await API.uploadImage(file.name, base64);
        setAdminPhoto(res.url);
        alert('Foto profil admin berhasil diunggah!');
      } catch (err: any) {
        alert('Gagal mengunggah foto profil admin: ' + err.message);
      } finally {
        setIsUploadingAdminPhoto(false);
      }
    };
  };

  const handleAdminProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // When user clicks "Simpan Profil", make sure we send the latest photoUrl.
    // If upload is still in progress, block the update to avoid race condition.
    if (isUploadingAdminPhoto) {
      alert('Sedang mengunggah foto. Silakan tunggu sebentar...');
      return;
    }


    e.preventDefault();
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name: adminName,
      phone: adminPhone,
      photoUrl: adminPhoto
    };

    try {
      const res = await API.updateUser(updated);
      if (onUpdateUser) onUpdateUser(res);
      alert('Profil Admin berhasil diperbarui!');
    } catch (err: any) {
      alert(`Gagal mengupdate profil admin: ${err.message}`);
    }
  };

  // Tab state
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'payments' | 'paymentsHistory' | 'paymentLogs' | 'courts' | 'vouchers' | 'logs' | 'settings' | 'chats' | 'schedules' | 'membershipManagement'>('stats');

  // Revenue Chart Mode (Bulanan vs Mingguan) & Selection
  const [revenueChartMode, setRevenueChartMode] = useState<'bulanan' | 'mingguan'>('bulanan');
  const [selectedMonthForWeekly, setSelectedMonthForWeekly] = useState<number>(6); // Default to July (index 6)

  // Schedule Management states
  const [selectedSchedCourt, setSelectedSchedCourt] = useState<string>('');
  const [selectedSchedDate, setSelectedSchedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Modal / Receipt viewer state
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreenReceipt, setIsFullscreenReceipt] = useState(false);

  // Court editing states
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [courtName, setCourtName] = useState('');
  const [courtCategory, setCourtCategory] = useState<'futsal'>('futsal');
  const [courtType, setCourtType] = useState('Vinyl');
  const [courtPrice, setCourtPrice] = useState(120000);
  const [courtSize, setCourtSize] = useState('38m x 18m');
  const [courtDesc, setCourtDesc] = useState('');
  const [courtImage, setCourtImage] = useState('https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800');

  // File uploading state
  const [isUploading, setIsUploading] = useState(false);

  // Voucher state
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [vCode, setVCode] = useState('');
  const [vValue, setVValue] = useState(20000);
  const [vMin, setVMin] = useState(100000);
  const [vDesc, setVDesc] = useState('');

  // Payment Rejection states
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionInput, setRejectionInput] = useState('');

  // Settings editing state
  const [whatsapp, setWhatsapp] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [address, setAddress] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [footerText, setFooterText] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [contactCity, setContactCity] = useState('');
  const [contactProvince, setContactProvince] = useState('');
  const [locationMapsUrl, setLocationMapsUrl] = useState('');

  // User Membership Direct Control States
  const [editingUserForMembership, setEditingUserForMembership] = useState<UserProfile | null>(null);
  const [targetUserMembership, setTargetUserMembership] = useState<string>('regular');
  const [targetUserPoints, setTargetUserPoints] = useState<number>(0);
  const [targetUserMembershipExpiresAt, setTargetUserMembershipExpiresAt] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Chat center state
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Bookings filtering and searching states
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'diproses' | 'dikonfirmasi' | 'ditolak'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      try {
        const res = await API.uploadImage(file.name, base64);
        setCourtImage(res.url);
        alert('Foto lapangan berhasil diupload!');
      } catch (err: any) {
        alert('Gagal mengupload foto: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleCMSImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      try {
        const res = await API.uploadImage(file.name, base64);
        if (target === 'logo') setLogoUrl(res.url);
        if (target === 'hero') setHeroImageUrl(res.url);
        if (target === 'avatar') setTestimonialAvatar(res.url);
        alert('Media CMS berhasil diupload!');
      } catch (err: any) {
        alert('Gagal mengupload media: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const loadCMSCollections = () => {
    API.getMenus().then(setMenusList).catch(console.error);
    API.getFacilities().then(setFacilitiesList).catch(console.error);
    API.getTestimonials().then(setTestimonialsList).catch(console.error);
    API.getMembershipPackages().then(setMembershipPackagesList).catch(console.error);
    API.getGallery().then(setGalleryList).catch(console.error);
  };

  useEffect(() => {
    // Check permissions
    if (user && user.role === 'user') {
      alert('Maaf, Anda tidak memiliki hak akses untuk membuka Dashboard Admin.');
      onNavigate('home');
    }

    const loadData = () => {
      API.getBookings().then(setBookings).catch(console.error);
      API.getUsers().then(setUsers).catch(console.error);
      API.getLogs().then(setLogs).catch(console.error);
      API.getChats().then(setChats).catch(console.error);
      API.getPayments().then(setPayments).catch(console.error);
      API.getPaymentLogs().then(setPaymentLogsList).catch(console.error);
    };

    // Load initial data
    loadData();
    loadCMSCollections();
    API.getVouchers().then(setVouchers).catch(console.error);
    API.getSettings().then(s => {
      setSettings(s);
      setWhatsapp(s.whatsappContact || '');
      setEmailContact(s.emailContact || '');
      setAddress(s.address || '');
      setBrandName(s.brandName || 'UTM Sport Center');
      setLogoUrl(s.logoUrl || '');
      setMarqueeText(s.marqueeText || 'Selamat Datang di UTM Sport Center!');
      setHeroTitle(s.heroTitle || 'UTM Sport Center');
      setHeroSubtitle(s.heroSubtitle || 'Mataram - NTB');
      setHeroImageUrl(s.heroImageUrl || '');
      setFooterText(s.footerText || '');
      setFooterCopyright(s.footerCopyright || '');
      setContactCity(s.contactCity || 'Mataram');
      setContactProvince(s.contactProvince || 'NTB');
      setLocationMapsUrl(s.locationMapsUrl || '');
    }).catch(console.error);

    // Set polling interval of 4 seconds to make new payment submissions appear in admin in real-time
    const interval = setInterval(loadData, 4000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle schedules loading
  useEffect(() => {
    if (courts && courts.length > 0 && !selectedSchedCourt) {
      setSelectedSchedCourt(courts[0].id);
    }
  }, [courts, selectedSchedCourt]);

  // Reload gallery data when switching to galeri sub-tab
  useEffect(() => {
    if (settingsSubTab === 'galeri') {
      loadGallery();
    }
  }, [settingsSubTab]);

  useEffect(() => {
    if (activeTab === 'schedules' && selectedSchedCourt && selectedSchedDate) {
      setLoadingSchedules(true);
      API.getSchedules(selectedSchedCourt, selectedSchedDate)
        .then(setScheduleSlots)
        .catch(console.error)
        .finally(() => setLoadingSchedules(false));
    }
  }, [activeTab, selectedSchedCourt, selectedSchedDate]);

  const handleUpdateSlotStatus = async (timeSlot: string, newStatus: 'tersedia' | 'dipesan' | 'terkunci') => {
    if (!selectedSchedCourt || !selectedSchedDate) return;

    try {
      const res = await API.lockScheduleSlot(selectedSchedCourt, selectedSchedDate, timeSlot, newStatus);
      setScheduleSlots(prev => prev.map(s => s.timeSlot === timeSlot ? res : s));
      // Refresh activity logs
      API.getLogs().then(setLogs).catch(console.error);
    } catch (err: any) {
      alert(`Gagal memperbarui status slot: ${err.message}`);
    }
  };

  const handleApproveBooking = async (booking: Booking) => {
    if (!window.confirm(`Konfirmasi pembayaran untuk #${booking.invoiceNumber}?`)) {
      return;
    }

    const updated: Booking = {
      ...booking,
      status: 'dikonfirmasi' // updates status to confirmed
    };

    try {
      const res = await API.updateBooking(updated);
      setBookings(prev => prev.map(b => b.id === booking.id ? res : b));
      
      // Handle Membership upgrade
      if (booking.bookingType === 'membership') {
        let tier: 'bronze' | 'silver' | 'gold' = 'bronze';
        if (booking.notes?.toLowerCase().includes('silver') || booking.details[0]?.courtName.toLowerCase().includes('silver')) {
          tier = 'silver';
        } else if (booking.notes?.toLowerCase().includes('gold') || booking.details[0]?.courtName.toLowerCase().includes('gold')) {
          tier = 'gold';
        }

        let pointsRewardBonus = 50; 
        if (tier === 'silver') pointsRewardBonus = 100;
        if (tier === 'gold') pointsRewardBonus = 200;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const usersList = await API.getUsers();
        const targetUser = usersList.find(u => u.id === booking.userId);
        if (targetUser) {
          const updatedUser: UserProfile = {
            ...targetUser,
            membership: tier,
            points: targetUser.points + pointsRewardBonus,
            membershipExpiresAt: expiresAt.toISOString()
          };
          const freshUser = await API.updateUser(updatedUser);
          
          // Sync local session if we updated ourselves
          if (booking.userId === user?.id) {
            API.setCurrentUser(freshUser);
            if (onUpdateUser) onUpdateUser(freshUser);
          }
        }
        alert(`Pembayaran membership ${tier.toUpperCase()} untuk user ${booking.userName} berhasil Dikonfirmasi! Status level member user kini aktif.`);
      } else {
        alert(`Booking #${booking.invoiceNumber} berhasil Dikonfirmasi! Email notifikasi otomatis telah dikirim.`);
      }
      
      // Refresh logs
      API.getLogs().then(setLogs).catch(console.error);
    } catch (err: any) {
      alert(`Gagal mengonfirmasi: ${err.message}`);
    }
  };

  const handleRejectBooking = async (booking: Booking) => {
    if (!window.confirm(`Tolak pembayaran untuk booking #${booking.invoiceNumber}? Slot jam bermain akan dibebaskan kembali.`)) {
      return;
    }

    const updated: Booking = {
      ...booking,
      status: 'ditolak'
    };

    try {
      const res = await API.updateBooking(updated);
      setBookings(prev => prev.map(b => b.id === booking.id ? res : b));
      alert(`Booking #${booking.invoiceNumber} ditolak. Slot jadwal dibebaskan.`);
      
      // Refresh logs
      API.getLogs().then(setLogs).catch(console.error);
    } catch (err: any) {
      alert(`Gagal memproses: ${err.message}`);
    }
  };

  const handleVerifyPaymentProof = async (bookingId: string, status: 'pembayaran_diterima' | 'pembayaran_ditolak', reason?: string) => {
    try {
      await API.verifyPayment(bookingId, status, reason);
      alert(`Pembayaran berhasil ${status === 'pembayaran_diterima' ? 'disetujui' : 'ditolak'}!`);
      setRejectingPaymentId(null);
      setRejectionInput('');
      
      // Refresh all related data
      API.getBookings().then(setBookings).catch(console.error);
      API.getPayments().then(setPayments).catch(console.error);
      API.getPaymentLogs().then(setPaymentLogsList).catch(console.error);
      API.getLogs().then(setLogs).catch(console.error);
    } catch (err: any) {
      alert(`Gagal memproses verifikasi pembayaran: ${err.message}`);
    }
  };

  const handleUpdateUserMembershipDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForMembership) return;

    try {
      const updatedUser: UserProfile = {
        ...editingUserForMembership,
        membership: targetUserMembership as any,
        points: Number(targetUserPoints),
        membershipExpiresAt: targetUserMembershipExpiresAt ? new Date(targetUserMembershipExpiresAt).toISOString() : undefined
      };

      const res = await API.updateUser(updatedUser);
      // Update our local users state
      setUsers(prev => prev.map(u => u.id === editingUserForMembership.id ? res : u));

      // Sync local session if we updated ourselves
      if (editingUserForMembership.id === user?.id) {
        API.setCurrentUser(res);
        if (onUpdateUser) onUpdateUser(res);
      }

      alert(`Berhasil memperbarui membership untuk user ${editingUserForMembership.name}!`);
      setEditingUserForMembership(null);
      
      // Refresh logs
      API.getLogs().then(setLogs).catch(console.error);
    } catch (err: any) {
      alert(`Gagal memperbarui membership user: ${err.message}`);
    }
  };

  const handleSaveMembershipPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      alert('Nama paket wajib diisi!');
      return;
    }

    const payload: Partial<MembershipPackage> = {
      name: pkgName,
      price: pkgPrice,
      discountPercent: pkgDiscountPercent,
      cashbackMultiplier: pkgCashbackMultiplier,
      priorityDays: pkgPriorityDays,
      description: pkgDescription,
      features: pkgFeatures
    };

    try {
      if (editingMembershipPackage) {
        await API.updateMembershipPackage({
          ...editingMembershipPackage,
          ...payload
        } as MembershipPackage);
        alert('Paket membership berhasil diperbarui!');
      } else {
        await API.createMembershipPackage({
          id: `pkg-${pkgName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          ...payload
        });
        alert('Paket membership baru berhasil ditambahkan!');
      }

      // Reset form
      setEditingMembershipPackage(null);
      setPkgName('');
      setPkgPrice(50000);
      setPkgDiscountPercent(5);
      setPkgCashbackMultiplier(1.0);
      setPkgPriorityDays(3);
      setPkgDescription('');
      setPkgFeatures([]);
      setNewFeature('');

      // Refresh data
      API.getMembershipPackages().then(setMembershipPackagesList).catch(console.error);
    } catch (err: any) {
      alert(`Gagal menyimpan paket membership: ${err.message}`);
    }
  };

  const handleEditMembershipPackage = (p: MembershipPackage) => {
    setEditingMembershipPackage(p);
    setPkgName(p.name);
    setPkgPrice(p.price);
    setPkgDiscountPercent(p.discountPercent);
    setPkgCashbackMultiplier(p.cashbackMultiplier);
    setPkgPriorityDays(p.priorityDays);
    setPkgDescription(p.description || '');
    setPkgFeatures(p.features || []);
    setNewFeature('');
  };

  const handleDeleteMembershipPackage = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket membership ini?')) return;
    try {
      await API.deleteMembershipPackage(id);
      alert('Paket membership berhasil dihapus!');
      API.getMembershipPackages().then(setMembershipPackagesList).catch(console.error);
    } catch (err: any) {
      alert(`Gagal menghapus paket: ${err.message}`);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setPkgFeatures([...pkgFeatures, newFeature.trim()]);
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    setPkgFeatures(pkgFeatures.filter((_, i) => i !== index));
  };

  const handleSaveCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtImage) {
      alert('Silakan unggah foto lapangan terlebih dahulu!');
      return;
    }
    if (editingCourt) {
      const payload: Court = {
        ...editingCourt,
        name: courtName,
        category: courtCategory,
        courtType,
        price: courtPrice,
        size: courtSize,
        description: courtDesc,
        image: courtImage
      };

      try {
        await API.updateCourt(payload);
        alert('Lapangan berhasil diperbarui!');
        setEditingCourt(null);
        onRefreshCourts();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      const payload: Court = {
        id: `court-${Date.now()}`,
        name: courtName,
        category: courtCategory,
        courtType,
        price: courtPrice,
        capacity: 10,
        size: courtSize,
        description: courtDesc,
        facilities: ['Toilet', 'Musholla', 'Wifi', 'Parkir', 'Kantin', 'Ruang Ganti', 'Locker', 'Lampu Malam'],
        status: 'aktif',
        rating: 5.0,
        reviewsCount: 0,
        image: courtImage
      };

      try {
        await API.createCourt(payload);
        alert('Lapangan olahraga baru berhasil ditambahkan!');
        setIsAddingCourt(false);
        onRefreshCourts();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteCourt = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus lapangan ini? Seluruh jadwal lapangan ini juga akan dihapus.')) {
      return;
    }

    try {
      await API.deleteCourt(id);
      alert('Lapangan berhasil dihapus.');
      onRefreshCourts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Voucher = {
      id: `v-${Date.now()}`,
      code: vCode.toUpperCase(),
      discountType: 'flat',
      value: vValue,
      minPurchase: vMin,
      description: vDesc,
      status: 'aktif'
    };

    try {
      const res = await API.createVoucher(payload);
      setVouchers(prev => [...prev, res]);
      setVCode('');
      setIsAddingVoucher(false);
      alert('Kode voucher promo baru berhasil diaktifkan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const payload: AppSettings = {
      ...settings,
      whatsappContact: whatsapp,
      emailContact: emailContact,
      address,
      brandName,
      logoUrl,
      marqueeText,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      footerText,
      footerCopyright,
      contactCity,
      contactProvince,
      locationMapsUrl
    };

    try {
      const res = await API.updateSettings(payload);
      setSettings(res);
      alert('Pengaturan umum & Branding website berhasil disimpan!');
      onRefreshCMS?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- MENU NAVIGATION CRUD ---
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMenu) {
      const payload: MenuItem = {
        ...editingMenu,
        label: menuLabel,
        view: menuView,
        order: Number(menuOrder)
      };
      try {
        await API.updateMenu(payload);
        alert('Menu navigasi berhasil diperbarui!');
        setEditingMenu(null);
        setMenuLabel('');
        setMenuView('');
        setMenuOrder(1);
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      const payload: MenuItem = {
        id: `menu-${Date.now()}`,
        label: menuLabel,
        view: menuView,
        order: Number(menuOrder)
      };
      try {
        await API.createMenu(payload);
        alert('Menu navigasi baru berhasil ditambahkan!');
        setMenuLabel('');
        setMenuView('');
        setMenuOrder(1);
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus menu navigasi ini?')) return;
    try {
      await API.deleteMenu(id);
      alert('Menu navigasi berhasil dihapus.');
      loadCMSCollections();
      onRefreshCMS?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FACILITIES CRUD ---
  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFacility) {
      const payload: Facility = {
        ...editingFacility,
        name: facilityName,
        description: facilityDesc,
        icon: facilityIcon
      };
      try {
        await API.updateFacility(payload);
        alert('Fasilitas keunggulan berhasil diperbarui!');
        setEditingFacility(null);
        setFacilityName('');
        setFacilityDesc('');
        setFacilityIcon('CheckCircle');
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      const payload: Facility = {
        id: `facility-${Date.now()}`,
        name: facilityName,
        description: facilityDesc,
        icon: facilityIcon
      };
      try {
        await API.createFacility(payload);
        alert('Fasilitas keunggulan baru berhasil ditambahkan!');
        setFacilityName('');
        setFacilityDesc('');
        setFacilityIcon('CheckCircle');
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus fasilitas ini?')) return;
    try {
      await API.deleteFacility(id);
      alert('Fasilitas berhasil dihapus.');
      loadCMSCollections();
      onRefreshCMS?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- TESTIMONIALS CRUD ---
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      const payload: Testimonial = {
        ...editingTestimonial,
        name: testimonialName,
        role: testimonialRole,
        message: testimonialMessage,
        rating: Number(testimonialRating),
        avatar: testimonialAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
      try {
        await API.updateTestimonial(payload);
        alert('Testimonial pelanggan berhasil diperbarui!');
        setEditingTestimonial(null);
        setTestimonialName('');
        setTestimonialRole('');
        setTestimonialMessage('');
        setTestimonialRating(5);
        setTestimonialAvatar('');
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      const payload: Testimonial = {
        id: `testimonial-${Date.now()}`,
        name: testimonialName,
        role: testimonialRole,
        message: testimonialMessage,
        rating: Number(testimonialRating),
        avatar: testimonialAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
      try {
        await API.createTestimonial(payload);
        alert('Testimonial baru berhasil ditambahkan!');
        setTestimonialName('');
        setTestimonialRole('');
        setTestimonialMessage('');
        setTestimonialRating(5);
        setTestimonialAvatar('');
        loadCMSCollections();
        onRefreshCMS?.();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus testimoni ini?')) return;
    try {
      await API.deleteTestimonial(id);
      alert('Testimonial berhasil dihapus.');
      loadCMSCollections();
      onRefreshCMS?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- RESTORE DATABASE TO DEFAULT SEED STATE ---
  const handleRestoreDatabase = async () => {
    if (!window.confirm('PERINGATAN: Ini akan mereset seluruh database web ke kondisi awal bawaan (default seed data). Seluruh data transaksi & CMS buatan baru akan hilang. Lanjutkan?')) {
      return;
    }
    try {
      const res = await API.restoreDatabase();
      alert(res.message || 'Database berhasil direstorasi ke kondisi bawaan!');
      window.location.reload();
    } catch (err: any) {
      alert('Gagal merestorasi database: ' + err.message);
    }
  };

  const handleDownloadSQLBackup = () => {
    window.open(API.getDatabaseBackupUrl(), '_blank');
  };

  // ------------------------------------------------------------------
  // Statistics Computations
  // ------------------------------------------------------------------
  const confirmedBookings = bookings.filter(b => b.status === 'dikonfirmasi' || b.status === 'selesai' || b.status === 'booking_diproses' || b.status === 'booking_selesai');
  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'diproses' || b.status === 'sedang_diverifikasi');
  
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) {
      return false;
    }
    if (bookingSearch.trim() !== '') {
      const q = bookingSearch.toLowerCase();
      const matchInvoice = b.invoiceNumber.toLowerCase().includes(q);
      const matchName = b.userName.toLowerCase().includes(q);
      const matchEmail = b.userEmail.toLowerCase().includes(q);
      const matchPhone = b.userPhone ? b.userPhone.toLowerCase().includes(q) : false;
      const matchCourt = b.details.some(d => d.courtName.toLowerCase().includes(q));
      return matchInvoice || matchName || matchEmail || matchPhone || matchCourt;
    }
    return true;
  });
  
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalBookingsCount = bookings.length;
  const totalUsersCount = users.length;

  // Recharts Chart Data Formatting
  // 1. Revenue per court name
  const courtRevenue = confirmedBookings.reduce((acc, b) => {
    const name = b.courtName || 'Lapangan Futsal';
    acc[name] = (acc[name] || 0) + b.finalAmount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(courtRevenue).map(([name, value]) => ({
    name,
    value
  }));

  if (pieChartData.length === 0) {
    pieChartData.push({ name: 'Belum Ada Transaksi', value: 0 });
  }

  // Colors for pie
  const COLORS = ['#0B2F64', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const monthlyRevenueData = MONTH_NAMES.map((monthName, idx) => {
    const bookingsInMonth = confirmedBookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === idx && d.getFullYear() === 2026;
    });
    
    const revenue = bookingsInMonth.reduce((sum, b) => sum + b.finalAmount, 0);
    const count = bookingsInMonth.length;
    
    return {
      name: monthName,
      Pendapatan: revenue,
      Booking: count,
      average: count > 0 ? Math.round(revenue / count) : 0
    };
  });

  const bookingsInSelectedMonth = confirmedBookings.filter(b => {
    const d = new Date(b.createdAt);
    return d.getMonth() === selectedMonthForWeekly && d.getFullYear() === 2026;
  });

  const weeklyRevenueData = [
    { name: 'Minggu 1 (Tgl 1-7)', Pendapatan: 0, Booking: 0, average: 0 },
    { name: 'Minggu 2 (Tgl 8-14)', Pendapatan: 0, Booking: 0, average: 0 },
    { name: 'Minggu 3 (Tgl 15-21)', Pendapatan: 0, Booking: 0, average: 0 },
    { name: 'Minggu 4 (Tgl 22+)', Pendapatan: 0, Booking: 0, average: 0 }
  ];

  bookingsInSelectedMonth.forEach(b => {
    const day = new Date(b.createdAt).getDate();
    if (day <= 7) {
      weeklyRevenueData[0].Pendapatan += b.finalAmount;
      weeklyRevenueData[0].Booking += 1;
    } else if (day <= 14) {
      weeklyRevenueData[1].Pendapatan += b.finalAmount;
      weeklyRevenueData[1].Booking += 1;
    } else if (day <= 21) {
      weeklyRevenueData[2].Pendapatan += b.finalAmount;
      weeklyRevenueData[2].Booking += 1;
    } else {
      weeklyRevenueData[3].Pendapatan += b.finalAmount;
      weeklyRevenueData[3].Booking += 1;
    }
  });

  weeklyRevenueData.forEach(item => {
    item.average = item.Booking > 0 ? Math.round(item.Pendapatan / item.Booking) : 0;
  });

  const bookingGraphData = revenueChartMode === 'bulanan' ? monthlyRevenueData : weeklyRevenueData;

  return (
    <div className="font-sans py-12 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300">
      <div className="responsive-container">
        
        {/* Header Title */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white dark:bg-sport-slate p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-sport-navy dark:text-sport-green" /> Dashboard Kontrol Admin
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supervisi pendapatan, booking, ketersediaan jadwal, dan audit logs.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 lg:flex-none px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title="Kembali ke Beranda Web Utama"
            >
              <Home className="w-4.5 h-4.5" /> Kembali ke Web
            </button>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          {[
            { id: 'stats', label: 'Ringkasan & Grafik' },
            { id: 'bookings', label: `Kelola Pesanan (${bookings.filter(b => b.status === 'diproses' && b.bookingType !== 'membership').length})` },
            { id: 'membershipManagement', label: `Kelola Membership (${bookings.filter(b => b.bookingType === 'membership' && b.status === 'diproses').length})` },
            { id: 'payments', label: `Pembayaran Masuk (${payments.filter(p => p.status === 'sedang_diverifikasi').length})` },
            { id: 'paymentsHistory', label: 'Riwayat Pembayaran' },
            { id: 'paymentLogs', label: 'Log Pembayaran' },
            { id: 'schedules', label: 'Kelola Jadwal & Slot' },
            { id: 'courts', label: 'Kelola Lapangan' },
            { id: 'vouchers', label: 'Kupon Voucher' },
            { id: 'chats', label: 'Customer Live Chat' },
            { id: 'logs', label: 'Log Aktivitas' },
            { id: 'settings', label: 'Pengaturan Web' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sport-navy dark:bg-sport-navy-light text-white shadow-md'
                  : 'bg-white dark:bg-sport-slate text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. STATS & GRAPHS TAB */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Counts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white dark:bg-sport-slate p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">Gross Revenue</span>
                  <span className="text-xl font-extrabold text-sport-navy dark:text-sport-green font-mono mt-1 block">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><DollarSign className="w-6 h-6" /></div>
              </div>

              <div className="bg-white dark:bg-sport-slate p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">Total Bookings</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white mt-1 block font-mono">{totalBookingsCount}</span>
                </div>
                <div className="p-3 bg-sport-navy/10 text-sport-navy dark:text-white rounded-xl"><Calendar className="w-6 h-6" /></div>
              </div>

              <div className="bg-white dark:bg-sport-slate p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">Registered Users</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white mt-1 block font-mono">{totalUsersCount}</span>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users className="w-6 h-6" /></div>
              </div>

              <div className="bg-white dark:bg-sport-slate p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">Pending Approvals</span>
                  <span className="text-xl font-bold text-amber-500 mt-1 block font-mono">{pendingBookings.length}</span>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl animate-pulse"><TrendingUp className="w-6 h-6" /></div>
              </div>

            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Financial Growth */}
              <div className="lg:col-span-3 bg-white dark:bg-sport-slate p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Grafik Pertumbuhan Pendapatan</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Analisis detail aliran dana sewa lapangan yang sukses diterima sistem</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Toggle Mode */}
                    <div className="inline-flex rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
                      <button
                        onClick={() => setRevenueChartMode('bulanan')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          revenueChartMode === 'bulanan'
                            ? 'bg-white dark:bg-sport-navy text-sport-navy dark:text-sport-green shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        Bulanan
                      </button>
                      <button
                        onClick={() => setRevenueChartMode('mingguan')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                          revenueChartMode === 'mingguan'
                            ? 'bg-white dark:bg-sport-navy text-sport-navy dark:text-sport-green shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        Mingguan
                      </button>
                    </div>

                    {/* Month selector for Weekly */}
                    {revenueChartMode === 'mingguan' && (
                      <select
                        value={selectedMonthForWeekly}
                        onChange={(e) => setSelectedMonthForWeekly(Number(e.target.value))}
                        className="bg-gray-50 dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
                      >
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={idx} value={idx}>{name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* The Chart container */}
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingGraphData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                        tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (name === "Pendapatan") return [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pemasukan'];
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar name="Pendapatan" dataKey="Pendapatan" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Breakdown List / Table */}
                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4">
                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Detail Rincian Pemasukan Masuk</h5>
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800/80">
                          <th className="p-2.5">Periode / Waktu</th>
                          <th className="p-2.5">Total Pemasukan</th>
                          <th className="p-2.5 text-center">Jumlah Booking</th>
                          <th className="p-2.5 text-right">Rerata Transaksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-[11px] text-gray-700 dark:text-gray-300">
                        {revenueChartMode === 'bulanan' ? (
                          monthlyRevenueData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-sport-dark/20">
                              <td className="p-2.5 font-bold text-gray-900 dark:text-white">{item.name}</td>
                              <td className="p-2.5 font-mono font-bold text-green-600 dark:text-sport-green">
                                Rp {item.Pendapatan.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-center font-mono">{item.Booking}x</td>
                              <td className="p-2.5 text-right font-mono text-gray-400">
                                Rp {item.average.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          weeklyRevenueData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-sport-dark/20">
                              <td className="p-2.5 font-bold text-gray-900 dark:text-white">{item.name}</td>
                              <td className="p-2.5 font-mono font-bold text-green-600 dark:text-sport-green">
                                Rp {item.Pendapatan.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-center font-mono">{item.Booking}x</td>
                              <td className="p-2.5 text-right font-mono text-gray-400">
                                Rp {(item.Booking > 0 ? Math.round(item.Pendapatan / item.Booking) : 0).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. CONFIRM BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Daftar & Pemrosesan Pesanan</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supervisi dan kelola status pembayaran seluruh pesanan sewa lapangan futsal.</p>
              </div>
              <div className="text-xs bg-sport-navy/5 dark:bg-sport-navy/20 px-3 py-1.5 rounded-lg border border-sport-navy/10 font-bold text-sport-navy dark:text-sport-green shrink-0">
                Total: {bookings.length} Pesanan | Pending Verifikasi: {bookings.filter(b => b.status === 'diproses').length}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Cari berdasarkan No Invoice, Nama Penyewa, Lapangan..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-sport-dark/50 text-gray-850 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sport-navy dark:focus:ring-sport-green"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'diproses', label: 'Menunggu Verifikasi' },
                  { value: 'pending', label: 'Belum Bayar' },
                  { value: 'dikonfirmasi', label: 'Dikonfirmasi' },
                  { value: 'ditolak', label: 'Ditolak' }
                ].map((chip) => {
                  const count = chip.value === 'all' 
                    ? bookings.length 
                    : bookings.filter(b => b.status === chip.value).length;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => setBookingFilter(chip.value as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bookingFilter === chip.value
                          ? 'bg-sport-navy dark:bg-sport-navy-light text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-sport-dark text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {chip.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                <p className="text-xs">Tidak ada data pesanan yang cocok dengan kriteria pencarian.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((book) => {
                  let statusBadgeStyle = '';
                  let statusLabel = '';

                  switch (book.status) {
                    case 'pending':
                      statusBadgeStyle = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/40';
                      statusLabel = 'Belum Bayar';
                      break;
                    case 'diproses':
                      statusBadgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 animate-pulse';
                      statusLabel = 'Menunggu Verifikasi';
                      break;
                    case 'dikonfirmasi':
                    case 'selesai':
                      statusBadgeStyle = 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/40';
                      statusLabel = 'Dikonfirmasi';
                      break;
                    case 'ditolak':
                      statusBadgeStyle = 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40';
                      statusLabel = 'Ditolak';
                      break;
                    default:
                      statusBadgeStyle = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-750';
                      statusLabel = book.status;
                  }

                  return (
                    <div 
                      key={book.id}
                      className="p-5 bg-gray-50 dark:bg-sport-dark/65 rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                    >
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm font-mono text-gray-900 dark:text-white">{book.invoiceNumber}</strong>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${statusBadgeStyle}`}>
                            {statusLabel}
                          </span>
                          {book.bookingType === 'membership' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-bold uppercase rounded font-mono">
                              MEMBERSHIP
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-1">
                          <p>Penyewa: <strong className="text-gray-700 dark:text-gray-200">{book.userName}</strong> ({book.userEmail})</p>
                          <p>No. Telp: <strong className="text-gray-700 dark:text-gray-200">{book.userPhone || '-'}</strong></p>
                          <p>Tanggal Pesanan: <strong className="text-gray-700 dark:text-gray-200">{new Date(book.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</strong></p>
                          <p>Metode Bayar: <span className="font-semibold uppercase text-sport-navy dark:text-sport-green">{book.paymentMethod}</span></p>
                        </div>
                        
                        <div className="mt-3.5 space-y-1.5 pl-3 border-l-2 border-sport-navy/20 dark:border-sport-green/30">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rincian Sewa Lapangan:</p>
                          {book.details.map((d, i) => (
                            <p key={i} className="text-xs text-gray-750 dark:text-gray-300 flex items-center gap-1.5">
                              <span className="text-sport-green font-bold">✓</span> {d.courtName} {d.date && d.date !== '-' ? `• ${d.date} | Jam ${d.timeSlot}` : ''}
                            </p>
                          ))}
                        </div>
                        {book.notes && (
                          <p className="text-xs text-gray-400 italic mt-1 bg-white dark:bg-sport-dark/50 p-2 rounded border border-gray-100 dark:border-gray-800">
                            Catatan: {book.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Total Pembayaran:</span>
                          <span className="text-base font-extrabold text-sport-navy dark:text-sport-green font-mono">Rp {book.finalAmount.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                          {/* Receipt review trigger */}
                          {book.paymentProofUrl ? (
                            <button
                              onClick={() => setViewingReceiptUrl(book.paymentProofUrl || null)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-gray-700 transition-all"
                            >
                              <Eye className="w-4 h-4" /> Struk Bayar
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-500 font-bold p-2 italic shrink-0 self-center">Tanpa Unggah Bukti</span>
                          )}

                          {book.status !== 'dikonfirmasi' && book.status !== 'selesai' && (
                            <button
                              onClick={() => handleApproveBooking(book)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                            >
                              <Check className="w-4 h-4" /> Setujui (Confirm)
                            </button>
                          )}

                          {book.status !== 'ditolak' && (
                            <button
                              onClick={() => handleRejectBooking(book)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                            >
                              <X className="w-4 h-4" /> Tolak (Reject)
                            </button>
                          )}
                          
                          {/* Reset status if needed */}
                          {(book.status === 'dikonfirmasi' || book.status === 'selesai' || book.status === 'ditolak') && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Reset status pesanan ini kembali ke Pending / Belum Bayar?')) {
                                  try {
                                    const updated = { ...book, status: 'pending' as const };
                                    const res = await API.updateBooking(updated);
                                    setBookings(prev => prev.map(b => b.id === book.id ? res : b));
                                    alert('Status pesanan berhasil dikembalikan ke Pending.');
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-350 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-transparent dark:border-gray-700"
                            >
                              Reset Status
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2.0 MEMBERSHIP MANAGEMENT TAB */}
        {activeTab === 'membershipManagement' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    Kelola Program Membership Premium &amp; Pengguna
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supervisi pembelian membership premium, verifikasi pembayaran, dan sesuaikan level premium serta benefit pengguna secara langsung.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg font-bold text-amber-600 dark:text-amber-400">
                    Menunggu Verifikasi: {bookings.filter(b => b.bookingType === 'membership' && b.status === 'diproses').length} Permintaan
                  </div>
                </div>
              </div>

              {/* Grid Layout: Left column is pending requests, Right column is user list & edit */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. MEMBERSHIP PURCHASE REQUESTS (Melihat User Ketika Membeli Membership) */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                      📥 Permintaan Pendaftaran Membership
                    </h4>
                  </div>

                  {bookings.filter(b => b.bookingType === 'membership').length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-sport-dark/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-xs">Tidak ada riwayat atau permintaan pembelian membership.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {bookings
                        .filter(b => b.bookingType === 'membership')
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((req) => {
                          const isPending = req.status === 'diproses';
                          const isApproved = req.status === 'dikonfirmasi';
                          const isRejected = req.status === 'ditolak';

                          return (
                            <div 
                              key={req.id} 
                              className={`p-4 rounded-xl border transition-all ${
                                isPending 
                                  ? 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/30' 
                                  : 'bg-gray-50 dark:bg-sport-dark border-gray-200 dark:border-gray-800'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-mono bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                                    {req.invoiceNumber}
                                  </span>
                                  <h5 className="font-bold text-xs text-gray-800 dark:text-white mt-1">
                                    {req.userName}
                                  </h5>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isPending 
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                    : isApproved
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {isPending ? '⏳ Diproses' : isApproved ? '✅ Sukses' : '❌ Ditolak'}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 font-mono mb-3">
                                <p className="text-[11px]"><span className="text-gray-400">Paket:</span> <strong className="text-sport-navy dark:text-sport-green-bright">{req.details[0]?.courtName || req.notes}</strong></p>
                                <p className="text-[11px]"><span className="text-gray-400">Metode:</span> {req.paymentMethod}</p>
                                <p className="text-[11px]"><span className="text-gray-400">Harga:</span> Rp {req.totalAmount.toLocaleString('id-ID')}</p>
                                <p className="text-[11px]"><span className="text-gray-400">Tanggal:</span> {new Date(req.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>

                              {req.paymentProofUrl && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-400 mb-1 font-mono">Bukti Pembayaran:</p>
                                  <button
                                    onClick={() => setViewingReceiptUrl(req.paymentProofUrl)}
                                    className="w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:opacity-80 transition-opacity"
                                  >
                                    <img 
                                      src={req.paymentProofUrl} 
                                      alt="Bukti Transfer" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </button>
                                </div>
                              )}

                              {isPending && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveBooking(req)}
                                    className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 font-mono"
                                  >
                                    <Check className="w-3 h-3" /> Terima
                                  </button>
                                  <button
                                    onClick={() => handleRejectBooking(req)}
                                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 font-mono"
                                  >
                                    <X className="w-3 h-3" /> Tolak
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* 2. DIRECT USER MEMBERSHIP CONTROL (Mengontrol Membership Pengguna) */}
                <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800/80 lg:pl-8 pt-6 lg:pt-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                      👤 Daftar Pengguna &amp; Kontrol Level Membership
                    </h4>
                    <input
                      type="text"
                      placeholder="Cari nama, email, atau whatsapp..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="px-3.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-sport-dark/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sport-navy dark:focus:ring-sport-green max-w-xs w-full"
                    />
                  </div>

                  {users.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                      <p className="text-xs">Tidak ada data pengguna.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase font-mono">
                            <th className="pb-2 font-semibold">Pengguna</th>
                            <th className="pb-2 font-semibold">Tingkat Member</th>
                            <th className="pb-2 font-semibold">Poin</th>
                            <th className="pb-2 font-semibold">Masa Berlaku</th>
                            <th className="pb-2 font-semibold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs text-gray-800 dark:text-gray-200">
                          {users
                            .filter(u => 
                              u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                              u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                              u.phone.includes(userSearchQuery)
                            )
                            .map((u) => {
                              const isPremium = u.membership && u.membership !== 'regular';
                              return (
                                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-sport-dark/30 transition-colors">
                                  <td className="py-3">
                                    <div className="flex items-center gap-2.5">
                                      <img 
                                        src={u.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                                        alt={u.name} 
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                          {u.name}
                                          {u.role === 'admin' && (
                                            <span className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-mono px-1 rounded">ADMIN</span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono">{u.email}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{u.phone}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                      u.membership === 'gold' 
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                                        : u.membership === 'silver'
                                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-300'
                                          : u.membership === 'bronze'
                                            ? 'bg-amber-700/10 text-amber-700 dark:bg-amber-700/20 dark:text-amber-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-sport-dark dark:text-gray-400'
                                    }`}>
                                      {u.membership || 'REGULAR'}
                                    </span>
                                  </td>
                                  <td className="py-3 font-mono font-bold text-sport-navy dark:text-sport-green">
                                    {u.points.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-3 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                    {isPremium 
                                      ? (u.membershipExpiresAt 
                                          ? new Date(u.membershipExpiresAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                                          : 'Selamanya')
                                      : '-'
                                    }
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => {
                                        setEditingUserForMembership(u);
                                        setTargetUserMembership(u.membership || 'regular');
                                        setTargetUserPoints(u.points || 0);
                                        setTargetUserMembershipExpiresAt(
                                          u.membershipExpiresAt 
                                            ? new Date(u.membershipExpiresAt).toISOString().split('T')[0] 
                                            : ''
                                        );
                                      }}
                                      className="px-2.5 py-1.5 bg-sport-navy hover:bg-sport-navy/90 dark:bg-sport-navy-light dark:hover:bg-sport-navy text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1 shadow-sm font-mono"
                                    >
                                      <Edit className="w-3 h-3" /> Atur Member
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Premium Package Guide / Reference Card */}
            <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 gap-3">
                <h4 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  🛡️ Referensi &amp; Konfigurasi Paket Membership Premium
                </h4>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSettingsSubTab('membership');
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl cursor-pointer transition-all border border-gray-200 dark:border-gray-700"
                >
                  ⚙️ Ubah Benefit &amp; Paket di Pengaturan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {membershipPackagesList.map((pkg) => (
                  <div key={pkg.id} className="p-4 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-sport-dark/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white uppercase">{pkg.name}</h5>
                      <span className="text-xs font-bold text-sport-navy dark:text-sport-green font-mono font-black">Rp {pkg.price.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{pkg.description}</p>
                    <div className="pt-2 text-[10px] text-gray-400 font-mono space-y-1">
                      <p>• Prioritas Booking: H-{pkg.priorityDays} Hari</p>
                      <p>• Diskon Tambahan: {pkg.discountPercent}%</p>
                      <p>• Cashback Koin: {pkg.cashbackMultiplier}x</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2.1 PEMBAYARAN MASUK TAB */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Verifikasi Pembayaran Masuk</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Periksa bukti transfer dan detail booking pengguna untuk menyetujui atau menolak transaksi sewa lapangan.</p>
            </div>

            {payments.filter(p => p.status === 'sedang_diverifikasi').length === 0 ? (
              <div className="py-20 text-center text-gray-400 dark:text-gray-500">
                <span className="text-4xl block mb-2">📥</span>
                <p className="text-xs font-semibold">Tidak ada bukti pembayaran baru yang menunggu verifikasi.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {payments.filter(p => p.status === 'sedang_diverifikasi').map((pay) => {
                  const associatedBooking = bookings.find(b => b.id === pay.bookingId);
                  return (
                    <div 
                      key={pay.id} 
                      className="p-5 bg-gray-50 dark:bg-sport-dark/60 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row gap-6 hover:border-gray-300 dark:hover:border-gray-700 transition"
                    >
                      {/* Left: Booking & Payment info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded font-mono animate-pulse">
                            Sedang Diverifikasi
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Invoice: #{associatedBooking?.invoiceNumber || pay.bookingId}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Payment Transfer details */}
                          <div className="space-y-2 bg-white dark:bg-sport-slate/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-[10px] font-bold uppercase text-gray-400 font-mono tracking-wider">Detail Struk Pengirim</h4>
                            <p className="text-gray-650 dark:text-gray-300">Pengirim: <strong className="text-gray-850 dark:text-white">{pay.senderName}</strong></p>
                            <p className="text-gray-650 dark:text-gray-300">Bank Asal: <strong className="text-gray-850 dark:text-white font-mono uppercase">{pay.senderBank}</strong></p>
                            <p className="text-gray-650 dark:text-gray-300">Nominal Transfer: <strong className="text-sport-navy dark:text-sport-green font-mono font-black text-sm">Rp {pay.amountTransfer.toLocaleString('id-ID')}</strong></p>
                            <p className="text-gray-650 dark:text-gray-300">Waktu: <span className="font-mono">{pay.transferDate} | {pay.transferTime}</span></p>
                            {pay.notes && <p className="text-gray-500 italic">Catatan: "{pay.notes}"</p>}
                          </div>

                          {/* Target Booking Details */}
                          <div className="space-y-2 bg-white dark:bg-sport-slate/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-[10px] font-bold uppercase text-gray-400 font-mono tracking-wider">Detail Penyewaan Lapangan</h4>
                            {associatedBooking ? (
                              <>
                                <p className="text-gray-650 dark:text-gray-300">Penyewa: <strong className="text-gray-850 dark:text-white">{associatedBooking.userName}</strong> ({associatedBooking.userPhone})</p>
                                <p className="text-gray-650 dark:text-gray-300">Kategori: <span className="font-semibold uppercase">{associatedBooking.courtCategory}</span></p>
                                <p className="text-gray-650 dark:text-gray-300">Total Tagihan: <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">Rp {associatedBooking.finalAmount.toLocaleString('id-ID')}</span></p>
                                <div className="mt-2 pl-2 border-l border-sport-navy/20 dark:border-sport-green/30 space-y-0.5 text-[11px] text-gray-500">
                                  {associatedBooking.details.map((d, i) => (
                                    <p key={i}>• {d.courtName} ({d.date} | {d.timeSlot})</p>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-red-500 italic">Data booking sewa terkait tidak ditemukan.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions and zoom proof */}
                      <div className="w-full xl:w-72 flex flex-col justify-between gap-4 border-t xl:border-t-0 xl:border-l border-gray-100 dark:border-gray-800 xl:pt-0 xl:pl-6 pt-4 shrink-0">
                        {/* Struk image banner preview */}
                        {pay.paymentProofUrl ? (
                          <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 h-32 bg-gray-100 dark:bg-sport-dark/50 flex items-center justify-center">
                            <img src={pay.paymentProofUrl} alt="payment receipt proof" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button 
                                onClick={() => setViewingReceiptUrl(pay.paymentProofUrl || null)}
                                className="px-3 py-1.5 bg-white text-sport-navy rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                              >
                                <Eye className="w-3.5 h-3.5" /> Lihat Perbesar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-100 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-red-500 text-xs font-semibold">
                            Tanpa Lampiran Bukti
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleVerifyPaymentProof(pay.bookingId, 'pembayaran_diterima')}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> Setujui Pembayaran (Approve)
                          </button>
                          
                          <button 
                            onClick={() => {
                              setRejectingPaymentId(rejectingPaymentId === pay.id ? null : pay.id);
                              setRejectionInput('');
                            }}
                            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <X className="w-4 h-4" /> Tolak Pembayaran (Reject)
                          </button>

                          {/* Rejection Form inside payment card */}
                          {rejectingPaymentId === pay.id && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 space-y-2 animate-in slide-in-from-top duration-250 mt-2">
                              <label className="block text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Alasan Penolakan (Wajib)</label>
                              <textarea 
                                value={rejectionInput} 
                                onChange={e => setRejectionInput(e.target.value)} 
                                placeholder="Masukkan alasan, misal: Bukti transfer tidak terbaca / tidak valid." 
                                required
                                rows={2}
                                className="w-full p-2 bg-white dark:bg-sport-dark text-xs rounded border border-red-200 dark:border-red-900/60 focus:outline-none text-gray-850 dark:text-white resize-none"
                              />
                              <button 
                                onClick={() => {
                                  if (!rejectionInput.trim()) {
                                    alert('Alasan penolakan wajib diisi!');
                                    return;
                                  }
                                  handleVerifyPaymentProof(pay.bookingId, 'pembayaran_ditolak', rejectionInput);
                                }}
                                className="w-full py-1.5 bg-red-700 hover:bg-red-650 text-white font-bold text-[10px] rounded uppercase transition"
                              >
                                Konfirmasi Tolak Transaksi
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2.2 RIWAYAT PEMBAYARAN TAB */}
        {activeTab === 'paymentsHistory' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Laporan Riwayat Pembayaran (Keuangan)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laporan komprehensif atas verifikasi seluruh pembayaran sukses dan penolakan transaksi transfer.</p>
              </div>
              <div className="text-xs bg-sport-navy/5 dark:bg-sport-navy/20 px-3 py-1.5 rounded-lg border border-sport-navy/10 font-bold text-sport-navy dark:text-sport-green font-mono shrink-0">
                Selesai: {payments.filter(p => p.status === 'berhasil' || p.status === 'pembayaran_diterima' || p.status === 'gagal' || p.status === 'pembayaran_ditolak').length} Transaksi
              </div>
            </div>

            {/* Financial Summary Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-green-600 dark:text-green-400 block uppercase font-mono font-bold tracking-wider">Total Pendapatan Terverifikasi</span>
                  <span className="text-xl font-mono font-black text-green-700 dark:text-green-400 mt-1 block">
                    Rp {payments.filter(p => p.status === 'berhasil' || p.status === 'pembayaran_diterima').reduce((sum, p) => sum + p.amountTransfer, 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><DollarSign className="w-5 h-5" /></div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-600 dark:text-red-400 block uppercase font-mono font-bold tracking-wider">Total Transaksi Ditolak (Gagal)</span>
                  <span className="text-xl font-mono font-black text-red-700 dark:text-red-400 mt-1 block">
                    {payments.filter(p => p.status === 'gagal' || p.status === 'pembayaran_ditolak').length} Transaksi Gagal
                  </span>
                </div>
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><X className="w-5 h-5" /></div>
              </div>
            </div>

            {/* Payments Table */}
            {payments.filter(p => p.status === 'berhasil' || p.status === 'pembayaran_diterima' || p.status === 'gagal' || p.status === 'pembayaran_ditolak').length === 0 ? (
              <p className="text-xs text-center py-12 text-gray-400">Belum ada riwayat transaksi pembayaran.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-gray-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-sport-dark text-gray-500 font-bold border-b border-gray-250 dark:border-gray-800">
                      <th className="p-3.5 font-mono">Invoice ID</th>
                      <th className="p-3.5">Nama Pengirim</th>
                      <th className="p-3.5 font-mono">Bank Asal</th>
                      <th className="p-3.5 font-mono">Nominal</th>
                      <th className="p-3.5 font-mono">Tanggal Transfer</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                    {payments.filter(p => p.status === 'berhasil' || p.status === 'pembayaran_diterima' || p.status === 'gagal' || p.status === 'pembayaran_ditolak').map((pay) => {
                      const associatedBooking = bookings.find(b => b.id === pay.bookingId);
                      return (
                        <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-sport-dark/20 text-gray-700 dark:text-gray-300">
                          <td className="p-3.5 font-mono font-bold text-gray-900 dark:text-white">
                            #{associatedBooking?.invoiceNumber || 'INV-EXPIRED'}
                          </td>
                          <td className="p-3.5">
                            <div>
                              <p className="font-semibold text-gray-850 dark:text-white">{pay.senderName}</p>
                              {pay.notes && <p className="text-[10px] text-gray-400 italic">"{pay.notes}"</p>}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono uppercase font-semibold">{pay.senderBank}</td>
                          <td className="p-3.5 font-mono font-bold text-gray-950 dark:text-white">
                            Rp {pay.amountTransfer.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 font-mono">{pay.transferDate} • {pay.transferTime}</td>
                          <td className="p-3.5">
                            {pay.status === 'berhasil' || pay.status === 'pembayaran_diterima' ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 rounded text-[10px] font-bold uppercase">
                                BERHASIL
                              </span>
                            ) : (
                              <div>
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 rounded text-[10px] font-bold uppercase">
                                  GAGAL / DITOLAK
                                </span>
                                {pay.rejectionReason && (
                                  <p className="text-[10px] text-red-500 font-semibold mt-1">Alasan: "{pay.rejectionReason}"</p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {pay.paymentProofUrl && (
                              <button 
                                onClick={() => setViewingReceiptUrl(pay.paymentProofUrl || null)}
                                className="px-2.5 py-1 bg-gray-150 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-[10px] rounded font-bold transition border border-transparent dark:border-gray-750"
                              >
                                Lihat Struk
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2.3 LOG PEMBAYARAN TAB */}
        {activeTab === 'paymentLogs' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Audit Log Pembayaran (Keuangan)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jejak audit otomatis sistem untuk setiap status pengunggahan, persetujuan, penolakan, dan perubahan keuangan.</p>
            </div>

            {paymentLogsList.length === 0 ? (
              <p className="text-xs text-center py-12 text-gray-400">Belum ada catatan log aktivitas keuangan.</p>
            ) : (
              <div className="space-y-4">
                {paymentLogsList
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((log) => {
                    const isSuccess = log.action === 'APPROVED';
                    const isReject = log.action === 'REJECTED';
                    const isUpload = log.action === 'SUBMITTED';

                    let iconBg = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
                    let actionText = log.action;
                    if (isSuccess) {
                      iconBg = 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400';
                      actionText = 'Disetujui';
                    } else if (isReject) {
                      iconBg = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
                      actionText = 'Ditolak';
                    } else if (isUpload) {
                      iconBg = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                      actionText = 'Kirim Bukti';
                    }

                    return (
                      <div key={log.id} className="p-4 bg-gray-50 dark:bg-sport-dark/60 rounded-xl border border-gray-200 dark:border-gray-800 flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${iconBg} shrink-0 text-xs font-bold font-mono`}>
                          {actionText}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-850 dark:text-white leading-relaxed">{log.message}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-mono">
                            <span>Oleh: <strong className="text-gray-500 dark:text-gray-400">{log.operatorName}</strong></span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 2.5 KELOLA JADWAL & SLOT TAB */}
        {activeTab === 'schedules' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Pengaturan Jadwal & Ketersediaan Slot</h3>
              <p className="text-xs text-gray-500 mt-1">Atur ketersediaan jam sewa secara real-time. Anda bisa membuka slot, mengunci slot untuk maintenance, atau menandai slot sebagai dipesan offline.</p>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-sport-dark/40 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Pilih Lapangan:</label>
                <select
                  value={selectedSchedCourt}
                  onChange={(e) => setSelectedSchedCourt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-850 dark:text-white focus:outline-none focus:border-sport-navy"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id} className="dark:bg-sport-slate">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Pilih Tanggal:</label>
                <input
                  type="date"
                  value={selectedSchedDate}
                  onChange={(e) => setSelectedSchedDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-850 dark:text-white focus:outline-none focus:border-sport-navy"
                />
              </div>
            </div>

            {/* Slots display */}
            {loadingSchedules ? (
              <div className="py-20 text-center text-xs text-gray-400">Loading ketersediaan slot...</div>
            ) : scheduleSlots.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400">Tidak ada slot jadwal yang digenerate untuk tanggal ini.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleSlots.map((slot) => {
                  let statusBg = '';
                  let statusText = '';
                  let statusColor = '';

                  if (slot.status === 'tersedia') {
                    statusBg = 'bg-green-50/50 dark:bg-green-950/10 border-green-200/60 dark:border-green-900/40';
                    statusText = 'Tersedia';
                    statusColor = 'text-green-600 dark:text-green-400';
                  } else if (slot.status === 'dipesan') {
                    statusBg = 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/60 dark:border-blue-900/40';
                    statusText = 'Dipesan (Booked)';
                    statusColor = 'text-blue-600 dark:text-blue-400';
                  } else if (slot.status === 'terkunci') {
                    statusBg = 'bg-red-50/50 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/40';
                    statusText = 'Terkunci (Maint)';
                    statusColor = 'text-red-600 dark:text-red-400';
                  }

                  return (
                    <div 
                      key={slot.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${statusBg} transition-all`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{slot.timeSlot}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor} bg-white dark:bg-sport-slate border border-gray-100 dark:border-gray-800`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Harga Sewa:</span>
                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">Rp {slot.price.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex gap-2 border-t border-dashed border-gray-100 dark:border-gray-800/50 pt-2.5 mt-1">
                        {slot.status !== 'tersedia' && (
                          <button
                            onClick={() => handleUpdateSlotStatus(slot.timeSlot, 'tersedia')}
                            className="flex-1 py-1 bg-green-500 hover:bg-green-400 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Set Tersedia
                          </button>
                        )}
                        {slot.status !== 'dipesan' && (
                          <button
                            onClick={() => handleUpdateSlotStatus(slot.timeSlot, 'dipesan')}
                            className="flex-1 py-1 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Set Dipesan
                          </button>
                        )}
                        {slot.status !== 'terkunci' && (
                          <button
                            onClick={() => handleUpdateSlotStatus(slot.timeSlot, 'terkunci')}
                            className="flex-1 py-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Kunci Slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. KELOLA LAPANGAN TAB */}
        {activeTab === 'courts' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Controls */}
            <div className="flex justify-between items-center bg-white dark:bg-sport-slate p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500 font-mono uppercase">Kelola Katalog Arena</span>
              {!isAddingCourt && !editingCourt && (
                <button
                  onClick={() => {
                    setIsAddingCourt(true);
                    setCourtName('');
                    setCourtType('Vinyl');
                    setCourtPrice(120000);
                    setCourtSize('38m x 18m');
                    setCourtDesc('');
                    setCourtImage('');
                  }}
                  className="px-4 py-2 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl text-xs font-bold shadow-md hover:bg-sport-navy-light flex items-center gap-1 hover:scale-105 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Lapangan Baru
                </button>
              )}
            </div>

            {/* Field Form */}
            {(isAddingCourt || editingCourt) && (
              <form onSubmit={handleSaveCourt} className="bg-white dark:bg-sport-slate p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md flex flex-col gap-4">
                <h4 className="font-bold text-sm text-gray-800 dark:text-white uppercase font-mono tracking-wider">
                  {editingCourt ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Nama Lapangan:</label>
                    <input 
                      type="text" 
                      value={courtName}
                      onChange={(e) => setCourtName(e.target.value)}
                      required
                      placeholder="e.g. Lapangan Futsal Premium C"
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Kategori:</label>
                    <input 
                      type="text" 
                      value="Futsal" 
                      disabled 
                      className="w-full bg-gray-100 dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Jenis Lantai / Tipe:</label>
                    <input 
                      type="text" 
                      value={courtType}
                      onChange={(e) => setCourtType(e.target.value)}
                      required
                      placeholder="e.g. Vinyl, Interlock, Pasir"
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Ukuran / Dimensi:</label>
                    <input 
                      type="text" 
                      value={courtSize}
                      onChange={(e) => setCourtSize(e.target.value)}
                      required
                      placeholder="e.g. 38m x 18m"
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Tarif Sewa Per Jam (Rp):</label>
                    <input 
                      type="number" 
                      value={courtPrice}
                      onChange={(e) => setCourtPrice(Number(e.target.value))}
                      required
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                 <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2">Foto Lapangan:</label>
                  <div className="flex flex-col gap-3">
                    {!courtImage ? (
                      <label className="flex flex-col items-center justify-center gap-2 h-36 bg-gray-50/50 dark:bg-sport-dark/50 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-sport-navy dark:hover:border-sport-green rounded-2xl cursor-pointer transition-all duration-200 group">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-sport-navy dark:group-hover:text-sport-green group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {isUploading ? 'Sedang mengunggah...' : 'Klik untuk mengunggah foto lapangan'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Format PNG, JPG, JPEG maks. 5MB</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={isUploading}
                          className="hidden" 
                        />
                      </label>
                    ) : (
                      <div className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 h-44 bg-gray-50 dark:bg-sport-dark">
                        <img src={courtImage} alt="preview" className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5 text-sport-navy" />
                            <span>{isUploading ? 'Mengunggah...' : 'Ganti Foto'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              disabled={isUploading}
                              className="hidden" 
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setCourtImage('')}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Deskripsi Lapangan:</label>
                  <textarea 
                    value={courtDesc}
                    onChange={(e) => setCourtDesc(e.target.value)}
                    required
                    placeholder="Tulis deskripsi keunggulan lapangan..."
                    className="w-full h-20 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCourt(false);
                      setEditingCourt(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Simpan Lapangan
                  </button>
                </div>
              </form>
            )}

            {/* Catalogue list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((c) => (
                <div 
                  key={c.id}
                  className="bg-white dark:bg-sport-slate rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md p-4 flex flex-col justify-between"
                >
                  <div className="flex gap-3 items-start">
                    <img src={c.image} className="w-16 h-12 rounded-lg object-cover shrink-0" alt="court" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{c.name}</h4>
                      <span className="text-[9px] bg-sport-navy/10 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green px-2 py-0.5 rounded uppercase font-bold tracking-wider mt-1 inline-block">
                        {c.category} • {c.courtType}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 block mt-1.5">Rp {c.price.toLocaleString('id-ID')}/Jam</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-3.5 flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setEditingCourt(c);
                        setCourtName(c.name);
                        setCourtCategory(c.category);
                        setCourtType(c.courtType);
                        setCourtPrice(c.price);
                        setCourtSize(c.size);
                        setCourtDesc(c.description);
                        setCourtImage(c.image);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourt(c.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 4. KELOLA VOUCHER TAB */}
        {activeTab === 'vouchers' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kelola Voucher Promo</h3>
              {!isAddingVoucher && (
                <button
                  onClick={() => setIsAddingVoucher(true)}
                  className="px-4 py-2 bg-sport-navy dark:bg-sport-navy-light text-white rounded-xl text-xs font-bold shadow-md hover:bg-sport-navy-light flex items-center gap-1 hover:scale-105 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Voucher
                </button>
              )}
            </div>

            {isAddingVoucher && (
              <form onSubmit={handleAddVoucher} className="p-4 bg-gray-50 dark:bg-sport-dark rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">Tambah Kupon Baru</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Kode Voucher:</label>
                    <input 
                      type="text" 
                      value={vCode}
                      onChange={(e) => setVCode(e.target.value)}
                      required
                      placeholder="e.g. UTMLUNAS"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Nilai Potongan (Rp):</label>
                    <input 
                      type="number" 
                      value={vValue}
                      onChange={(e) => setVValue(Number(e.target.value))}
                      required
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Min. Belanja (Rp):</label>
                    <input 
                      type="number" 
                      value={vMin}
                      onChange={(e) => setVMin(Number(e.target.value))}
                      required
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Deskripsi Voucher:</label>
                  <input 
                    type="text" 
                    value={vDesc}
                    onChange={(e) => setVDesc(e.target.value)}
                    required
                    placeholder="e.g. Potongan flat Rp 20.000 untuk pengguna baru."
                    className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200/60 dark:border-gray-800 pt-3">
                  <button type="button" onClick={() => setIsAddingVoucher(false)} className="px-4 py-2 bg-white dark:bg-sport-slate hover:bg-gray-100 text-xs rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-sport-green text-sport-dark text-xs font-extrabold rounded-lg cursor-pointer">Aktifkan Voucher</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((v) => (
                <div key={v.id} className="p-4 bg-gray-50 dark:bg-sport-dark/50 rounded-xl border border-gray-200/60 dark:border-gray-800/80 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-sm font-black font-mono text-sport-navy dark:text-sport-green-bright bg-sport-navy/5 dark:bg-sport-green/10 px-2 py-0.5 rounded">{v.code}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{v.description}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Min. Pembelian: Rp {v.minPurchase.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="text-xs font-extrabold text-red-500 font-mono shrink-0">-Rp {v.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 5. AUDIT LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Audit Log Aktivitas Sistem</h3>

            <div className="max-h-96 overflow-y-auto space-y-2.5 pr-2 font-mono text-xs">
              {logs.slice().reverse().map((lg) => (
                <div key={lg.id} className="p-3 bg-gray-50 dark:bg-sport-dark/50 rounded-lg border border-gray-200/50 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between text-[11px] gap-2">
                  <div className="space-y-1">
                    <p><span className="text-blue-500 font-bold">[{lg.action}]</span> <span className="text-gray-400">By:</span> <strong className="text-gray-700 dark:text-gray-300">{lg.userEmail}</strong></p>
                    <p className="text-gray-500 leading-normal">{lg.details}</p>
                  </div>
                  <span className="text-gray-400 shrink-0 self-end sm:self-start">
                    {new Date(lg.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SETTINGS & CMS TAB */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800/80 animate-in fade-in duration-300 flex flex-col gap-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">CMS & Pengaturan Website</h3>
              <p className="text-xs text-gray-400 mt-1">Kelola konten halaman depan, menu navigasi, list fasilitas keunggulan, review testimoni, dan database internal.</p>
            </div>

            {/* CMS Sub-Tabs Navigation */}
            <div className="flex flex-wrap gap-1.5 bg-gray-50 dark:bg-sport-dark/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
                {[
                { id: 'general', label: 'Umum & Branding' },
                { id: 'menus', label: 'Menu Navigasi' },
                { id: 'facilities', label: 'Keunggulan/Fasilitas' },
                { id: 'testimonials', label: 'Testimonial Customer' },
                { id: 'galeri', label: 'Galeri Foto UTM' },
                { id: 'membership', label: 'Paket Membership' },
                { id: 'database', label: 'Sistem & Database' },
                { id: 'profile', label: 'Profil Saya' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSettingsSubTab(sub.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    settingsSubTab === sub.id
                      ? 'bg-white dark:bg-sport-slate text-sport-navy dark:text-sport-green shadow-sm border border-gray-100 dark:border-gray-800'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* A. GENERAL & BRANDING SUB-TAB */}
            {settingsSubTab === 'general' && (
              <form onSubmit={handleUpdateSettings} className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">1. Informasi Identitas</h4>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">Nama Brand Website (Navbar Logo):</label>
                      <input 
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">URL Logo Kustom (Optional):</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="e.g. /favicon.ico"
                          className="flex-1 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                        />
                        <label className="px-4 py-2 bg-gray-100 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" /> Upload Logo
                          <input type="file" accept="image/*" onChange={(e) => handleCMSImageUpload(e, 'logo')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">Running Marquee Text (Berjalan):</label>
                      <input 
                        type="text" 
                        value={marqueeText}
                        onChange={(e) => setMarqueeText(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">2. Konten Hero Banner</h4>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">Judul Hero Banner Depan:</label>
                      <input 
                        type="text" 
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">Sub-judul Hero Banner Depan:</label>
                      <input 
                        type="text" 
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-1">URL Background Image Hero:</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={heroImageUrl}
                          onChange={(e) => setHeroImageUrl(e.target.value)}
                          required
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                        />
                        <label className="px-4 py-2 bg-gray-100 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" /> Ganti Background
                          <input type="file" accept="image/*" onChange={(e) => handleCMSImageUpload(e, 'hero')} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 dark:border-gray-800 pt-5">
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono mb-3">3. Kontak, Footer & Google Maps</h4>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">No. WhatsApp Pelanggan:</label>
                    <input 
                      type="text" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Email Layanan:</label>
                    <input 
                      type="email" 
                      value={emailContact}
                      onChange={(e) => setEmailContact(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Kota & Provinsi:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={contactCity}
                        onChange={(e) => setContactCity(e.target.value)}
                        placeholder="Kota Mataram"
                        className="w-1/2 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                      <input 
                        type="text" 
                        value={contactProvince}
                        onChange={(e) => setContactProvince(e.target.value)}
                        placeholder="Nusa Tenggara Barat"
                        className="w-1/2 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 block mb-1">Alamat Kantor / Koordinat Fisik:</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full h-20 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-gray-400 block mb-1">Copyright Footer Text:</label>
                    <input 
                      type="text" 
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      placeholder="© 2026 UTM Sport Center. All rights reserved."
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-400 block mb-1">URL Google Maps Iframe Embed:</label>
                    <input 
                      type="text" 
                      value={locationMapsUrl}
                      onChange={(e) => setLocationMapsUrl(e.target.value)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono text-[10px]"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-dark font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    Simpan Perubahan Branding
                  </button>
                </div>
              </form>
            )}

            {/* B. MENU NAVIGATION MANAGER SUB-TAB */}
            {settingsSubTab === 'menus' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {/* Left pane: menu list */}
                <div className="lg:col-span-2 border border-gray-100 dark:border-gray-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">Daftar Link Navigasi</h4>
                  <div className="space-y-2">
                    {menusList.length === 0 ? (
                      <p className="text-xs text-gray-400">Belum ada menu navigasi terdaftar.</p>
                    ) : (
                      menusList.slice().sort((a,b)=> a.order - b.order).map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-sport-dark/40 border border-gray-200/50 dark:border-gray-800 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-gray-800 dark:text-white">{item.label}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-mono text-gray-400">View: {item.view}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-gray-400">Urutan: {item.order}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMenu(item);
                                setMenuLabel(item.label);
                                setMenuView(item.view);
                                setMenuOrder(item.order);
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                              title="Edit Menu"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(item.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                              title="Hapus Menu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right pane: form */}
                <form onSubmit={handleSaveMenu} className="bg-gray-50 dark:bg-sport-dark/30 border border-gray-200/60 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">
                    {editingMenu ? 'Edit Menu Navigasi' : 'Tambah Menu Navigasi'}
                  </h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Label Menu (Nama di Navbar):</label>
                    <input 
                      type="text" 
                      value={menuLabel}
                      onChange={(e) => setMenuLabel(e.target.value)}
                      required
                      placeholder="e.g. Turnamen"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Halaman (View):</label>
                    <select
                      value={menuView}
                      onChange={(e) => setMenuView(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    >
                      <option value="">-- Pilih Halaman --</option>
                      <option value="home">Beranda Utama</option>
                      <option value="lapangan">Pilihan Lapangan</option>
                      <option value="booking">Sewa Lapangan</option>
                      <option value="faq">FAQ / Pertanyaan</option>
                      <option value="turnamen">Pusat Turnamen</option>
                      <option value="galeri">Galeri Foto</option>
                      <option value="kontak">Hubungi Kami</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">No. Urutan Tampil (Order):</label>
                    <input 
                      type="number" 
                      value={menuOrder}
                      onChange={(e) => setMenuOrder(Number(e.target.value))}
                      required
                      min="1"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800">
                    {editingMenu && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMenu(null);
                          setMenuLabel('');
                          setMenuView('');
                          setMenuOrder(1);
                        }}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-dark text-xs font-extrabold rounded-lg cursor-pointer"
                    >
                      {editingMenu ? 'Simpan' : 'Tambah Menu'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* C. FACILITIES (KEUNGGULAN) MANAGER SUB-TAB */}
            {settingsSubTab === 'facilities' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {/* Left pane */}
                <div className="lg:col-span-2 border border-gray-100 dark:border-gray-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">Keunggulan Lapangan UTM</h4>
                  <div className="space-y-3">
                    {facilitiesList.length === 0 ? (
                      <p className="text-xs text-gray-400">Belum ada keunggulan terdaftar.</p>
                    ) : (
                      facilitiesList.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-sport-dark/40 border border-gray-200/50 dark:border-gray-800 rounded-xl flex justify-between items-center text-xs gap-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-sport-navy/5 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green rounded-lg text-sm font-extrabold font-mono uppercase tracking-tight">
                              {item.icon === 'CheckCircle' ? '✓' : item.icon === 'Clock' ? '🕒' : item.icon === 'Star' ? '⭐' : '⚽'}
                            </span>
                            <div>
                              <strong className="text-gray-800 dark:text-white">{item.name}</strong>
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingFacility(item);
                                setFacilityName(item.name);
                                setFacilityDesc(item.description);
                                setFacilityIcon(item.icon);
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFacility(item.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right pane */}
                <form onSubmit={handleSaveFacility} className="bg-gray-50 dark:bg-sport-dark/30 border border-gray-200/60 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">
                    {editingFacility ? 'Edit Keunggulan' : 'Tambah Keunggulan'}
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Nama Keunggulan:</label>
                    <input 
                      type="text" 
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      required
                      placeholder="e.g. Lapangan Standar FIFA"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Deskripsi:</label>
                    <textarea 
                      value={facilityDesc}
                      onChange={(e) => setFacilityDesc(e.target.value)}
                      required
                      placeholder="e.g. Menggunakan material Vinyl & rumput sintetis premium internasional."
                      className="w-full h-20 bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Gaya Icon:</label>
                    <select
                      value={facilityIcon}
                      onChange={(e) => setFacilityIcon(e.target.value)}
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    >
                      <option value="CheckCircle">Checklist Hijau</option>
                      <option value="Clock">Jam Operasional 24 Jam</option>
                      <option value="Star">Bintang Rating Utama</option>
                      <option value="Soccer">Soccer Bola Futsal</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800">
                    {editingFacility && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFacility(null);
                          setFacilityName('');
                          setFacilityDesc('');
                          setFacilityIcon('CheckCircle');
                        }}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-dark text-xs font-extrabold rounded-lg cursor-pointer"
                    >
                      {editingFacility ? 'Simpan' : 'Tambah Keunggulan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* D. TESTIMONIALS MANAGER SUB-TAB */}
            {settingsSubTab === 'testimonials' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {/* Left pane */}
                <div className="lg:col-span-2 border border-gray-100 dark:border-gray-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">Review & Testimonial Pelanggan</h4>
                  <div className="space-y-3">
                    {testimonialsList.length === 0 ? (
                      <p className="text-xs text-gray-400">Belum ada testimonial pelanggan.</p>
                    ) : (
                      testimonialsList.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-sport-dark/40 border border-gray-200/50 dark:border-gray-800 rounded-xl flex justify-between items-center text-xs gap-4">
                          <div className="flex items-start gap-3">
                            <img src={item.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700" referrerPolicy="no-referrer" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-gray-800 dark:text-white">{item.name}</span>
                                <span className="text-[10px] text-gray-400">({item.role})</span>
                              </div>
                              <p className="text-[11px] text-gray-400 italic mt-0.5">"{item.message}"</p>
                              <div className="flex gap-0.5 mt-1">
                                {Array.from({ length: item.rating }).map((_, i) => (
                                  <span key={i} className="text-yellow-500 text-[10px]">★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingTestimonial(item);
                                setTestimonialName(item.name);
                                setTestimonialRole(item.role);
                                setTestimonialMessage(item.message);
                                setTestimonialRating(item.rating);
                                setTestimonialAvatar(item.avatar);
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(item.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right pane */}
                <form onSubmit={handleSaveTestimonial} className="bg-gray-50 dark:bg-sport-dark/30 border border-gray-200/60 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">
                    {editingTestimonial ? 'Edit Testimonial' : 'Tambah Testimonial'}
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Nama Pelanggan:</label>
                    <input 
                      type="text" 
                      value={testimonialName}
                      onChange={(e) => setTestimonialName(e.target.value)}
                      required
                      placeholder="e.g. Budi Santoso"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Role / Jabatan:</label>
                    <input 
                      type="text" 
                      value={testimonialRole}
                      onChange={(e) => setTestimonialRole(e.target.value)}
                      required
                      placeholder="e.g. Tim Kapten FC Mataram"
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Pesan Testimonial:</label>
                    <textarea 
                      value={testimonialMessage}
                      onChange={(e) => setTestimonialMessage(e.target.value)}
                      required
                      placeholder="e.g. Tempat sewa lapangan futsal ternyaman & paling premium di Mataram!"
                      className="w-full h-20 bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Rating Bintang:</label>
                    <select
                      value={testimonialRating}
                      onChange={(e) => setTestimonialRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Bintang</option>
                      <option value="4">⭐⭐⭐⭐ 4 Bintang</option>
                      <option value="3">⭐⭐⭐ 3 Bintang</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Foto Profile Avatar:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={testimonialAvatar}
                        onChange={(e) => setTestimonialAvatar(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                      <label className="px-3 py-2 bg-gray-100 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                        <Upload className="w-3 h-3" /> Upload
                        <input type="file" accept="image/*" onChange={(e) => handleCMSImageUpload(e, 'avatar')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800">
                    {editingTestimonial && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonial(null);
                          setTestimonialName('');
                          setTestimonialRole('');
                          setTestimonialMessage('');
                          setTestimonialRating(5);
                          setTestimonialAvatar('');
                        }}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-dark text-xs font-extrabold rounded-lg cursor-pointer"
                    >
                      {editingTestimonial ? 'Simpan' : 'Tambah Testimonial'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* G. GALERI FOTO UTM SUB-TAB */}
            {settingsSubTab === 'galeri' && (
              <div className="animate-in fade-in duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Gallery List */}
                  <div className="lg:col-span-2 border border-gray-100 dark:border-gray-800 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                      <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">
                        📸 Dokumentasi Galeri Foto UTM Arena
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-100 dark:bg-sport-dark px-2 py-1 rounded-lg">
                        Total: {galleryList.length} Foto
                      </span>
                    </div>

                    {galleryList.length === 0 ? (
                      <div className="py-16 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-sport-dark/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <span className="text-4xl block mb-2">🖼️</span>
                        <p className="text-xs font-semibold">Belum ada foto galeri UTM.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Silakan upload foto dokumentasi menggunakan form di samping.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {galleryList.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-gray-50 dark:bg-sport-dark/40 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group hover:border-sport-navy/40 dark:hover:border-sport-green/40 transition-all duration-200"
                          >
                            <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-sport-dark">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleEditGalleryItem(item)}
                                    className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-sport-navy rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md"
                                  >
                                    <Edit className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGalleryItem(item.id)}
                                    className="px-2.5 py-1.5 bg-red-600/95 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md"
                                  >
                                    <Trash2 className="w-3 h-3" /> Hapus
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-bold text-xs text-gray-800 dark:text-white leading-tight line-clamp-2">{item.title}</h5>
                                <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sport-navy/10 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green">
                                  {item.category === 'fasilitas' ? 'Fasilitas' : item.category === 'event' ? 'Event' : 'Lainnya'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Add/Edit Form */}
                  <form onSubmit={handleSaveGalleryItem} className="bg-gray-50 dark:bg-sport-dark/30 border border-gray-200/60 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-4 h-fit sticky top-4">
                    <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">
                      {editingGalleryItem ? '✏️ Edit Foto Galeri' : '➕ Tambah Foto Baru'}
                    </h4>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Judul Foto / Keterangan:</label>
                      <input 
                        type="text" 
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        required
                        placeholder="e.g. Grand Opening UTM Sport Center"
                        className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Kategori Galeri:</label>
                      <select
                        value={galleryCategory}
                        onChange={(e) => setGalleryCategory(e.target.value)}
                        className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                      >
                        <option value="fasilitas">🏟️ Fasilitas</option>
                        <option value="event">🎉 Event</option>
                        <option value="lainnya">📷 Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-2">Upload / URL Foto Galeri:</label>
                      <div className="flex flex-col gap-3">
                        {/* Image preview */}
                        {galleryImageUrl ? (
                          <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-36 bg-gray-100 dark:bg-sport-dark">
                            <img 
                              src={galleryImageUrl} 
                              alt="preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-[10px] font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all">
                                <Upload className="w-3 h-3" />
                                <span>{isUploadingGalleryImage ? 'Uploading...' : 'Ganti Foto'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleGalleryImageUpload}
                                  disabled={isUploadingGalleryImage}
                                  className="hidden" 
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setGalleryImageUrl('')}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 h-28 bg-white dark:bg-sport-slate border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-sport-navy dark:hover:border-sport-green rounded-xl cursor-pointer transition-all duration-200 group">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-sport-navy dark:group-hover:text-sport-green group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                {isUploadingGalleryImage ? 'Sedang mengunggah...' : 'Klik untuk upload foto galeri'}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-0.5">PNG, JPG, JPEG maks. 5MB</p>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleGalleryImageUpload}
                              disabled={isUploadingGalleryImage}
                              className="hidden" 
                            />
                          </label>
                        )}
                        
                        {/* OR divider */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                          <span className="text-[10px] text-gray-400 font-bold uppercase">ATAU</span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        </div>

                        {/* Manual URL input */}
                        <input 
                          type="text" 
                          value={galleryImageUrl}
                          onChange={(e) => setGalleryImageUrl(e.target.value)}
                          placeholder="Atau masukkan URL gambar langsung..."
                          className="w-full bg-white dark:bg-sport-slate border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800 mt-2">
                      {editingGalleryItem && (
                        <button
                          type="button"
                          onClick={resetGalleryForm}
                          className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition-all"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!galleryImageUrl}
                        className="flex-1 py-2 bg-sport-navy dark:bg-sport-green text-white dark:text-sport-dark text-xs font-extrabold rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {editingGalleryItem ? 'Simpan Perubahan' : 'Tambah ke Galeri'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* E. DATABASE SYSTEM / BACKUP & RESTORE */}
            {settingsSubTab === 'database' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs flex flex-col gap-2">
                  <h4 className="font-extrabold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider font-mono">Dukungan Sistem Basis Data XAMPP (Localhost)</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Sistem Booking Lapangan Futsal ini dilengkapi dengan generator SQL otomatis. Database relasional MySQL yang siap di-import langsung ke <strong>phpMyAdmin (XAMPP)</strong> dapat diunduh kapan saja menggunakan tombol ekspor backup di bagian atas dasbor admin.
                  </p>
                </div>

                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h4 className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono flex items-center gap-2 justify-center md:justify-start">
                      <ShieldAlert className="w-5 h-5 text-red-500" /> Restorasi Database (Reset Pabrik)
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 max-w-xl">
                      Mereset seluruh basis data di dalam file <code>data/db.json</code> kembali ke kondisi bawaan awal (default seed data). Seluruh order sewa buatan baru, user tambahan, dan log aktivitas akan dibersihkan kembali ke data awal untuk tujuan demonstrasi/testing.
                    </p>
                  </div>

                  <button
                    onClick={handleRestoreDatabase}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-slow" /> Reset Total Database
                  </button>
                </div>
              </div>
            )}

            {/* E. MEMBERSHIP PACKAGES SUB-TAB */}
            {settingsSubTab === 'membership' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">Kelola Paket Membership Premium</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Lakukan penambahan, pembaruan, atau penghapusan tingkatan paket membership premium beserta konfigurasi benefitnya.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: List of Packages */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-bold text-sm text-gray-800 dark:text-white mb-2">Daftar Paket Membership Aktif</h5>
                    {membershipPackagesList.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 dark:bg-sport-dark/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs">
                        Tidak ada paket membership terdaftar. Silakan buat paket baru menggunakan form di sebelah kanan.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {membershipPackagesList.map((pkg) => (
                          <div 
                            key={pkg.id} 
                            className="bg-gray-50 dark:bg-sport-dark/40 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-sport-green/50 dark:hover:border-sport-green/40 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-base text-gray-900 dark:text-white font-mono">
                                  {pkg.name === 'Bronze' ? '🥉 Bronze' : pkg.name === 'Silver' ? '🥈 Silver' : pkg.name === 'Gold' ? '🥇 Gold' : `👑 ${pkg.name}`}
                                </span>
                                <span className="text-xs font-bold font-mono text-sport-navy dark:text-sport-green">
                                  Rp {pkg.price.toLocaleString('id-ID')}/bln
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{pkg.description}</p>
                              
                              <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800/60 pt-3">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-400">Diskon Booking:</span>
                                  <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">{pkg.discountPercent}%</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-400">Cashback Point:</span>
                                  <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">{pkg.cashbackMultiplier}x</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-400">Booking Prioritas:</span>
                                  <span className="font-bold text-gray-700 dark:text-gray-300 font-mono font-bold text-sport-navy dark:text-sport-green">H-{pkg.priorityDays}</span>
                                </div>
                              </div>

                              {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-3 space-y-1 pl-2">
                                  {pkg.features.map((feat, fIdx) => (
                                    <div key={fIdx} className="text-[10px] text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                      <span className="text-sport-green font-bold">✓</span> {feat}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-150 dark:border-gray-800">
                              <button
                                onClick={() => handleEditMembershipPackage(pkg)}
                                className="flex-1 py-1.5 bg-sport-navy/5 hover:bg-sport-navy/10 dark:bg-sport-green/10 dark:hover:bg-sport-green/20 text-sport-navy dark:text-sport-green rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" /> Edit Paket
                              </button>
                              <button
                                onClick={() => handleDeleteMembershipPackage(pkg.id)}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Add / Edit Form */}
                  <div className="bg-white dark:bg-sport-slate/30 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                    <h5 className="font-bold text-sm text-gray-800 dark:text-white mb-4">
                      {editingMembershipPackage ? '📝 Edit Paket' : '✨ Tambah Paket Baru'}
                    </h5>

                    <form onSubmit={handleSaveMembershipPackage} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Nama Paket:</label>
                        <input 
                          type="text" 
                          value={pkgName}
                          onChange={(e) => setPkgName(e.target.value)}
                          required
                          placeholder="e.g. Platinum"
                          className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Harga per Bulan (Rp):</label>
                        <input 
                          type="number" 
                          value={pkgPrice}
                          onChange={(e) => setPkgPrice(Number(e.target.value))}
                          required
                          min={0}
                          className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Diskon (%):</label>
                          <input 
                            type="number" 
                            value={pkgDiscountPercent}
                            onChange={(e) => setPkgDiscountPercent(Number(e.target.value))}
                            required
                            min={0}
                            max={100}
                            className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Cashback (Multiplier):</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={pkgCashbackMultiplier}
                            onChange={(e) => setPkgCashbackMultiplier(Number(e.target.value))}
                            required
                            min={1}
                            max={10}
                            className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Prioritas Booking (Hari H-):</label>
                        <input 
                          type="number" 
                          value={pkgPriorityDays}
                          onChange={(e) => setPkgPriorityDays(Number(e.target.value))}
                          required
                          min={1}
                          max={30}
                          className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Deskripsi Singkat:</label>
                        <textarea 
                          value={pkgDescription}
                          onChange={(e) => setPkgDescription(e.target.value)}
                          placeholder="Penjelasan ringkas mengenai sasaran paket..."
                          rows={2}
                          className="w-full bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Fitur Keunggulan (Benefit):</label>
                        <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="e.g. VIP Lounge Gratis"
                            className="flex-1 bg-gray-50 dark:bg-sport-dark/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-green text-gray-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="px-3 bg-sport-navy text-white hover:bg-sport-navy-hover rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Tambah
                          </button>
                        </div>

                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {pkgFeatures.map((feat, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-sport-dark/60 p-1.5 rounded-lg text-[11px] text-gray-700 dark:text-gray-300">
                              <span>• {feat}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(index)}
                                className="text-red-500 hover:text-red-700 px-1 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {editingMembershipPackage && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMembershipPackage(null);
                              setPkgName('');
                              setPkgPrice(50000);
                              setPkgDiscountPercent(5);
                              setPkgCashbackMultiplier(1.0);
                              setPkgPriorityDays(3);
                              setPkgDescription('');
                              setPkgFeatures([]);
                              setNewFeature('');
                            }}
                            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-sport-dark/50 text-gray-600 dark:text-gray-400 font-bold text-xs rounded-xl cursor-pointer transition"
                          >
                            Batal
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-sport-green text-sport-navy font-black text-xs rounded-xl shadow-lg hover:bg-sport-green-hover transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> {editingMembershipPackage ? 'Simpan Perubahan' : 'Buat Paket'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* F. ADMIN PROFILE SUB-TAB */}
            {settingsSubTab === 'profile' && (
              <form onSubmit={handleAdminProfileUpdate} className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h4 className="text-xs font-extrabold text-sport-navy dark:text-sport-green uppercase tracking-wider font-mono">Edit Profil Administrator</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Perbarui nama lengkap, nomor WhatsApp, dan unggah foto profil kustom Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Nama Administrator:</label>
                    <input 
                      type="text" 
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">No. Telepon / WhatsApp:</label>
                    <input 
                      type="tel" 
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2">Foto Profil Admin:</label>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-sport-dark/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-sport-dark relative shrink-0">
                      <img 
                        src={adminPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                        alt="profile preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-sport-navy hover:bg-sport-navy-light text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-sport-green" />
                        <span>{isUploadingAdminPhoto ? 'Mengunggah...' : 'Pilih & Upload Foto Profil'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAdminPhotoUpload} 
                          disabled={isUploadingAdminPhoto}
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1.5">Format PNG, JPG, JPEG maks. 5MB. Klik "Simpan Profil" di bawah untuk menyimpan perubahan.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-150 dark:border-gray-800 pt-5 flex justify-end">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-sport-green hover:bg-sport-green-bright text-sport-dark font-extrabold text-xs rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    Simpan Profil Admin
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* 7. CUSTOMER LIVE CHAT TAB */}
        {activeTab === 'chats' && (
          <div className="bg-white dark:bg-sport-slate rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-md p-6 h-[580px] flex flex-col gap-5 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sport-navy dark:text-sport-green" /> Live Chat Pelanggan UTM Sport Center
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Balas langsung pesan konsultasi, pertanyaan sewa, dan kendala pembayaran user secara real-time.</p>
              </div>
              <button 
                onClick={() => API.getChats().then(setChats).catch(console.error)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-sport-dark hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all"
              >
                Refresh Chat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
              {/* Left Pane: Sessions List */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-y-auto flex flex-col p-2 bg-gray-50/50 dark:bg-sport-dark/25 h-full">
                <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase p-2 block border-b border-gray-100 dark:border-gray-800/80 mb-2">Percakapan Aktif</span>
                {(() => {
                  // Group chats by senderId (where senderId !== 'admin')
                  const sessionsMap = new Map<string, { userId: string; userName: string; lastMessage: string; timestamp: string; unreadCount: number }>();
                  
                  chats.forEach(c => {
                    const otherUserId = c.senderId === 'admin' ? c.receiverId : c.senderId;
                    if (otherUserId === 'admin' || otherUserId === 'guest') return;
                    
                    const userObj = users.find(u => u.id === otherUserId);
                    const otherUserName = userObj ? userObj.name : (c.senderId === 'admin' ? 'Customer' : c.senderName);
                    
                    const existing = sessionsMap.get(otherUserId);
                    const isUnread = !c.isRead && c.senderId !== 'admin';
                    
                    if (!existing || new Date(c.createdAt) > new Date(existing.timestamp)) {
                      sessionsMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: otherUserName,
                        lastMessage: c.message,
                        timestamp: c.createdAt,
                        unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0)
                      });
                    } else if (isUnread) {
                      sessionsMap.set(otherUserId, {
                        ...existing,
                        unreadCount: existing.unreadCount + 1
                      });
                    }
                  });
                  
                  const chatSessions = Array.from(sessionsMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                  if (chatSessions.length === 0) {
                    return <div className="p-4 text-center text-xs text-gray-400 font-medium">Belum ada percakapan masuk dari user.</div>;
                  }

                  return (
                    <div className="space-y-1">
                      {chatSessions.map((session) => (
                        <button
                          key={session.userId}
                          onClick={() => setSelectedChatUserId(session.userId)}
                          className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 cursor-pointer border ${
                            selectedChatUserId === session.userId
                              ? 'bg-sport-navy dark:bg-sport-navy-light border-transparent text-white'
                              : 'bg-white dark:bg-sport-slate border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs truncate max-w-[130px]">{session.userName}</span>
                            <span className={`text-[9px] font-mono ${selectedChatUserId === session.userId ? 'text-gray-300' : 'text-gray-400'}`}>
                              {new Date(session.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate max-w-[190px] ${selectedChatUserId === session.userId ? 'text-gray-200' : 'text-gray-500'}`}>
                            {session.lastMessage}
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Right Pane: Thread View */}
              <div className="md:col-span-2 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col h-full bg-white dark:bg-sport-dark/10 overflow-hidden">
                {selectedChatUserId ? (
                  <div className="flex flex-col h-full justify-between">
                    {/* Thread Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-sport-dark/50">
                      <div>
                        <span className="font-bold text-xs text-gray-800 dark:text-white block">
                          {users.find(u => u.id === selectedChatUserId)?.name || 'Pelanggan UTM Sport'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {selectedChatUserId}</span>
                      </div>
                    </div>

                    {/* Thread Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                      {chats
                        .filter(c => (c.senderId === selectedChatUserId && c.receiverId === 'admin') || (c.senderId === 'admin' && c.receiverId === selectedChatUserId))
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((c) => {
                          const isMe = c.senderId === 'admin';
                          return (
                            <div
                              key={c.id}
                              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed flex flex-col gap-1 ${
                                isMe
                                  ? 'bg-sport-green text-sport-dark self-end rounded-tr-none'
                                  : 'bg-gray-100 dark:bg-sport-slate text-gray-800 dark:text-gray-100 self-start rounded-tl-none'
                              }`}
                            >
                              <span className="font-semibold text-[10px] opacity-80">{c.senderName}</span>
                              <p>{c.message}</p>
                              <span className="text-[9px] font-mono text-right opacity-60 mt-0.5">
                                {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Thread Footer Reply Input */}
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!adminReplyText.trim() || !selectedChatUserId) return;
                        
                        const newReply = {
                          id: `chat-reply-admin-${Date.now()}`,
                          senderId: 'admin',
                          senderName: 'UTM Sport Admin',
                          receiverId: selectedChatUserId,
                          message: adminReplyText,
                          createdAt: new Date().toISOString(),
                          isRead: true
                        };

                        try {
                          const res = await API.sendChatMessage(newReply);
                          setChats(prev => [...prev, res]);
                          setAdminReplyText('');
                        } catch (err: any) {
                          alert('Gagal mengirim balasan: ' + err.message);
                        }
                      }} 
                      className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2"
                    >
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Ketik balasan untuk pelanggan..."
                        className="flex-1 bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sport-navy text-gray-800 dark:text-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sport-navy dark:bg-sport-navy-light text-white font-bold text-xs rounded-xl hover:bg-sport-navy-light transition-all cursor-pointer"
                      >
                        Kirim
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-2">
                    <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700 animate-bounce" />
                    <span className="font-bold text-xs">Pilih percakapan aktif dari panel kiri untuk mulai membalas chat.</span>
                    <p className="text-[11px] max-w-sm text-gray-400 dark:text-gray-500">Anda dapat langsung berkomunikasi dua arah dengan user yang sedang aktif bertanya di website.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Proof of Payment Viewer Modal Overlay */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-sport-slate rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col gap-4 transition-all duration-300 ${
            isFullscreenReceipt ? 'w-screen h-screen max-w-none rounded-none p-6 border-none' : 'w-full max-w-2xl p-5'
          }`}>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs font-mono uppercase text-gray-400">Pratinjau Struk Transfer</h4>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-sport-dark text-[10px] rounded text-gray-500 font-mono">
                  Scale: {Math.round(zoomScale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Zoom Controls */}
                <button 
                  onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                  title="Zoom Out"
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-sport-dark dark:hover:bg-sport-dark/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-850 dark:hover:text-white transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setZoomScale(1)}
                  title="Reset Zoom"
                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-sport-dark dark:hover:bg-sport-dark/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-850 dark:hover:text-white text-[10px] font-bold font-mono transition cursor-pointer"
                >
                  100%
                </button>
                <button 
                  onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                  title="Zoom In"
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-sport-dark dark:hover:bg-sport-dark/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-850 dark:hover:text-white transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1"></div>

                {/* Fullscreen Control */}
                <button 
                  onClick={() => setIsFullscreenReceipt(!isFullscreenReceipt)}
                  title={isFullscreenReceipt ? "Exit Fullscreen" : "Fullscreen"}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-sport-dark dark:hover:bg-sport-dark/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-850 dark:hover:text-white transition cursor-pointer"
                >
                  {isFullscreenReceipt ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Download Button */}
                <a 
                  href={viewingReceiptUrl}
                  download={`struk-pembayaran-${Date.now()}.png`}
                  title="Download Struk"
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-sport-dark dark:hover:bg-sport-dark/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-850 dark:hover:text-white transition cursor-pointer flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* Close Control */}
                <button 
                  onClick={() => {
                    setViewingReceiptUrl(null);
                    setZoomScale(1);
                    setIsFullscreenReceipt(false);
                  }} 
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition cursor-pointer font-bold flex items-center justify-center ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Image Canvas Container */}
            <div className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-sport-dark flex items-center justify-center overflow-auto ${
              isFullscreenReceipt ? 'flex-1 h-0' : 'h-[500px]'
            }`}>
              <div 
                className="transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <img 
                  src={viewingReceiptUrl} 
                  alt="payment proof receipt" 
                  className="max-w-full max-h-full object-contain pointer-events-none" 
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <a
                href={viewingReceiptUrl}
                download={`struk-pembayaran-${Date.now()}.png`}
                className="flex-1 py-2.5 bg-sport-green text-sport-navy text-xs font-black rounded-xl hover:bg-sport-green-hover shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Bukti Pembayaran
              </a>
              <button
                onClick={() => {
                  setViewingReceiptUrl(null);
                  setZoomScale(1);
                  setIsFullscreenReceipt(false);
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-sport-dark/85 text-gray-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT USER MEMBERSHIP CONTROL MODAL OVERLAY */}
      {editingUserForMembership && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-sport-slate rounded-2xl w-full max-w-md p-6 border border-gray-150 dark:border-gray-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Atur Tingkat Membership &amp; Benefit
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Sesuaikan akun: <strong>{editingUserForMembership.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setEditingUserForMembership(null)}
                className="p-1 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-full text-gray-500 transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserMembershipDirect} className="space-y-4">
              {/* Membership Tier Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                  Tingkatan Level Membership:
                </label>
                <select
                  value={targetUserMembership}
                  onChange={(e) => setTargetUserMembership(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-sport-navy dark:focus:ring-sport-green"
                >
                  <option value="regular">REGULAR (Standar / None)</option>
                  <option value="bronze">BRONZE (Premium Tier 1)</option>
                  <option value="silver">SILVER (Premium Tier 2)</option>
                  <option value="gold">GOLD (Premium Tier 3)</option>
                  {/* Plus any dynamic packages configured */}
                  {membershipPackagesList
                    .filter(p => !['regular', 'bronze', 'silver', 'gold'].includes(p.name.toLowerCase()))
                    .map((p) => (
                      <option key={p.id} value={p.name.toLowerCase()}>
                        {p.name.toUpperCase()} (Kustom)
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* User Points Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                  Poin Loyalitas (Loyalty Points):
                </label>
                <input
                  type="number"
                  min="0"
                  value={targetUserPoints}
                  onChange={(e) => setTargetUserPoints(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 dark:text-white focus:outline-none font-mono focus:ring-1 focus:ring-sport-navy dark:focus:ring-sport-green"
                />
              </div>

              {/* Membership Expiration Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                  Masa Berlaku Premium (Kosongkan jika aktif selamanya):
                </label>
                <input
                  type="date"
                  value={targetUserMembershipExpiresAt}
                  onChange={(e) => setTargetUserMembershipExpiresAt(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-sport-dark border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 dark:text-white focus:outline-none font-mono focus:ring-1 focus:ring-sport-navy dark:focus:ring-sport-green"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setTargetUserMembershipExpiresAt(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-mono cursor-pointer"
                  >
                    +1 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 6);
                      setTargetUserMembershipExpiresAt(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-mono cursor-pointer"
                  >
                    +6 Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setTargetUserMembershipExpiresAt(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-mono cursor-pointer"
                  >
                    +1 Tahun
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUserMembershipExpiresAt('')}
                    className="text-[9px] bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-2 py-1 rounded font-mono cursor-pointer ml-auto"
                  >
                    Selamanya
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sport-navy dark:bg-sport-navy-light text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUserForMembership(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-sport-dark dark:hover:bg-gray-800 text-gray-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
