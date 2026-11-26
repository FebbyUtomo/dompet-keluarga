/* data.js — isi contoh DompetKeluarga.
   Semua angka contoh adalah angka rumah tangga Indonesia yang realistis
   (penghasilan, belanja, utang, target tabungan) dan bisa diubah pengguna.
   Tidak ada data yang diambil dari luar: file ini satu-satunya sumber isi. */

export const CATEGORIES = [
  { id: 'belanja', label: 'Belanja Harian', color: '#2e7d4f' },
  { id: 'makan', label: 'Makan & Jajan', color: '#d97706' },
  { id: 'rumah', label: 'Rumah & Utilitas', color: '#2563eb' },
  { id: 'transport', label: 'Transportasi', color: '#7c3aed' },
  { id: 'anak', label: 'Anak & Sekolah', color: '#db2777' },
  { id: 'kesehatan', label: 'Kesehatan', color: '#0891b2' },
  { id: 'hiburan', label: 'Hiburan & Langganan', color: '#65a30d' },
  { id: 'lain', label: 'Lainnya', color: '#64748b' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* Keluarga contoh: suami-istri + satu anak, Yogyakarta. */
export const HOUSEHOLD = {
  name: 'Keluarga Andi & Maya',
  city: 'Yogyakarta',
  members: 3,
  salary: 8500000,
  sideIncome: 1200000,
  rent: 1500000,
  utilities: 550000,
  groceries: 2100000,
  transport: 750000,
  school: 900000,
};

export function householdIncome() {
  return HOUSEHOLD.salary + HOUSEHOLD.sideIncome;
}

export function householdMonthlyExpense() {
  return HOUSEHOLD.rent + HOUSEHOLD.utilities + HOUSEHOLD.groceries + HOUSEHOLD.transport + HOUSEHOLD.school;
}

/* Transaksi contoh bulan November 2026 untuk keluarga di atas. */
export const SAMPLE_TX = [
  { id: 't01', date: '2026-11-01', desc: 'Gaji bulanan Andi', cat: 'lain', amount: 8500000, kind: 'masuk' },
  { id: 't02', date: '2026-11-01', desc: 'Kontrakan rumah November', cat: 'rumah', amount: 1500000, kind: 'keluar' },
  { id: 't03', date: '2026-11-02', desc: 'Belanja sayur di pasar pagi', cat: 'belanja', amount: 385000, kind: 'keluar' },
  { id: 't04', date: '2026-11-03', desc: 'Token listrik + iuran air', cat: 'rumah', amount: 310000, kind: 'keluar' },
  { id: 't05', date: '2026-11-04', desc: 'Bensin motor & parkir', cat: 'transport', amount: 125000, kind: 'keluar' },
  { id: 't06', date: '2026-11-05', desc: 'SPP sekolah Raka', cat: 'anak', amount: 550000, kind: 'keluar' },
  { id: 't07', date: '2026-11-06', desc: 'Jualan tanaman hias Maya', cat: 'lain', amount: 600000, kind: 'masuk' },
  { id: 't08', date: '2026-11-08', desc: 'Belanja bulanan minimarket', cat: 'belanja', amount: 745000, kind: 'keluar' },
  { id: 't09', date: '2026-11-09', desc: 'Makan malam di warung langganan', cat: 'makan', amount: 185000, kind: 'keluar' },
  { id: 't10', date: '2026-11-11', desc: 'WiFi rumah + paket data', cat: 'rumah', amount: 285000, kind: 'keluar' },
  { id: 't11', date: '2026-11-13', desc: 'Buku gambar & crayon Raka', cat: 'anak', amount: 145000, kind: 'keluar' },
  { id: 't12', date: '2026-11-14', desc: 'Periksa gigi + obat', cat: 'kesehatan', amount: 410000, kind: 'keluar' },
  { id: 't13', date: '2026-11-16', desc: 'Langganan film + musik', cat: 'hiburan', amount: 99000, kind: 'keluar' },
  { id: 't14', date: '2026-11-18', desc: 'Belanja sayur di pasar pagi', cat: 'belanja', amount: 360000, kind: 'keluar' },
  { id: 't15', date: '2026-11-20', desc: 'Jualan tanaman hias Maya', cat: 'lain', amount: 600000, kind: 'masuk' },
  { id: 't16', date: '2026-11-22', desc: 'Ganti oli + servis motor', cat: 'transport', amount: 235000, kind: 'keluar' },
  { id: 't17', date: '2026-11-24', desc: 'Kopi & camilan sore', cat: 'makan', amount: 120000, kind: 'keluar' },
  { id: 't18', date: '2026-11-25', desc: 'Setoran ke dana darurat', cat: 'lain', amount: 900000, kind: 'keluar' },
];

export const DEFAULT_DEBTS = [
  { id: 'd1', name: 'Kartu Kredit Bank B', balance: 3800000, rate: 27, minPay: 200000 },
  { id: 'd2', name: 'PayLater Belanja', balance: 1500000, rate: 21, minPay: 250000 },
  { id: 'd3', name: 'Kredit Motor', balance: 9000000, rate: 9, minPay: 400000 },
];

export const TIPS = [
  {
    id: 'p1',
    title: 'Pakai 50/30/20 sebagai titik awal, bukan hukum',
    body: 'Bagi penghasilan bersih jadi tiga: 50% kebutuhan, 30% keinginan, 20% tabungan dan utang. Kalau kontrakanmu sudah 30% dari gaji, jangan memaksa angka 50% — potong keinginan ke 20% dulu, lalu naikkan tabungan 1% tiap bulan. Anggaran yang bertahan adalah anggaran yang jujur dengan keadaanmu.',
    figure: 'Contoh: gaji Rp9.700.000 → kebutuhan Rp4.850.000, keinginan Rp2.910.000, tabungan Rp1.940.000.',
  },
  {
    id: 'p2',
    title: 'Dana darurat dulu, investasi belakangan',
    body: 'Sebelum membeli saham atau reksa dana, kumpulkan dana darurat 3–6 kali pengeluaran bulanan di rekening terpisah yang mudah dicairkan. Keluarga dengan pengeluaran Rp5.800.000 per bulan butuh Rp17.400.000–Rp34.800.000. Dana inilah yang membuat ban motor pecah atau gaji telat tidak berubah jadi utang kartu kredit.',
    figure: 'Tonggak yang realistis: Rp1.000.000 pertama, lalu Rp5.000.000, lalu 1 bulan pengeluaran.',
  },
  {
    id: 'p3',
    title: 'Catat pengeluaran 30 hari tanpa menghakimi',
    body: 'Sebulan penuh, catat setiap rupiah yang keluar — termasuk parkir Rp2.000 dan gorengan Rp10.000. Jangan mengubah kebiasaan dulu. Setelah 30 hari, total per kategori akan menunjukkan sendiri kebocorannya: biasanya makan di luar dan langganan yang sudah lupa dipakai.',
    figure: 'Rata-rata keluarga menemukan Rp400.000–Rp800.000 per bulan yang "hilang" tanpa jejak.',
  },
  {
    id: 'p4',
    title: 'Serang utang dari bunga tertinggi dulu',
    body: 'Metode avalanche: bayar minimum semua utang, lalu kerahkan dana ekstra ke utang dengan bunga paling tinggi. Kartu kredit 27% per tahun menghabiskan uang jauh lebih cepat daripada kredit motor 9%. Snowball (lunasi saldo terkecil dulu) boleh dipilih kalau kamu butuh kemenangan cepat agar semangat bertahan.',
    figure: 'Utang Rp3.800.000 bunga 27% yang hanya dibayar minimum bisa bertahan lebih dari 2 tahun.',
  },
  {
    id: 'p5',
    title: 'Satu rekening, satu tugas',
    body: 'Pisahkan uang dengan rekening berbeda: rekening gaji untuk kebutuhan, rekening kedua untuk tabungan otomatis, dan dompet digital dengan saldo terbatas untuk jajan. Uang yang tidak terlihat di rekening utama jauh lebih sulit dibelanjakan impulsif.',
    figure: 'Atur autodebet tabungan di tanggal gajian — bayar dirimu sendiri sebelum yang lain.',
  },
  {
    id: 'p6',
    title: 'Rapat anggaran 15 menit tiap Minggu',
    body: 'Sekali seminggu, duduk bersama pasangan dan lihat tiga angka: sisa anggaran tiap kategori, tagihan yang jatuh tempo minggu depan, dan satu pengeluaran yang bisa dipangkas. Rapat singkat yang rutin mengalahkan perencanaan tahunan yang tidak pernah dibuka lagi.',
    figure: 'Waktu: Minggu malam, 15 menit, setelah anak tidur. Agenda: sisa saldo, tagihan, satu penghematan.',
  },
];
