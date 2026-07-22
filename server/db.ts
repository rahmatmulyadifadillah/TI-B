/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'utm_sport_center',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

pool.getConnection()
  .then(connection => {
    console.log('MySQL berhasil terhubung!');
    connection.release();
  })
  .catch(error => {
    console.error('MySQL gagal terhubung:', error);
  });

import fs from 'fs';
import path from 'path';
import { 
  Court, ScheduleSlot, UserProfile, Booking, BookingDetail, 
  Voucher, Promo, Review, GalleryItem, Article, FAQItem, 
  Tournament, SportEvent, Sponsor, ChatMessage, AppNotification, 
  LogActivity, AppSettings, PaymentMethod, Payment, BookingStatusHistory, PaymentLog,
  Facility, Testimonial, MenuItem, MembershipPackage
} from '../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

// Interface representing our full DB structure
interface DBStructure {
  courts: Court[];
  schedules: ScheduleSlot[];
  users: UserProfile[];
  bookings: Booking[];
  vouchers: Voucher[];
  promos: Promo[];
  reviews: Review[];
  gallery: GalleryItem[];
  articles: Article[];
  faqs: FAQItem[];
  tournaments: Tournament[];
  events: SportEvent[];
  sponsors: Sponsor[];
  chats: ChatMessage[];
  notifications: AppNotification[];
  logs: LogActivity[];
  settings: AppSettings;
  bankAccounts: PaymentMethod[];
  payments: Payment[];
  bookingStatusHistory: BookingStatusHistory[];
  paymentLogs: PaymentLog[];
  facilities: Facility[];
  testimonials: Testimonial[];
  menus: MenuItem[];
  membershipPackages?: MembershipPackage[];
}

// Pre-seeded Default Data
const DEFAULT_COURTS: Court[] = [
  {
    id: 'court-futsal-vinyl',
    name: 'Lapangan Futsal Vinyl Premium',
    category: 'futsal',
    courtType: 'Vinyl',
    price: 150000,
    capacity: 10,
    size: '38m x 18m',
    description: 'Lapangan futsal indoor dengan lantai material Vinyl berkualitas tinggi standard internasional. Memiliki daya cengkram optimal, mengurangi risiko cedera lutut dan pergelangan kaki.',
    facilities: ['Toilet', 'Musholla', 'Wifi', 'Parkir', 'Kantin', 'Ruang Ganti', 'Locker', 'Tribun Penonton', 'Lampu Malam'],
    status: 'aktif',
    rating: 4.8,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    view360Url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b'
  },
  {
    id: 'court-futsal-rumput',
    name: 'Lapangan Futsal Rumput Sintetis',
    category: 'futsal',
    courtType: 'Rumput Sintetis',
    price: 130000,
    capacity: 12,
    size: '40m x 20m',
    description: 'Lapangan futsal indoor dengan rumput sintetis premium yang lembut dan padat. Dilengkapi dengan butiran karet pengisi (rubber infill) berkualitas untuk pantulan bola yang sempurna.',
    facilities: ['Toilet', 'Musholla', 'Parkir', 'Kantin', 'Ruang Ganti', 'Locker', 'Lampu Malam'],
    status: 'aktif',
    rating: 4.6,
    reviewsCount: 8,
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    view360Url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68'
  },
  {
    id: 'court-futsal-interlock',
    name: 'Lapangan Futsal Interlock',
    category: 'futsal',
    courtType: 'Interlock',
    price: 120000,
    capacity: 10,
    size: '38m x 18m',
    description: 'Lapangan futsal semi-outdoor menggunakan lantai interlock polipropilena yang kokoh dan memiliki drainase yang baik. Sangat cocok untuk permainan cepat dan latihan fisik intens.',
    facilities: ['Toilet', 'Parkir', 'Kantin', 'Ruang Ganti', 'Lampu Malam'],
    status: 'aktif',
    rating: 4.5,
    reviewsCount: 5,
    image: 'https://images.unsplash.com/photo-1624880357913-a853e236c82a?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-superadmin',
    email: 'superadmin@utmsport.com',
    name: 'Rahmat Mulyadi (Admin)',
    phone: '081339638842',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    status: 'aktif',
    points: 1000,
    referralCode: 'UTM_SUPER',
    membership: 'gold',
    createdAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'user-admin',
    email: 'admin@utmsport.com',
    name: 'Admin UTM Sport',
    phone: '081339638842',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    status: 'aktif',
    points: 500,
    referralCode: 'UTM_ADMIN',
    membership: 'silver',
    createdAt: '2026-01-05T12:00:00Z'
  },
  {
    id: 'user-operator',
    email: 'operator@utmsport.com',
    name: 'Operator Lapangan',
    phone: '081339638842',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'operator',
    status: 'aktif',
    points: 100,
    referralCode: 'UTM_OPERATOR',
    membership: 'regular',
    createdAt: '2026-02-10T14:00:00Z'
  },
  {
    id: 'user-regular',
    email: 'user@utmsport.com',
    name: 'Rahmat Mulyadi Fadillah',
    phone: '081339638842',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'user',
    status: 'aktif',
    points: 250,
    referralCode: 'RAHMAT842',
    referredBy: 'UTM_SUPER',
    membership: 'silver',
    createdAt: '2026-06-01T08:00:00Z'
  }
];

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'v-diskon10',
    code: 'UTM10',
    discountType: 'percent',
    value: 10,
    minPurchase: 100000,
    description: 'Diskon 10% untuk semua lapangan dengan minimal transaksi Rp 100.000.',
    status: 'aktif'
  },
  {
    id: 'v-potong30k',
    code: 'UTMHEBAT',
    discountType: 'flat',
    value: 30000,
    minPurchase: 120000,
    description: 'Potongan harga Rp 30.000 untuk lapangan futsal dengan minimal transaksi Rp 120.000.',
    status: 'aktif'
  },
  {
    id: 'v-membergold',
    code: 'MEMBGOLD',
    discountType: 'percent',
    value: 15,
    minPurchase: 80000,
    description: 'Diskon eksklusif 15% khusus Member Gold.',
    status: 'aktif'
  }
];

