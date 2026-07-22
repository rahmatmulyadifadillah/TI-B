/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CourtCategory = 'futsal';

export interface Court {
  id: string;
  name: string;
  category: CourtCategory;
  courtType: string; // e.g., 'Vinyl', 'Rumput Sintetis', 'Interlock', 'Indoor', 'Outdoor'
  price: number;
  capacity: number;
  size: string;
  description: string;
  facilities: string[];
  status: 'aktif' | 'nonaktif';
  rating: number;
  reviewsCount: number;
  image: string;
  videoUrl?: string;
  view360Url?: string;
}

export interface ScheduleSlot {
  id: string;
  courtId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:00
  price: number;
  status: 'tersedia' | 'dipesan' | 'terkunci';
}

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'kasir' | 'user';
export type MembershipType = 'regular' | 'bronze' | 'silver' | 'gold';

export interface MembershipPackage {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  cashbackMultiplier: number;
  priorityDays: number;
  description: string;
  features: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  photoUrl: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  points: number;
  referralCode: string;
  referredBy?: string;
  membership: MembershipType;
  membershipExpiresAt?: string;
  createdAt: string;
}

export type BookingStatus = 
  | 'menunggu_pembayaran' 
  | 'pembayaran_dikirim' 
  | 'sedang_diverifikasi' 
  | 'pembayaran_ditolak' 
  | 'pembayaran_diterima' 
  | 'booking_diproses' 
  | 'booking_selesai' 
  | 'booking_dibatalkan'
  | 'pending' 
  | 'diproses' 
  | 'dikonfirmasi' 
  | 'ditolak' 
  | 'selesai' 
  | 'expired';

export interface BookingDetail {
  id: string;
  bookingId: string;
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  invoiceNumber: string;
  courtCategory: CourtCategory;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string; // 'BCA', 'BRI', 'DANA', etc.
  bookingType: 'harian' | 'mingguan' | 'bulanan' | 'event' | 'turnamen' | 'membership';
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  details: BookingDetail[];
  promoCode?: string;
  qrCodeUrl?: string;
  paymentProofUrl?: string;
}

export interface PaymentMethod {
  type: 'bank' | 'ewallet';
  name: string; // BCA, OVO, etc.
  accountNumber: string;
  accountHolder: string;
  imageUrl?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minPurchase: number;
  description: string;
  status: 'aktif' | 'expired';
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  imageUrl: string;
  expiryDate: string;
}

export interface Review {
  id: string;
  courtId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  views: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  fee: number;
  prize: string;
  participantsCount: number;
  maxParticipants: number;
  date: string;
  status: 'buka' | 'berjalan' | 'selesai';
  bracketUrl?: string;
  image: string;
}

export interface SportEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  fee: number;
  image: string;
  location: string;
}

export interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // 'admin' or user ID
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface LogActivity {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AppSettings {
  maintenanceMode: boolean;
  siteName: string;
  whatsappContact: string;
  instagramContact: string;
  emailContact: string;
  address: string;
  locationMapsUrl: string;

  // Custom CMS configurations
  brandName?: string;
  logoUrl?: string;
  marqueeText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideoUrl?: string;
  heroBgImage?: string;
  heroImageUrl?: string;
  heroCtaText?: string;
  runningText?: string;
  runningTextActive?: boolean;
  runningTextBgColor?: string;
  runningTextColor?: string;
  runningTextSpeed?: number;
  heroImage?: string;
  statsUsersCount?: number;
  statsBookingsCount?: number;
  statsCourtsCount?: number;
  
  // Logo replacements
  logoHeader?: string;
  logoFooter?: string;
  logoLogin?: string;
  logoDashboard?: string;
  favicon?: string;

  // Custom Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  navbarColor?: string;
  footerColor?: string;
  cardColor?: string;
  hoverColor?: string;

  // Fonts
  fontFamily?: string;
  fontSizeHeading?: string;
  fontSizeBody?: string;
  fontSizeButton?: string;
  fontWeightHeading?: string;
  fontWeightBody?: string;

  // Footer / Header specific content
  footerAboutText?: string;
  footerText?: string;
  footerCopyright?: string;
  footerCopyrightText?: string;
  headerAnnouncement?: string;

  // Contacts
  facebookContact?: string;
  tiktokContact?: string;
  twitterContact?: string;
  youtubeContact?: string;
  linkedinContact?: string;
  telegramContact?: string;
  discordContact?: string;
  phoneContact?: string;
  contactCity?: string;
  contactProvince?: string;
}

export interface Facility {
  id: string;
  name: string;
  icon: string;
  image?: string;
  description: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  profession?: string;
  content?: string;
  rating: number;
  photoUrl?: string;
  status?: 'aktif' | 'nonaktif';
  role?: string;
  avatar?: string;
  message?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url?: string;
  icon?: string;
  order: number;
  isActive?: boolean;
  parentId?: string;
  view?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  senderName: string;
  senderBank: string;
  paymentMethod: string;
  amountTransfer: number;
  transferDate: string;
  transferTime: string;
  paymentProofUrl: string;
  notes?: string;
  status: 'sedang_diverifikasi' | 'pembayaran_diterima' | 'pembayaran_ditolak';
  rejectionReason?: string;
  createdAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  changedBy: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentLog {
  id: string;
  bookingId: string;
  action: string;
  details: string;
  createdAt: string;
}
