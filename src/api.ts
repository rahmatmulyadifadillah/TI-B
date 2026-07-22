/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Court, ScheduleSlot, UserProfile, Booking, Voucher, Promo, 
  Review, GalleryItem, Article, FAQItem, Tournament, SportEvent, 
  Sponsor, ChatMessage, AppNotification, LogActivity, AppSettings, PaymentMethod,
  Payment, BookingStatusHistory, PaymentLog, MenuItem, Facility, Testimonial, MembershipPackage
} from './types';

const API_BASE = '/api';

// Safe wrapper for fetch
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const API = {
  // --- SETTINGS ---
  getSettings: () => fetchJson<AppSettings>(`${API_BASE}/settings`),
  updateSettings: (settings: AppSettings) => fetchJson<AppSettings>(`${API_BASE}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),

  // --- PAYMENT METHODS ---
  getPaymentMethods: () => fetchJson<PaymentMethod[]>(`${API_BASE}/payment-methods`),

  // --- COURTS ---
  getCourts: () => fetchJson<Court[]>(`${API_BASE}/courts`),
  getCourtById: (id: string) => fetchJson<Court>(`${API_BASE}/courts/${id}`),
  createCourt: (court: Court) => fetchJson<Court>(`${API_BASE}/courts`, {
    method: 'POST',
    body: JSON.stringify(court)
  }),
  updateCourt: (court: Court) => fetchJson<Court>(`${API_BASE}/courts/${court.id}`, {
    method: 'PUT',
    body: JSON.stringify(court)
  }),
  deleteCourt: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/courts/${id}`, {
    method: 'DELETE'
  }),

  // --- SCHEDULES ---
  getSchedules: (courtId: string, date: string) => 
    fetchJson<ScheduleSlot[]>(`${API_BASE}/schedules?courtId=${courtId}&date=${date}`),
  lockScheduleSlot: (courtId: string, date: string, timeSlot: string, status: 'tersedia' | 'dipesan' | 'terkunci') =>
    fetchJson<ScheduleSlot>(`${API_BASE}/schedules/lock`, {
      method: 'POST',
      body: JSON.stringify({ courtId, date, timeSlot, status })
    }),

  // --- AUTH / USERS ---
  login: (email: string, password: string) => 
    fetchJson<UserProfile>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (email: string, name: string, phone: string, password: string) =>
    fetchJson<UserProfile>(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, name, phone, password })
    }),
  getUsers: () => fetchJson<UserProfile[]>(`${API_BASE}/users`),
  updateUser: (user: UserProfile) => fetchJson<UserProfile>(`${API_BASE}/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  }),
  deleteUser: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/users/${id}`, {
    method: 'DELETE'
  }),

  // --- VOUCHERS ---
  verifyVoucher: (code: string) => fetchJson<Voucher>(`${API_BASE}/vouchers/verify`, {
    method: 'POST',
    body: JSON.stringify({ code })
  }),
  getVouchers: () => fetchJson<Voucher[]>(`${API_BASE}/vouchers`),
  createVoucher: (voucher: Voucher) => fetchJson<Voucher>(`${API_BASE}/vouchers`, {
    method: 'POST',
    body: JSON.stringify(voucher)
  }),
  updateVoucher: (voucher: Voucher) => fetchJson<Voucher>(`${API_BASE}/vouchers/${voucher.id}`, {
    method: 'PUT',
    body: JSON.stringify(voucher)
  }),
  deleteVoucher: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/vouchers/${id}`, {
    method: 'DELETE'
  }),

  // --- BOOKINGS ---
  getBookings: () => fetchJson<Booking[]>(`${API_BASE}/bookings`),
  createBooking: (booking: Booking) => fetchJson<Booking>(`${API_BASE}/bookings`, {
    method: 'POST',
    body: JSON.stringify(booking)
  }),
  updateBooking: (booking: Booking) => fetchJson<Booking>(`${API_BASE}/bookings/${booking.id}`, {
    method: 'PUT',
    body: JSON.stringify(booking)
  }),

  // --- CONTENT ---
  getGallery: () => fetchJson<GalleryItem[]>(`${API_BASE}/gallery`),
  createGalleryItem: (item: GalleryItem) => fetchJson<GalleryItem>(`${API_BASE}/gallery`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateGalleryItem: (item: GalleryItem) => fetchJson<GalleryItem>(`${API_BASE}/gallery/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteGalleryItem: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE'
  }),

  getFAQs: () => fetchJson<FAQItem[]>(`${API_BASE}/faqs`),
  createFAQ: (item: FAQItem) => fetchJson<FAQItem>(`${API_BASE}/faqs`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateFAQ: (item: FAQItem) => fetchJson<FAQItem>(`${API_BASE}/faqs/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteFAQ: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/faqs/${id}`, {
    method: 'DELETE'
  }),

  getArticles: () => fetchJson<Article[]>(`${API_BASE}/articles`),
  createArticle: (item: Article) => fetchJson<Article>(`${API_BASE}/articles`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateArticle: (item: Article) => fetchJson<Article>(`${API_BASE}/articles/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteArticle: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/articles/${id}`, {
    method: 'DELETE'
  }),

  getPromos: () => fetchJson<Promo[]>(`${API_BASE}/promos`),
  createPromo: (item: Promo) => fetchJson<Promo>(`${API_BASE}/promos`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updatePromo: (item: Promo) => fetchJson<Promo>(`${API_BASE}/promos/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deletePromo: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/promos/${id}`, {
    method: 'DELETE'
  }),

  getTournaments: () => fetchJson<Tournament[]>(`${API_BASE}/tournaments`),
  createTournament: (item: Tournament) => fetchJson<Tournament>(`${API_BASE}/tournaments`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateTournament: (item: Tournament) => fetchJson<Tournament>(`${API_BASE}/tournaments/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteTournament: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE'
  }),

  getEvents: () => fetchJson<SportEvent[]>(`${API_BASE}/events`),
  createEvent: (item: SportEvent) => fetchJson<SportEvent>(`${API_BASE}/events`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateEvent: (item: SportEvent) => fetchJson<SportEvent>(`${API_BASE}/events/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteEvent: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/events/${id}`, {
    method: 'DELETE'
  }),

  getSponsors: () => fetchJson<Sponsor[]>(`${API_BASE}/sponsors`),
  createSponsor: (item: Sponsor) => fetchJson<Sponsor>(`${API_BASE}/sponsors`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateSponsor: (item: Sponsor) => fetchJson<Sponsor>(`${API_BASE}/sponsors/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteSponsor: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/sponsors/${id}`, {
    method: 'DELETE'
  }),

  getFacilities: () => fetchJson<Facility[]>(`${API_BASE}/facilities`),
  createFacility: (item: Facility) => fetchJson<Facility>(`${API_BASE}/facilities`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateFacility: (item: Facility) => fetchJson<Facility>(`${API_BASE}/facilities/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteFacility: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/facilities/${id}`, {
    method: 'DELETE'
  }),

  getTestimonials: () => fetchJson<Testimonial[]>(`${API_BASE}/testimonials`),
  createTestimonial: (item: Testimonial) => fetchJson<Testimonial>(`${API_BASE}/testimonials`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateTestimonial: (item: Testimonial) => fetchJson<Testimonial>(`${API_BASE}/testimonials/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteTestimonial: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/testimonials/${id}`, {
    method: 'DELETE'
  }),

  getMenus: () => fetchJson<MenuItem[]>(`${API_BASE}/menus`),
  createMenu: (item: MenuItem) => fetchJson<MenuItem>(`${API_BASE}/menus`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateMenu: (item: MenuItem) => fetchJson<MenuItem>(`${API_BASE}/menus/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),
  deleteMenu: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/menus/${id}`, {
    method: 'DELETE'
  }),

  restoreDatabase: (dump?: any) => fetchJson<{ success: boolean; message?: string }>(`${API_BASE}/database/restore`, {
    method: 'POST',
    body: JSON.stringify(dump || {})
  }),

  // --- REVIEWS ---
  getReviews: (courtId?: string) => fetchJson<Review[]>(`${API_BASE}/reviews${courtId ? `?courtId=${courtId}` : ''}`),
  createReview: (review: Review) => fetchJson<Review>(`${API_BASE}/reviews`, {
    method: 'POST',
    body: JSON.stringify(review)
  }),

  // --- CHATS ---
  getChats: () => fetchJson<ChatMessage[]>(`${API_BASE}/chats`),
  sendChatMessage: (chat: ChatMessage) => fetchJson<ChatMessage>(`${API_BASE}/chats`, {
    method: 'POST',
    body: JSON.stringify(chat)
  }),

  // --- NOTIFICATIONS ---
  getNotifications: (userId: string) => fetchJson<AppNotification[]>(`${API_BASE}/notifications/${userId}`),
  markNotificationsRead: (userId: string) => fetchJson<{ success: boolean }>(`${API_BASE}/notifications/read/${userId}`, {
    method: 'POST'
  }),

  // --- LOGS ---
  getLogs: () => fetchJson<LogActivity[]>(`${API_BASE}/logs`),

  // --- DATABASE EXPORT URL ---
  getDatabaseBackupUrl: () => `${API_BASE}/database/backup`,

  // --- FILE UPLOADS ---
  uploadImage: (fileName: string, base64Data: string) => fetchJson<{ url: string }>(`${API_BASE}/upload`, {
    method: 'POST',
    body: JSON.stringify({ fileName, base64Data })
  }),

  // --- PAYMENTS & VERIFICATIONS ---
  uploadPaymentProof: (fileName: string, base64Data: string) => fetchJson<{ url: string }>(`${API_BASE}/upload-payment`, {
    method: 'POST',
    body: JSON.stringify({ fileName, base64Data })
  }),
  getPayments: () => fetchJson<Payment[]>(`${API_BASE}/payments`),
  getPaymentByBookingId: (bookingId: string) => fetchJson<Payment | null>(`${API_BASE}/payments/booking/${bookingId}`),
  getBookingStatusHistory: (bookingId: string) => fetchJson<BookingStatusHistory[]>(`${API_BASE}/bookings/history/${bookingId}`),
  getPaymentLogs: (bookingId?: string) => fetchJson<PaymentLog[]>(`${API_BASE}/payments/logs${bookingId ? `?bookingId=${bookingId}` : ''}`),
  submitPayment: (payment: Partial<Payment>) => fetchJson<Payment>(`${API_BASE}/payments`, {
    method: 'POST',
    body: JSON.stringify(payment)
  }),
  verifyPayment: (bookingId: string, status: 'pembayaran_diterima' | 'pembayaran_ditolak', rejectionReason?: string) => 
    fetchJson<{ success: boolean, booking: Booking, payment: Payment | null }>(`${API_BASE}/payments/verify`, {
      method: 'POST',
      body: JSON.stringify({ bookingId, status, rejectionReason })
    }),
  
  // --- MEMBERSHIP PACKAGES (CRUD) ---
  getMembershipPackages: () => fetchJson<MembershipPackage[]>(`${API_BASE}/membership-packages`),
  createMembershipPackage: (p: Partial<MembershipPackage>) => fetchJson<MembershipPackage>(`${API_BASE}/membership-packages`, {
    method: 'POST',
    body: JSON.stringify(p)
  }),
  updateMembershipPackage: (p: MembershipPackage) => fetchJson<MembershipPackage>(`${API_BASE}/membership-packages/${p.id}`, {
    method: 'PUT',
    body: JSON.stringify(p)
  }),
  deleteMembershipPackage: (id: string) => fetchJson<{ success: boolean }>(`${API_BASE}/membership-packages/${id}`, {
    method: 'DELETE'
  }),

  // --- SESSION STORAGE CONVENIENCE ---
  getCurrentUser: (): UserProfile | null => {
    const raw = localStorage.getItem('utm_user_session');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },
  setCurrentUser: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem('utm_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('utm_user_session');
    }
  }
};