const DEFAULT_PROMOS: Promo[] = [
  {
    id: 'p-flash',
    title: 'Flash Sale Selasa Hebat',
    description: 'Diskon 20% khusus hari Selasa pukul 08:00 - 14:00 WITA. Berlaku semua jenis lapangan futsal.',
    discountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600',
    expiryDate: '2026-08-31'
  },
  {
    id: 'p-merdeka',
    title: 'Promo Spesial Hari Kemerdekaan',
    description: 'Cashback Point 50% untuk booking di tanggal 17 Agustus 2026. Main lebih seru, dapat poin melimpah!',
    discountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-378724044602?auto=format&fit=crop&q=80&w=600',
    expiryDate: '2026-08-18'
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    courtId: 'court-futsal-vinyl',
    userId: 'user-regular',
    userName: 'Rahmat Mulyadi Fadillah',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    reviewText: 'Lantai vinyl nya empuk banget dan ga licin! Penerangan malam hari sangat terang benderang. Pelayanan admin ramah banget, langsung dikasih air mineral gratis pas pertama kali main. Recommended!',
    createdAt: '2026-07-01T20:30:00Z'
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'g-1', title: 'Grand Opening UTM Sport Center', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600', category: 'fasilitas' },
  { id: 'g-2', title: 'Pertandingan Futsal Persahabatan', imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=600', category: 'event' },
  { id: 'g-4', title: 'Fasilitas Musholla Bersih', imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600', category: 'fasilitas' }
];

const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: '5 Tips Penting Menghindari Cedera Saat Bermain Futsal',
    summary: 'Bermain futsal sangat menyenangkan, namun risiko cedera selalu mengintai jika Anda mengabaikan pemanasan dan perlengkapan.',
    content: 'Futsal adalah olahraga dengan tempo tinggi yang membutuhkan akselerasi, deselerasi cepat, dan kontak fisik. Untuk menghindari cedera, perhatikan 5 tips berikut:\n\n1. **Pemanasan yang Cukup**: Lakukan dinamis stretching minimal 10 menit sebelum masuk lapangan.\n2. **Gunakan Sepatu yang Tepat**: Pilih sepatu futsal dengan outsole karet anti selip yang sesuai dengan jenis lantai (vinyl atau interlock).\n3. **Gunakan Dekker pelindung tulang kering** untuk menghindari benturan langsung.\n4. **Hidrasi Tubuh**: Minum air putih 200-300ml setiap 15-20 menit bermain.\n5. **Pendinginan (Cooling Down)**: Lakukan peregangan statis setelah bermain untuk mengembalikan kelenturan otot.',
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=600',
    author: 'Coach Rahmat',
    date: '2026-07-01',
    views: 124
  }
];

const DEFAULT_FAQS: FAQItem[] = [
  { id: 'faq-1', question: 'Bagaimana cara melakukan booking lapangan?', answer: 'Anda dapat mendaftar akun terlebih dahulu, memilih menu Lapangan, tentukan jenis lapangan, tanggal, jam bermain, lalu selesaikan pembayaran via transfer Bank atau E-Wallet yang tersedia.', category: 'booking' },
  { id: 'faq-2', question: 'Apakah bisa membatalkan booking yang sudah dibayar?', answer: 'Pembatalan booking dapat dilakukan maksimal 24 jam sebelum jadwal bermain. Poin refund atau uang akan dikembalikan dalam bentuk Point Reward sebesar 80% dari total nominal transaksi.', category: 'kebijakan' },
  { id: 'faq-3', question: 'Bagaimana cara menjadi member UTM Sport?', answer: 'Silakan masuk ke halaman Dashboard User lalu pilih menu Membership. Anda bisa membeli paket Bronze, Silver, atau Gold untuk mendapatkan diskon otomatis setiap kali booking.', category: 'member' }
];

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    name: 'UTM Futsal Cup Mataram 2026',
    description: 'Turnamen futsal antar instansi dan umum se-Kota Mataram. Perebutkan piala bergilir dan total hadiah puluhan juta rupiah!',
    fee: 350000,
    prize: 'Total Rp 15.000.000 + Trophy',
    participantsCount: 14,
    maxParticipants: 32,
    date: '2026-08-15',
    status: 'buka',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600'
  }
];

const DEFAULT_EVENTS: SportEvent[] = [
  {
    id: 'evt-1',
    name: 'Coaching Clinic Futsal Bersama Pelatih Nasional',
    description: 'Belajar langsung teknik dasar, taktik tanding futsal modern bersama pelatih tim nasional Indonesia.',
    date: '2026-07-25',
    time: '08:00 - 12:00 WITA',
    fee: 50000,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    location: 'UTM Sport Center Court A'
  }
];

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'Specs Indonesia', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150' },
  { id: 'sp-2', name: 'Mizuno', imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=150' },
  { id: 'sp-3', name: 'Pocari Sweat', imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=150' }
];

const DEFAULT_BANK_ACCOUNTS: PaymentMethod[] = [
  { type: 'bank', name: 'BCA', accountNumber: '0562234125', accountHolder: 'RAHMAT MULYADI FADILLAH' },
  { type: 'bank', name: 'BRI', accountNumber: '0052-01-084223-50-8', accountHolder: 'RAHMAT MULYADI FADILLAH' },
  { type: 'bank', name: 'Bank NTB Syariah', accountNumber: '5040220235489', accountHolder: 'RAHMAT MULYADI FADILLAH' },
  { type: 'ewallet', name: 'DANA', accountNumber: '081339638842', accountHolder: 'RAHMAT MULYADI FADILLAH' },
  { type: 'ewallet', name: 'OVO', accountNumber: '081339638842', accountHolder: 'RAHMAT MULYADI FADILLAH' },
  { type: 'ewallet', name: 'GoPay', accountNumber: '081339638842', accountHolder: 'RAHMAT MULYADI FADILLAH' }
];

const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode: false,
  siteName: 'UTM Sport Center',
  whatsappContact: '081339638842',
  instagramContact: 'rahmtmlydi__',
  emailContact: 'rahmatmulyadifadillah@gmail.com',
  address: 'Jl. Pemuda No. 12, Dasan Agung Baru, Kec. Selaparang, Kota Mataram, Nusa Tenggara Barat 83125, Indonesia',
  locationMapsUrl: "https://www.google.com/maps?q=Kota+Mataram,+Nusa+Tenggara+Barat&output=embed",
  
  heroTitle: 'Sewa Lapangan Futsal Premium & Modern se-Kota Mataram',
  heroSubtitle: 'UTM Sport Center menyediakan lapangan futsal berstandar nasional dengan fasilitas penunjang lengkap, pencahayaan modern, dan sistem pemesanan online real-time terintegrasi.',
  heroBgImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200',
  heroCtaText: 'Booking Lapangan Sekarang',
  runningText: '⚽ UTM Sport Center Mataram - Selamat datang! Dapatkan promo diskon menarik khusus booking hari ini! Hubungi Admin WhatsApp untuk informasi turnamen futsal mendatang. ⚽',
  
  logoHeader: '🏆',
  logoFooter: '🏆',
  logoLogin: '🏆',
  logoDashboard: '🏆',
  favicon: '🏆',

  primaryColor: '#0B2F64',
  secondaryColor: '#10B981',
  accentColor: '#3B82F6',
  backgroundColor: '#F9FAFB',
  textColor: '#1F2937',
  buttonColor: '#0B2F64',
  navbarColor: '#FFFFFF',
  footerColor: '#030712'
};

const DEFAULT_FACILITIES: Facility[] = [
  { id: 'fac-1', name: 'Kantin Higienis', icon: 'Coffee', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=300', description: 'Menyediakan makanan ringan, air mineral, minuman berenergi, dan mie instan hangat untuk memulihkan stamina bermain.', order: 1 },
  { id: 'fac-2', name: 'Musholla Bersih', icon: 'Heart', image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=300', description: 'Dilengkapi dengan sajadah, mukena, sarung bersih, dan tempat wudhu yang nyaman terpisah untuk laki-laki dan perempuan.', order: 2 },
  { id: 'fac-3', name: 'Locker & Ruang Ganti', icon: 'Lock', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300', description: 'Ruang ganti full AC yang bersih dilengkapi dengan locker penyimpanan barang berharga dengan kunci pengaman individual.', order: 3 },
  { id: 'fac-4', name: 'Parkir Luas & Aman', icon: 'MapPin', image: 'https://images.unsplash.com/photo-1506521788701-1e13a722c19a?auto=format&fit=crop&q=80&w=300', description: 'Area parkir beraspal luas untuk 50+ motor dan 15+ mobil dilindungi kamera CCTV 24 jam dan petugas keamanan.', order: 4 }
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 'test-1', name: 'Ahmad Faisal', profession: 'Kapten FC Mataram', content: 'Lantai vinyl di UTM Sport Center adalah salah satu yang terbaik di Pulau Lombok. Tidak licin, pantulan bolanya stabil, dan minim cedera.', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', status: 'aktif' },
  { id: 'test-2', name: 'Siti Rahma', profession: 'Penyewa Mingguan', content: 'Sistem booking website-nya super canggih! Konfirmasi pembayaran sangat cepat, adminnya sangat responsif di WhatsApp.', rating: 5, photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', status: 'aktif' },
  { id: 'test-3', name: 'Budi Hartono', profession: 'Pemain Futsal Hobi', content: 'Lampu malamnya terang benderang tidak membuat silau mata. Kantinnya bersih dan area parkir aman.', rating: 4, photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', status: 'aktif' }
];

const DEFAULT_MENUS: MenuItem[] = [
  { id: 'm-1', label: 'Home', url: 'home', order: 1, isActive: true },
  { id: 'm-2', label: 'Lapangan', url: 'lapangan', order: 2, isActive: true },
  { id: 'm-3', label: 'Membership', url: 'membership', order: 3, isActive: true },
  { id: 'm-4', label: 'Turnamen & Event', url: 'turnamen', order: 4, isActive: true },
  { id: 'm-5', label: 'Galeri', url: 'galeri', order: 5, isActive: true },
  { id: 'm-6', label: 'Tentang Kami', url: 'tentang', order: 6, isActive: true },
  { id: 'm-7', label: 'FAQ', url: 'faq', order: 7, isActive: true },
  { id: 'm-8', label: 'Kontak Kami', url: 'kontak', order: 8, isActive: true }
];

const DEFAULT_MEMBERSHIP_PACKAGES: MembershipPackage[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 50000,
    discountPercent: 5,
    cashbackMultiplier: 1.0,
    priorityDays: 3,
    description: 'Dapatkan potongan harga langsung otomatis untuk setiap kali penyewaan lapangan futsal UTM Sport Center.',
    features: ['Diskon Booking 5%', 'Cashback Point 1x', 'Booking Prioritas H-3']
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 100000,
    discountPercent: 10,
    cashbackMultiplier: 1.5,
    priorityDays: 5,
    description: 'Tier Silver memberikan keleluasaan booking dengan diskon lebih tinggi dan prioritas penjadwalan lebih awal.',
    features: ['Diskon Booking 10%', 'Cashback Point 1.5x', 'Booking Prioritas H-5']
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 200000,
    discountPercent: 15,
    cashbackMultiplier: 2.0,
    priorityDays: 7,
    description: 'Level premium tertinggi dengan diskon maksimal, prioritas booking terpanjang, dan fasilitas istimewa di UTM Sport Center.',
    features: ['Diskon Booking 15%', 'Cashback Point 2x', 'Booking Prioritas H-7', 'VIP Lounge Gratis']
  }
];

// Main Database Manager Class
export class DB {
  private static data: DBStructure;

  public static initialize() {
    if (this.data) return;

    if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure standard bank accounts exist
        if (!this.data.bankAccounts) {
          this.data.bankAccounts = DEFAULT_BANK_ACCOUNTS;
        }

        let dirty = false;
        if (!this.data.payments) {
          this.data.payments = [];
          dirty = true;
        }
        if (!this.data.bookingStatusHistory) {
          this.data.bookingStatusHistory = [];
          dirty = true;
        }
        if (!this.data.paymentLogs) {
          this.data.paymentLogs = [];
          dirty = true;
        }

        // Enforce Futsal-only rules & purge volleyball entries
        if (this.data.courts && this.data.courts.some(c => (c.category as string) === 'voli')) {
          this.data.courts = this.data.courts.filter(c => (c.category as string) !== 'voli');
          dirty = true;
        }
        if (this.data.schedules) {
          const originalLength = this.data.schedules.length;
          this.data.schedules = this.data.schedules.filter(s => {
            const court = this.data.courts.find(c => c.id === s.courtId);
            return court && court.category === 'futsal';
          });
          if (this.data.schedules.length !== originalLength) {
            dirty = true;
          }
        }
        if (this.data.reviews && this.data.reviews.some(r => r.courtId.includes('voli'))) {
          this.data.reviews = this.data.reviews.filter(r => !r.courtId.includes('voli'));
          dirty = true;
        }
        if (this.data.gallery && this.data.gallery.some(g => g.category === 'voli' || g.title.toLowerCase().includes('voli'))) {
          this.data.gallery = this.data.gallery.filter(g => g.category !== 'voli' && !g.title.toLowerCase().includes('voli'));
          dirty = true;
        }
        if (this.data.articles && this.data.articles.some(a => a.title.toLowerCase().includes('voli') || a.content.toLowerCase().includes('voli'))) {
          this.data.articles = this.data.articles.filter(a => !a.title.toLowerCase().includes('voli') && !a.content.toLowerCase().includes('voli'));
          dirty = true;
        }
        if (this.data.events && this.data.events.some(e => e.name.toLowerCase().includes('voli') || e.description.toLowerCase().includes('voli'))) {
          this.data.events = this.data.events.filter(e => !e.name.toLowerCase().includes('voli') && !e.description.toLowerCase().includes('voli'));
          if (this.data.events.length === 0) {
            this.data.events = DEFAULT_EVENTS;
          }
          dirty = true;
        }

        // Migrate superadmin to admin role
        if (this.data.users) {
          this.data.users.forEach(u => {
            if (u.id === 'user-superadmin' || u.role === 'superadmin') {
              u.role = 'admin';
              if (u.name.includes('Super Admin')) {
                u.name = u.name.replace('Super Admin', 'Admin');
              }
              dirty = true;
            }
          });
        }

        if (!this.data.facilities) {
          this.data.facilities = DEFAULT_FACILITIES;
          dirty = true;
        }
        if (!this.data.testimonials) {
          this.data.testimonials = DEFAULT_TESTIMONIALS;
          dirty = true;
        }
        if (!this.data.menus) {
          this.data.menus = DEFAULT_MENUS;
          dirty = true;
        }
        if (!this.data.membershipPackages) {
          this.data.membershipPackages = DEFAULT_MEMBERSHIP_PACKAGES;
          dirty = true;
        }

        if (dirty) {
          this.save();
        }
        return;
      } catch (err) {
        console.error('Error reading db.json, generating default database...', err);
      }
    }

    // Seed default data
    this.data = {
      courts: DEFAULT_COURTS,
      schedules: [],
      users: DEFAULT_USERS,
      bookings: [],
      vouchers: DEFAULT_VOUCHERS,
      promos: DEFAULT_PROMOS,
      reviews: DEFAULT_REVIEWS,
      gallery: DEFAULT_GALLERY,
      articles: DEFAULT_ARTICLES,
      faqs: DEFAULT_FAQS,
      tournaments: DEFAULT_TOURNAMENTS,
      events: DEFAULT_EVENTS,
      sponsors: DEFAULT_SPONSORS,
      chats: [],
      notifications: [],
      logs: [],
      settings: DEFAULT_SETTINGS,
      bankAccounts: DEFAULT_BANK_ACCOUNTS,
      payments: [],
      bookingStatusHistory: [],
      paymentLogs: [],
      facilities: DEFAULT_FACILITIES,
      testimonials: DEFAULT_TESTIMONIALS,
      menus: DEFAULT_MENUS,
      membershipPackages: DEFAULT_MEMBERSHIP_PACKAGES
    };

    // Pre-generate schedules for the next 7 days
    this.generateSchedulesForNextNDays(7);
    this.save();
  }

  private static save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db.json', err);
    }
  }

  private static generateSchedulesForNextNDays(days: number) {
    const timeSlots = [
      '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
      '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
      '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
      '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00'
    ];

    const today = new Date();
    for (let d = 0; d < days; d++) {
      const dateStr = new Date(today.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      this.data.courts.forEach(court => {
        timeSlots.forEach((slot, i) => {
          // Check if slot already exists
          const exists = this.data.schedules.some(
            s => s.courtId === court.id && s.date === dateStr && s.timeSlot === slot
          );

          if (!exists) {
            // Some slots are booked by default for realism
            let status: 'tersedia' | 'dipesan' | 'terkunci' = 'tersedia';
            if (d === 0 && (i === 11 || i === 12 || i === 13)) { // 18:00 - 21:00
              status = 'dipesan';
            }

            this.data.schedules.push({
              id: `slot-${court.id}-${dateStr}-${i}`,
              courtId: court.id,
              date: dateStr,
              timeSlot: slot,
              price: court.price,
              status
            });
          }
        });
      });
    }
  }

  // --- COURTS API ---
  public static getCourts() {
    this.initialize();
    return this.data.courts;
  }

  public static getCourtById(id: string) {
    this.initialize();
    return this.data.courts.find(c => c.id === id);
  }

  public static createCourt(court: Court) {
    this.initialize();
    this.data.courts.push(court);
    // Auto generate schedules
    this.generateSchedulesForNextNDays(7);
    this.save();
    return court;
  }

  public static updateCourt(court: Court) {
    this.initialize();
    const idx = this.data.courts.findIndex(c => c.id === court.id);
    if (idx !== -1) {
      this.data.courts[idx] = court;
      this.save();
      return court;
    }
    return null;
  }

  public static deleteCourt(id: string) {
    this.initialize();
    this.data.courts = this.data.courts.filter(c => c.id !== id);
    this.data.schedules = this.data.schedules.filter(s => s.courtId !== id);
    this.save();
    return true;
  }

  // --- SCHEDULES API ---
  public static getSchedules(courtId: string, date: string) {
    this.initialize();
    // Dynamically generate schedules for that specific date if missing
    const existing = this.data.schedules.filter(s => s.courtId === courtId && s.date === date);
    if (existing.length === 0) {
      // Generate dynamically for this single day
      const court = this.data.courts.find(c => c.id === courtId);
      if (court) {
        const timeSlots = [
          '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
          '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
          '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
          '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00'
        ];
        timeSlots.forEach((slot, i) => {
          this.data.schedules.push({
            id: `slot-${court.id}-${date}-${i}`,
            courtId: court.id,
            date: date,
            timeSlot: slot,
            price: court.price,
            status: 'tersedia'
          });
        });
        this.save();
      }
    }
    return this.data.schedules.filter(s => s.courtId === courtId && s.date === date);
  }

  public static updateScheduleSlot(courtId: string, date: string, timeSlot: string, status: 'tersedia' | 'dipesan' | 'terkunci') {
    this.initialize();
    const slot = this.data.schedules.find(s => s.courtId === courtId && s.date === date && s.timeSlot === timeSlot);
    if (slot) {
      slot.status = status;
      this.save();
      return slot;
    }
    return null;
  }

  // --- USERS API ---
  public static getUsers() {
    this.initialize();
    return this.data.users;
  }

  public static getUserById(id: string) {
    this.initialize();
    return this.data.users.find(u => u.id === id);
  }

  public static getUserByEmail(email: string) {
    this.initialize();
    const cleanEmail = email.toLowerCase().trim();
    let searchEmail = cleanEmail;
    if (cleanEmail === 'admin@utm.com') searchEmail = 'admin@utmsport.com';
    if (cleanEmail === 'user@utm.com') searchEmail = 'user@utmsport.com';
    if (cleanEmail === 'superadmin@utm.com') searchEmail = 'superadmin@utmsport.com';
    return this.data.users.find(u => u.email.toLowerCase() === searchEmail);
  }

  public static createUser(user: UserProfile) {
    this.initialize();
    this.data.users.push(user);
    this.save();
    return user;
  }

  public static updateUser(user: UserProfile) {
    this.initialize();
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.data.users[idx] = user;
      this.save();
      return user;
    }
    return null;
  }

  public static deleteUser(id: string) {
    this.initialize();
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
    return true;
  }

  // --- BOOKINGS API ---
  public static getBookings() {
    this.initialize();
    return this.data.bookings;
  }

  public static getBookingById(id: string) {
    this.initialize();
    return this.data.bookings.find(b => b.id === id);
  }

  public static createBooking(booking: Booking) {
    this.initialize();
    this.data.bookings.push(booking);
    
    // Auto reserve schedule slots
    booking.details.forEach(det => {
      this.updateScheduleSlot(det.courtId, det.date, det.timeSlot, 'dipesan');
    });

    // Award point reward with membership cashback multiplier
    const user = this.data.users.find(u => u.id === booking.userId);
    if (user) {
      let cashbackMultiplier = 1.0;
      if (user.membership && user.membership !== 'regular') {
        const pkg = (this.data.membershipPackages || []).find(p => p.id === user.membership);
        if (pkg) {
          cashbackMultiplier = pkg.cashbackMultiplier;
        } else if (user.membership === 'silver') {
          cashbackMultiplier = 1.5;
        } else if (user.membership === 'gold') {
          cashbackMultiplier = 2.0;
        }
      }
      const awardedPoints = Math.floor((booking.finalAmount / 1000) * cashbackMultiplier);
      user.points += awardedPoints;
      
      // Auto add log
      this.addLog(user.id, user.email, 'CREATE_BOOKING', `Membuat booking #${booking.invoiceNumber}, mendapatkan ${awardedPoints} Points.`);
      // Auto add notification
      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Booking Berhasil Dibuat!',
        message: `Booking #${booking.invoiceNumber} berhasil dibuat. Silakan unggah bukti pembayaran agar dapat segera dikonfirmasi.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return booking;
  }

  public static updateBooking(booking: Booking) {
    this.initialize();
    const idx = this.data.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      const oldBooking = this.data.bookings[idx];
      this.data.bookings[idx] = booking;

      // Handle cancel slots release
      if (booking.status === 'ditolak' || booking.status === 'expired') {
        booking.details.forEach(det => {
          this.updateScheduleSlot(det.courtId, det.date, det.timeSlot, 'tersedia');
        });
      }

      // Handle custom log/notif on status transition
      if (oldBooking.status !== booking.status) {
        this.addNotification({
          id: `notif-${Date.now()}-${booking.status}`,
          userId: booking.userId,
          title: `Status Booking: ${booking.status.toUpperCase()}`,
          message: `Booking #${booking.invoiceNumber} status Anda telah diupdate menjadi ${booking.status}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        this.addLog('admin', 'admin@utmsport.com', 'UPDATE_BOOKING_STATUS', `Update booking #${booking.invoiceNumber} status menjadi ${booking.status}`);
      }

      this.save();
      return booking;
    }
    return null;
  }

  // --- VOUCHERS API ---
  public static getVouchers() {
    this.initialize();
    return this.data.vouchers;
  }

  public static getVoucherByCode(code: string) {
    this.initialize();
    return this.data.vouchers.find(v => v.code.toUpperCase() === code.toUpperCase() && v.status === 'aktif');
  }

  public static createVoucher(v: Voucher) {
    this.initialize();
    this.data.vouchers.push(v);
    this.save();
    return v;
  }

  public static updateVoucher(v: Voucher) {
    this.initialize();
    const idx = this.data.vouchers.findIndex(item => item.id === v.id);
    if (idx !== -1) {
      this.data.vouchers[idx] = v;
      this.save();
      return v;
    }
    return null;
  }

  public static deleteVoucher(id: string) {
    this.initialize();
    this.data.vouchers = this.data.vouchers.filter(v => v.id !== id);
    this.save();
    return true;
  }

  // --- PROMOS API ---
  public static getPromos() {
    this.initialize();
    return this.data.promos;
  }

  // --- REVIEWS API ---
  public static getReviews(courtId?: string) {
    this.initialize();
    if (courtId) {
      return this.data.reviews.filter(r => r.courtId === courtId);
    }
    return this.data.reviews;
  }

  public static createReview(review: Review) {
    this.initialize();
    this.data.reviews.push(review);
    
    // Recalculate court rating
    const court = this.data.courts.find(c => c.id === review.courtId);
    if (court) {
      const courtReviews = this.data.reviews.filter(r => r.courtId === review.courtId);
      const totalRating = courtReviews.reduce((sum, r) => sum + r.rating, 0);
      court.rating = parseFloat((totalRating / courtReviews.length).toFixed(1));
      court.reviewsCount = courtReviews.length;
    }

    this.save();
    return review;
  }

  // --- GALLERY, FAQs, ARTICLES, TOURNAMENTS, EVENTS, SPONSORS ---
  public static getGallery() { this.initialize(); return this.data.gallery; }
  public static createGalleryItem(item: GalleryItem) {
    this.initialize();
    this.data.gallery.push(item);
    this.save();
    return item;
  }
  public static updateGalleryItem(item: GalleryItem) {
    this.initialize();
    const idx = this.data.gallery.findIndex(g => g.id === item.id);
    if (idx !== -1) {
      this.data.gallery[idx] = item;
      this.save();
      return item;
    }
    return null;
  }
  public static deleteGalleryItem(id: string) {
    this.initialize();
    this.data.gallery = this.data.gallery.filter(g => g.id !== id);
    this.save();
    return true;
  }

  public static getFAQ() { this.initialize(); return this.data.faqs; }
  public static createFAQ(item: FAQItem) {
    this.initialize();
    this.data.faqs.push(item);
    this.save();
    return item;
  }
  public static updateFAQ(item: FAQItem) {
    this.initialize();
    const idx = this.data.faqs.findIndex(f => f.id === item.id);
    if (idx !== -1) {
      this.data.faqs[idx] = item;
      this.save();
      return item;
    }
    return null;
  }
  public static deleteFAQ(id: string) {
    this.initialize();
    this.data.faqs = this.data.faqs.filter(f => f.id !== id);
    this.save();
    return true;
  }

  public static getArticles() { this.initialize(); return this.data.articles; }
  public static createArticle(item: Article) {
    this.initialize();
    this.data.articles.push(item);
    this.save();
    return item;
  }
  public static updateArticle(item: Article) {
    this.initialize();
    const idx = this.data.articles.findIndex(a => a.id === item.id);
    if (idx !== -1) {
      this.data.articles[idx] = item;
      this.save();
      return item;
    }
    return null;
  }
  public static deleteArticle(id: string) {
    this.initialize();
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    this.save();
    return true;
  }

  public static createPromo(p: Promo) {
    this.initialize();
    this.data.promos.push(p);
    this.save();
    return p;
  }
  public static updatePromo(p: Promo) {
    this.initialize();
    const idx = this.data.promos.findIndex(item => item.id === p.id);
    if (idx !== -1) {
      this.data.promos[idx] = p;
      this.save();
      return p;
    }
    return null;
  }
  public static deletePromo(id: string) {
    this.initialize();
    this.data.promos = this.data.promos.filter(p => p.id !== id);
    this.save();
    return true;
  }

  public static getTournaments() { this.initialize(); return this.data.tournaments; }
  public static createTournament(t: Tournament) {
    this.initialize();
    this.data.tournaments.push(t);
    this.save();
    return t;
  }
  public static updateTournament(t: Tournament) {
    this.initialize();
    const idx = this.data.tournaments.findIndex(item => item.id === t.id);
    if (idx !== -1) {
      this.data.tournaments[idx] = t;
      this.save();
      return t;
    }
    return null;
  }
  public static deleteTournament(id: string) {
    this.initialize();
    this.data.tournaments = this.data.tournaments.filter(t => t.id !== id);
    this.save();
    return true;
  }

  public static getEvents() { this.initialize(); return this.data.events; }
  public static createEvent(e: SportEvent) {
    this.initialize();
    this.data.events.push(e);
    this.save();
    return e;
  }
  public static updateEvent(e: SportEvent) {
    this.initialize();
    const idx = this.data.events.findIndex(item => item.id === e.id);
    if (idx !== -1) {
      this.data.events[idx] = e;
      this.save();
      return e;
    }
    return null;
  }
  public static deleteEvent(id: string) {
    this.initialize();
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.save();
    return true;
  }

  public static getSponsors() { this.initialize(); return this.data.sponsors; }
  public static createSponsor(s: Sponsor) {
    this.initialize();
    this.data.sponsors.push(s);
    this.save();
    return s;
  }
  public static updateSponsor(s: Sponsor) {
    this.initialize();
    const idx = this.data.sponsors.findIndex(item => item.id === s.id);
    if (idx !== -1) {
      this.data.sponsors[idx] = s;
      this.save();
      return s;
    }
    return null;
  }
  public static deleteSponsor(id: string) {
    this.initialize();
    this.data.sponsors = this.data.sponsors.filter(s => s.id !== id);
    this.save();
    return true;
  }

  // --- CHATS API ---
  public static getChats() {
    this.initialize();
    return this.data.chats;
  }

  public static addChatMessage(chat: ChatMessage) {
    this.initialize();
    this.data.chats.push(chat);
    this.save();
    return chat;
  }

  // --- NOTIFICATIONS API ---
  public static getNotifications(userId: string) {
    this.initialize();
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public static addNotification(notif: AppNotification) {
    this.initialize();
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.push(notif);
    this.save();
    return notif;
  }

  public static markNotificationsRead(userId: string) {
    this.initialize();
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
    return true;
  }

  // --- LOGS API ---
  public static getLogs() {
    this.initialize();
    return this.data.logs;
  }

  public static addLog(userId: string, email: string, action: string, details: string) {
    this.initialize();
    this.data.logs.push({
      id: `log-${Date.now()}`,
      userId,
      userEmail: email,
      action,
      details,
      createdAt: new Date().toISOString()
    });
    this.save();
  }

  // --- SETTINGS API ---
  public static getSettings() {
    this.initialize();
    return this.data.settings;
  }

  public static updateSettings(settings: AppSettings) {
    this.initialize();
    this.data.settings = settings;
    this.save();
    return settings;
  }

  // --- BANCK ACCS API ---
  public static getBankAccounts() {
    this.initialize();
    return this.data.bankAccounts;
  }

  // --- PAYMENTS & LOGS API ---
  public static getPayments() {
    this.initialize();
    return this.data.payments || [];
  }

  public static getPaymentById(id: string) {
    this.initialize();
    return (this.data.payments || []).find(p => p.id === id);
  }

  public static getPaymentByBookingId(bookingId: string) {
    this.initialize();
    return (this.data.payments || []).find(p => p.bookingId === bookingId);
  }

  public static createPayment(payment: Payment) {
    this.initialize();
    if (!this.data.payments) this.data.payments = [];
    this.data.payments.push(payment);
    
    // Auto insert booking status history
    this.addBookingStatusHistory({
      id: `history-${Date.now()}`,
      bookingId: payment.bookingId,
      status: 'pembayaran_dikirim',
      changedBy: 'user',
      notes: `Bukti pembayaran diunggah oleh ${payment.senderName}. Nominal: Rp ${payment.amountTransfer.toLocaleString('id-ID')}`,
      createdAt: new Date().toISOString()
    });

    // Auto insert payment log
    this.addPaymentLog({
      id: `paylog-${Date.now()}`,
      bookingId: payment.bookingId,
      action: 'PAYMENT_SUBMITTED',
      details: `User ${payment.senderName} mengunggah bukti pembayaran via ${payment.paymentMethod}.`,
      createdAt: new Date().toISOString()
    });

    this.save();
    return payment;
  }

  public static updatePayment(payment: Payment) {
    this.initialize();
    if (!this.data.payments) this.data.payments = [];
    const idx = this.data.payments.findIndex(p => p.id === payment.id);
    if (idx !== -1) {
      this.data.payments[idx] = payment;
      this.save();
      return payment;
    }
    return null;
  }

  public static getBookingStatusHistory(bookingId: string) {
    this.initialize();
    return (this.data.bookingStatusHistory || []).filter(h => h.bookingId === bookingId);
  }

  public static addBookingStatusHistory(history: BookingStatusHistory) {
    this.initialize();
    if (!this.data.bookingStatusHistory) this.data.bookingStatusHistory = [];
    this.data.bookingStatusHistory.push(history);
    this.save();
    return history;
  }

  public static getPaymentLogs(bookingId?: string) {
    this.initialize();
    const logs = this.data.paymentLogs || [];
    if (bookingId) {
      return logs.filter(l => l.bookingId === bookingId);
    }
    return logs;
  }

  public static addPaymentLog(log: PaymentLog) {
    this.initialize();
    if (!this.data.paymentLogs) this.data.paymentLogs = [];
    this.data.paymentLogs.push(log);
    this.save();
    return log;
  }

  // --- MEMBERSHIP PACKAGES API ---
  public static getMembershipPackages() {
    this.initialize();
    return this.data.membershipPackages || [];
  }

  public static createMembershipPackage(p: MembershipPackage) {
    this.initialize();
    if (!this.data.membershipPackages) this.data.membershipPackages = [];
    this.data.membershipPackages.push(p);
    this.save();
    return p;
  }

  public static updateMembershipPackage(p: MembershipPackage) {
    this.initialize();
    if (!this.data.membershipPackages) this.data.membershipPackages = [];
    const idx = this.data.membershipPackages.findIndex(item => item.id === p.id);
    if (idx !== -1) {
      this.data.membershipPackages[idx] = p;
      this.save();
      return p;
    }
    return null;
  }

  public static deleteMembershipPackage(id: string) {
    this.initialize();
    if (!this.data.membershipPackages) this.data.membershipPackages = [];
    this.data.membershipPackages = this.data.membershipPackages.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // --- SQL DUMP GENERATOR ---
  // Generates complete relational MySQL backup scripts containing constraints, indexes, sample rows
  public static generateSQLDump(): string {
    this.initialize();
    let sql = `-- ====================================================================
-- Database Dump for UTM Sport Center Booking System
-- Generated: ${new Date().toISOString()}
-- Target Engine: MySQL 8.0+ / MariaDB
-- Compatibility: XAMPP, phpMyAdmin, MySQL Workbench
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`log_activity\`;
DROP TABLE IF EXISTS \`notifikasi\`;
DROP TABLE IF EXISTS \`chat\`;
DROP TABLE IF EXISTS \`sponsor\`;
DROP TABLE IF EXISTS \`peserta_turnamen\`;
DROP TABLE IF EXISTS \`turnamen\`;
DROP TABLE IF EXISTS \`event\`;
DROP TABLE IF EXISTS \`faq\`;
DROP TABLE IF EXISTS \`artikel\`;
DROP TABLE IF EXISTS \`galeri\`;
DROP TABLE IF EXISTS \`review\`;
DROP TABLE IF EXISTS \`membership\`;
DROP TABLE IF EXISTS \`promo\`;
DROP TABLE IF EXISTS \`voucher\`;
DROP TABLE IF EXISTS \`payment_logs\`;
DROP TABLE IF EXISTS \`booking_status\`;
DROP TABLE IF EXISTS \`payments\`;
DROP TABLE IF EXISTS \`pembayaran\`;
DROP TABLE IF EXISTS \`invoice\`;
DROP TABLE IF EXISTS \`booking_detail\`;
DROP TABLE IF EXISTS \`booking\`;
DROP TABLE IF EXISTS \`jadwal\`;
DROP TABLE IF EXISTS \`lapangan\`;
DROP TABLE IF EXISTS \`kategori_lapangan\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`roles\`;
DROP TABLE IF EXISTS \`setting\`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- Table: setting
-- --------------------------------------------------------------------
CREATE TABLE \`setting\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`site_name\` VARCHAR(100) NOT NULL,
  \`whatsapp_contact\` VARCHAR(20) NOT NULL,
  \`instagram_contact\` VARCHAR(50) NOT NULL,
  \`email_contact\` VARCHAR(100) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`location_maps_url\` TEXT NOT NULL,
  \`maintenance_mode\` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`setting\` VALUES (1, '${this.data.settings.siteName}', '${this.data.settings.whatsappContact}', '${this.data.settings.instagramContact}', '${this.data.settings.emailContact}', '${this.data.settings.address.replace(/'/g, "''")}', '${this.data.settings.locationMapsUrl.replace(/'/g, "''")}', ${this.data.settings.maintenanceMode ? 1 : 0});

-- --------------------------------------------------------------------
-- Table: roles
-- --------------------------------------------------------------------
CREATE TABLE \`roles\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL UNIQUE,
  \`description\` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`roles\` (\`name\`, \`description\`) VALUES 
('superadmin', 'Akses penuh seluruh sistem, pengaturan, backup, dan manajemen finansial'),
('admin', 'Kelola booking, lapangan, promo, turnamen, dan verifikasi pembayaran'),
('operator', 'Mengunci jadwal, memantau ketersediaan lapangan, dan mengawasi jalannya event'),
('kasir', 'Menerima pembayaran manual on-the-spot di lokasi lapangan'),
('user', 'Pelanggan umum UTM Sport Center');

-- --------------------------------------------------------------------
-- Table: users
-- --------------------------------------------------------------------
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20),
  \`photo_url\` TEXT,
  \`role\` VARCHAR(20) DEFAULT 'user',
  \`status\` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  \`points\` INT DEFAULT 0,
  \`referral_code\` VARCHAR(20) UNIQUE,
  \`referred_by\` VARCHAR(20),
  \`membership\` ENUM('regular', 'bronze', 'silver', 'gold') DEFAULT 'regular',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    // Fill Users data
    this.data.users.forEach(u => {
      // Create mockup hash corresponding to username123
      const mockHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password' in bcrypt
      sql += `INSERT INTO \`users\` VALUES ('${u.id}', '${u.email}', '${mockHash}', '${u.name.replace(/'/g, "''")}', '${u.phone}', '${u.photoUrl}', '${u.role}', '${u.status}', ${u.points}, '${u.referralCode}', ${u.referredBy ? `'${u.referredBy}'` : 'NULL'}, '${u.membership}', '${u.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: kategori_lapangan
-- --------------------------------------------------------------------
CREATE TABLE \`kategori_lapangan\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL UNIQUE,
  \`icon\` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`kategori_lapangan\` VALUES 
('futsal', 'Futsal', 'futbol'),
('voli', 'Voli', 'volleyball');

-- --------------------------------------------------------------------
-- Table: lapangan
-- --------------------------------------------------------------------
CREATE TABLE \`lapangan\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`kategori_id\` VARCHAR(50) NOT NULL,
  \`court_type\` VARCHAR(50) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`capacity\` INT DEFAULT 10,
  \`size\` VARCHAR(50),
  \`description\` TEXT,
  \`status\` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  \`rating\` DECIMAL(2,1) DEFAULT 0.0,
  \`reviews_count\` INT DEFAULT 0,
  \`image\` TEXT,
  \`video_url\` TEXT,
  \`view_360_url\` TEXT,
  FOREIGN KEY (\`kategori_id\`) REFERENCES \`kategori_lapangan\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.courts.forEach(c => {
      sql += `INSERT INTO \`lapangan\` VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.category}', '${c.courtType}', ${c.price}, ${c.capacity}, '${c.size}', '${c.description.replace(/'/g, "''")}', '${c.status}', ${c.rating}, ${c.reviewsCount}, '${c.image}', ${c.videoUrl ? `'${c.videoUrl}'` : 'NULL'}, ${c.view360Url ? `'${c.view360Url}'` : 'NULL'});\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: jadwal
-- --------------------------------------------------------------------
CREATE TABLE \`jadwal\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`lapangan_id\` VARCHAR(50) NOT NULL,
  \`date\` DATE NOT NULL,
  \`time_slot\` VARCHAR(50) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`status\` ENUM('tersedia', 'dipesan', 'terkunci') DEFAULT 'tersedia',
  FOREIGN KEY (\`lapangan_id\`) REFERENCES \`lapangan\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    // Add some Sample Jadwal
    this.data.schedules.slice(0, 50).forEach(s => {
      sql += `INSERT INTO \`jadwal\` VALUES ('${s.id}', '${s.courtId}', '${s.date}', '${s.timeSlot}', ${s.price}, '${s.status}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: voucher
-- --------------------------------------------------------------------
CREATE TABLE \`voucher\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`code\` VARCHAR(20) NOT NULL UNIQUE,
  \`discount_type\` ENUM('percent', 'flat') NOT NULL,
  \`value\` DECIMAL(10,2) NOT NULL,
  \`min_purchase\` DECIMAL(10,2) NOT NULL,
  \`description\` TEXT,
  \`status\` ENUM('aktif', 'expired') DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.vouchers.forEach(v => {
      sql += `INSERT INTO \`voucher\` VALUES ('${v.id}', '${v.code}', '${v.discountType}', ${v.value}, ${v.minPurchase}, '${v.description.replace(/'/g, "''")}', '${v.status}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: promo
-- --------------------------------------------------------------------
CREATE TABLE \`promo\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`title\` VARCHAR(100) NOT NULL,
  \`description\` TEXT,
  \`discount_percent\` INT DEFAULT 0,
  \`image_url\` TEXT,
  \`expiry_date\` DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.promos.forEach(p => {
      sql += `INSERT INTO \`promo\` VALUES ('${p.id}', '${p.title.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', ${p.discountPercent}, '${p.imageUrl}', '${p.expiryDate}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: booking
-- --------------------------------------------------------------------
CREATE TABLE \`booking\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`court_category\` VARCHAR(50) NOT NULL,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`discount_amount\` DECIMAL(10,2) DEFAULT 0.00,
  \`final_amount\` DECIMAL(10,2) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`booking_type\` VARCHAR(50) DEFAULT 'harian',
  \`status\` ENUM('menunggu_pembayaran', 'pembayaran_dikirim', 'sedang_diverifikasi', 'pembayaran_ditolak', 'pembayaran_diterima', 'booking_diproses', 'booking_selesai', 'booking_dibatalkan', 'pending', 'diproses', 'dikonfirmasi', 'ditolak', 'selesai', 'expired') DEFAULT 'menunggu_pembayaran',
  \`notes\` TEXT,
  \`payment_proof_url\` TEXT,
  \`qr_code_url\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.bookings.forEach(b => {
      sql += `INSERT INTO \`booking\` VALUES ('${b.id}', '${b.userId}', '${b.invoiceNumber}', '${b.courtCategory}', ${b.totalAmount}, ${b.discountAmount}, ${b.finalAmount}, '${b.paymentMethod}', '${b.bookingType}', '${b.status}', ${b.notes ? `'${b.notes.replace(/'/g, "''")}'` : 'NULL'}, ${b.paymentProofUrl ? `'${b.paymentProofUrl}'` : 'NULL'}, ${b.qrCodeUrl ? `'${b.qrCodeUrl}'` : 'NULL'}, '${b.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: booking_detail
-- --------------------------------------------------------------------
CREATE TABLE \`booking_detail\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`booking_id\` VARCHAR(50) NOT NULL,
  \`lapangan_id\` VARCHAR(50) NOT NULL,
  \`date\` DATE NOT NULL,
  \`time_slot\` VARCHAR(50) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`lapangan_id\`) REFERENCES \`lapangan\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.bookings.forEach(b => {
      b.details.forEach(det => {
        sql += `INSERT INTO \`booking_detail\` VALUES ('${det.id}', '${det.bookingId}', '${det.courtId}', '${det.date}', '${det.timeSlot}', ${det.price});\n`;
      });
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: payments
-- --------------------------------------------------------------------
CREATE TABLE \`payments\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`booking_id\` VARCHAR(50) NOT NULL,
  \`sender_name\` VARCHAR(100) NOT NULL,
  \`sender_bank\` VARCHAR(100) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`amount_transfer\` DECIMAL(10,2) NOT NULL,
  \`transfer_date\` DATE NOT NULL,
  \`transfer_time\` TIME NOT NULL,
  \`payment_proof_url\` TEXT NOT NULL,
  \`notes\` TEXT,
  \`status\` ENUM('sedang_diverifikasi', 'pembayaran_diterima', 'pembayaran_ditolak') DEFAULT 'sedang_diverifikasi',
  \`rejection_reason\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    (this.data.payments || []).forEach(p => {
      sql += `INSERT INTO \`payments\` VALUES ('${p.id}', '${p.bookingId}', '${p.senderName.replace(/'/g, "''")}', '${p.senderBank.replace(/'/g, "''")}', '${p.paymentMethod}', ${p.amountTransfer}, '${p.transferDate}', '${p.transferTime}', '${p.paymentProofUrl}', ${p.notes ? `'${p.notes.replace(/'/g, "''")}'` : 'NULL'}, '${p.status}', ${p.rejectionReason ? `'${p.rejectionReason.replace(/'/g, "''")}'` : 'NULL'}, '${p.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: booking_status
-- --------------------------------------------------------------------
CREATE TABLE \`booking_status\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`booking_id\` VARCHAR(50) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL,
  \`changed_by\` VARCHAR(50) NOT NULL,
  \`notes\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    (this.data.bookingStatusHistory || []).forEach(h => {
      sql += `INSERT INTO \`booking_status\` VALUES ('${h.id}', '${h.bookingId}', '${h.status}', '${h.changedBy}', ${h.notes ? `'${h.notes.replace(/'/g, "''")}'` : 'NULL'}, '${h.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: payment_logs
-- --------------------------------------------------------------------
CREATE TABLE \`payment_logs\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`booking_id\` VARCHAR(50) NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`details\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    (this.data.paymentLogs || []).forEach(l => {
      sql += `INSERT INTO \`payment_logs\` VALUES ('${l.id}', '${l.bookingId}', '${l.action}', ${l.details ? `'${l.details.replace(/'/g, "''")}'` : 'NULL'}, '${l.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: review
-- --------------------------------------------------------------------
CREATE TABLE \`review\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`lapangan_id\` VARCHAR(50) NOT NULL,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`rating\` INT NOT NULL CHECK (\`rating\` >= 1 AND \`rating\` <= 5),
  \`review_text\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`lapangan_id\`) REFERENCES \`lapangan\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.reviews.forEach(r => {
      sql += `INSERT INTO \`review\` VALUES ('${r.id}', '${r.courtId}', '${r.userId}', ${r.rating}, '${r.reviewText.replace(/'/g, "''")}', '${r.createdAt}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: galeri
-- --------------------------------------------------------------------
CREATE TABLE \`galeri\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`title\` VARCHAR(100) NOT NULL,
  \`image_url\` TEXT NOT NULL,
  \`category\` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.gallery.forEach(g => {
      sql += `INSERT INTO \`galeri\` VALUES ('${g.id}', '${g.title.replace(/'/g, "''")}', '${g.imageUrl}', '${g.category}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: artikel
-- --------------------------------------------------------------------
CREATE TABLE \`artikel\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`title\` VARCHAR(150) NOT NULL,
  \`summary\` TEXT,
  \`content\` TEXT,
  \`image_url\` TEXT,
  \`author\` VARCHAR(50),
  \`date\` DATE,
  \`views\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.articles.forEach(art => {
      sql += `INSERT INTO \`artikel\` VALUES ('${art.id}', '${art.title.replace(/'/g, "''")}', '${art.summary.replace(/'/g, "''")}', '${art.content.replace(/'/g, "''")}', '${art.imageUrl}', '${art.author}', '${art.date}', ${art.views});\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: faq
-- --------------------------------------------------------------------
CREATE TABLE \`faq\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`question\` TEXT NOT NULL,
  \`answer\` TEXT NOT NULL,
  \`category\` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.faqs.forEach(f => {
      sql += `INSERT INTO \`faq\` VALUES ('${f.id}', '${f.question.replace(/'/g, "''")}', '${f.answer.replace(/'/g, "''")}', '${f.category}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: turnamen
-- --------------------------------------------------------------------
CREATE TABLE \`turnamen\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT,
  \`fee\` DECIMAL(10,2) DEFAULT 0.00,
  \`prize\` VARCHAR(100),
  \`participants_count\` INT DEFAULT 0,
  \`max_participants\` INT DEFAULT 32,
  \`date\` DATE,
  \`status\` ENUM('buka', 'berjalan', 'selesai') DEFAULT 'buka',
  \`image\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.tournaments.forEach(t => {
      sql += `INSERT INTO \`turnamen\` VALUES ('${t.id}', '${t.name.replace(/'/g, "''")}', '${t.description.replace(/'/g, "''")}', ${t.fee}, '${t.prize}', ${t.participantsCount}, ${t.maxParticipants}, '${t.date}', '${t.status}', '${t.image}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: event
-- --------------------------------------------------------------------
CREATE TABLE \`event\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT,
  \`date\` DATE,
  \`time\` VARCHAR(50),
  \`fee\` DECIMAL(10,2) DEFAULT 0.00,
  \`image\` TEXT,
  \`location\` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.events.forEach(e => {
      sql += `INSERT INTO \`event\` VALUES ('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.description.replace(/'/g, "''")}', '${e.date}', '${e.time}', ${e.fee}, '${e.image}', '${e.location.replace(/'/g, "''")}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: sponsor
-- --------------------------------------------------------------------
CREATE TABLE \`sponsor\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`image_url\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    this.data.sponsors.forEach(sp => {
      sql += `INSERT INTO \`sponsor\` VALUES ('${sp.id}', '${sp.name}', '${sp.imageUrl}');\n`;
    });

    sql += `
-- --------------------------------------------------------------------
-- Table: chat
-- --------------------------------------------------------------------
CREATE TABLE \`chat\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`sender_id\` VARCHAR(50) NOT NULL,
  \`sender_name\` VARCHAR(100) NOT NULL,
  \`receiver_id\` VARCHAR(50) NOT NULL,
  \`message\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`is_read\` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: notifikasi
-- --------------------------------------------------------------------
CREATE TABLE \`notifikasi\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`message\` TEXT,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Table: log_activity
-- --------------------------------------------------------------------
CREATE TABLE \`log_activity\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`user_id\` VARCHAR(50),
  \`user_email\` VARCHAR(100),
  \`action\` VARCHAR(100) NOT NULL,
  \`details\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Create Indexes for optimization
-- --------------------------------------------------------------------
CREATE INDEX idx_booking_user ON \`booking\`(\`user_id\`);
CREATE INDEX idx_booking_status ON \`booking\`(\`status\`);
CREATE INDEX idx_booking_invoice ON \`booking\`(\`invoice_number\`);
CREATE INDEX idx_jadwal_search ON \`jadwal\`(\`lapangan_id\`, \`date\`);
CREATE INDEX idx_review_lapangan ON \`review\`(\`lapangan_id\`);
CREATE INDEX idx_chat_receiver ON \`chat\`(\`receiver_id\`);
CREATE INDEX idx_notif_user ON \`notifikasi\`(\`user_id\`, \`is_read\`);

-- --------------------------------------------------------------------
-- End of SQL Dump
-- ====================================================================
`;

    return sql;
  }

  // --- FACILITIES API ---
  public static getFacilities() {
    this.initialize();
    return this.data.facilities || [];
  }

  public static createFacility(f: Facility) {
    this.initialize();
    if (!this.data.facilities) this.data.facilities = [];
    this.data.facilities.push(f);
    this.save();
    return f;
  }

  public static updateFacility(f: Facility) {
    this.initialize();
    if (!this.data.facilities) this.data.facilities = [];
    const idx = this.data.facilities.findIndex(item => item.id === f.id);
    if (idx !== -1) {
      this.data.facilities[idx] = f;
      this.save();
      return f;
    }
    return null;
  }

  public static deleteFacility(id: string) {
    this.initialize();
    if (!this.data.facilities) this.data.facilities = [];
    this.data.facilities = this.data.facilities.filter(f => f.id !== id);
    this.save();
    return true;
  }

  // --- TESTIMONIALS API ---
  public static getTestimonials() {
    this.initialize();
    return this.data.testimonials || [];
  }

  public static createTestimonial(t: Testimonial) {
    this.initialize();
    if (!this.data.testimonials) this.data.testimonials = [];
    this.data.testimonials.push(t);
    this.save();
    return t;
  }

  public static updateTestimonial(t: Testimonial) {
    this.initialize();
    if (!this.data.testimonials) this.data.testimonials = [];
    const idx = this.data.testimonials.findIndex(item => item.id === t.id);
    if (idx !== -1) {
      this.data.testimonials[idx] = t;
      this.save();
      return t;
    }
    return null;
  }

  public static deleteTestimonial(id: string) {
    this.initialize();
    if (!this.data.testimonials) this.data.testimonials = [];
    this.data.testimonials = this.data.testimonials.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // --- MENUS API ---
  public static getMenus() {
    this.initialize();
    return this.data.menus || [];
  }

  public static createMenu(m: MenuItem) {
    this.initialize();
    if (!this.data.menus) this.data.menus = [];
    this.data.menus.push(m);
    this.save();
    return m;
  }

  public static updateMenu(m: MenuItem) {
    this.initialize();
    if (!this.data.menus) this.data.menus = [];
    const idx = this.data.menus.findIndex(item => item.id === m.id);
    if (idx !== -1) {
      this.data.menus[idx] = m;
      this.save();
      return m;
    }
    return null;
  }

  public static deleteMenu(id: string) {
    this.initialize();
    if (!this.data.menus) this.data.menus = [];
    this.data.menus = this.data.menus.filter(m => m.id !== id);
    this.save();
    return true;
  }

  // --- RESTORE DB ---
  public static restoreDatabase(dump: any) {
    this.initialize();
    if (typeof dump === 'string') {
      try {
        const parsed = JSON.parse(dump);
        if (parsed && typeof parsed === 'object') {
          this.data = { ...this.data, ...parsed };
          this.save();
          return { success: true, type: 'json' };
        }
      } catch {
        // Fallback or custom text restore
      }
    } else if (dump && typeof dump === 'object') {
      this.data = { ...this.data, ...dump };
      this.save();
      return { success: true, type: 'json' };
    }
    return { success: false, error: 'Format tidak dikenal' };
  }
}
