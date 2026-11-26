// Data contoh keluarga Andi & Maya — semua angka dibuat untuk demo situs ini.
export const KELUARGA = {
  kepala: "Andi",
  pasangan: "Maya",
  kota: "Yogyakarta",
  anggota: 4,
  penghasilan: 12000000,
};

export const ALOKASI_DEFAULT = { kebutuhan: 50, keinginan: 30, tabungan: 20 };

export const KATEGORI = [
  { id: "makan", label: "Makan", warna: "#c96f3f" },
  { id: "transportasi", label: "Transportasi", warna: "#3f7d9e" },
  { id: "belanja", label: "Belanja Harian", warna: "#7a9e3f" },
  { id: "tagihan", label: "Tagihan", warna: "#8a5f9e" },
  { id: "hiburan", label: "Hiburan", warna: "#d9a441" },
  { id: "kesehatan", label: "Kesehatan", warna: "#4f9e7d" },
];

// 18 transaksi contoh November 2026. Total: Rp7.217.000.
export const TRANSAKSI_AWAL = [
  { id: "t01", tanggal: "2026-11-01", deskripsi: "Beras 10 kg", kategori: "belanja", jumlah: 132000 },
  { id: "t02", tanggal: "2026-11-01", deskripsi: "Sewa kontrakan", kategori: "tagihan", jumlah: 2500000 },
  { id: "t03", tanggal: "2026-11-02", deskripsi: "Nasi padang berdua", kategori: "makan", jumlah: 52000 },
  { id: "t04", tanggal: "2026-11-02", deskripsi: "Belanja bulanan supermarket", kategori: "belanja", jumlah: 1250000 },
  { id: "t05", tanggal: "2026-11-03", deskripsi: "Belanja sayur & lauk pasar", kategori: "makan", jumlah: 185000 },
  { id: "t06", tanggal: "2026-11-03", deskripsi: "Langganan streaming", kategori: "hiburan", jumlah: 65000 },
  { id: "t07", tanggal: "2026-11-04", deskripsi: "Bensin motor", kategori: "transportasi", jumlah: 120000 },
  { id: "t08", tanggal: "2026-11-05", deskripsi: "Sarapan & kopi pagi", kategori: "makan", jumlah: 78000 },
  { id: "t09", tanggal: "2026-11-05", deskripsi: "Internet rumah", kategori: "tagihan", jumlah: 275000 },
  { id: "t10", tanggal: "2026-11-06", deskripsi: "Listrik PLN", kategori: "tagihan", jumlah: 450000 },
  { id: "t11", tanggal: "2026-11-06", deskripsi: "Air PDAM", kategori: "tagihan", jumlah: 145000 },
  { id: "t12", tanggal: "2026-11-07", deskripsi: "Ojek online", kategori: "transportasi", jumlah: 95000 },
  { id: "t13", tanggal: "2026-11-08", deskripsi: "Makan malam keluarga", kategori: "makan", jumlah: 240000 },
  { id: "t14", tanggal: "2026-11-09", deskripsi: "Minyak & bumbu dapur", kategori: "belanja", jumlah: 92000 },
  { id: "t15", tanggal: "2026-11-09", deskripsi: "Nonton bioskop", kategori: "hiburan", jumlah: 160000 },
  { id: "t16", tanggal: "2026-11-10", deskripsi: "Sabun, sampo & deterjen", kategori: "belanja", jumlah: 118000 },
  { id: "t17", tanggal: "2026-11-10", deskripsi: "Cicilan motor", kategori: "tagihan", jumlah: 1150000 },
  { id: "t18", tanggal: "2026-11-12", deskripsi: "Vitamin & obat", kategori: "kesehatan", jumlah: 110000 },
];

// Utang contoh. Disusun supaya snowball dan avalanche memberi hasil berbeda:
// saldo terkecil (koperasi) bunganya paling rendah, bunga tertinggi (kartu kredit)
// ada di saldo menengah.
export const UTANG_AWAL = [
  { id: "u1", nama: "Pinjaman koperasi", pokok: 3000000, bunga: 6, cicilan: 300000 },
  { id: "u2", nama: "Kartu kredit", pokok: 6000000, bunga: 24, cicilan: 600000 },
  { id: "u3", nama: "Cicilan motor", pokok: 12000000, bunga: 12, cicilan: 1200000 },
];

export const TABUNGAN_AWAL = { target: 10000000, setoran: 500000, saldoAwal: 0 };

export const TIPS = [
  {
    judul: "Bayar diri sendiri dulu",
    isi: "Begitu gajian masuk, pindahkan jatah tabungan ke rekening terpisah sebelum belanja apa pun. Uang yang tidak terlihat tidak akan terbelanjakan.",
  },
  {
    judul: "Catat setiap pengeluaran",
    isi: "Sekecil apa pun — kopi, parkir, jajan. Kebocoran anggaran hampir selalu berasal dari pengeluaran kecil yang tidak tercatat.",
  },
  {
    judul: "Pisahkan rekening",
    isi: "Satu rekening untuk belanja harian, satu untuk tagihan, satu untuk tabungan. Kalau tercampur, batasnya jadi kabur.",
  },
  {
    judul: "Belanja dengan daftar",
    isi: "Tulis daftar sebelum berangkat ke pasar atau supermarket, dan jangan belanja dalam keadaan lapar. Keduanya memotong belanja impulsif.",
  },
  {
    judul: "Jadwalkan tagihan besar berjauhan",
    isi: "Sewa, cicilan, dan listrik jatuh di tanggal berbeda supaya kas tidak habis dalam satu minggu yang sama.",
  },
  {
    judul: "Evaluasi tiap akhir bulan",
    isi: "Bandingkan rencana dan realisasi selama 15 menit. Geser alokasi bulan depan berdasarkan apa yang benar-benar terjadi, bukan berdasarkan harapan.",
  },
];

export const FAQ = [
  {
    q: "Berapa persen penghasilan yang ideal untuk ditabung?",
    a: "Patokan umum adalah 20% dari penghasilan, sesuai aturan 50/30/20. Kalau belum sanggup, mulai dari 10% dan naikkan 1–2% tiap dua bulan — konsistensi lebih penting daripada angka awal.",
  },
  {
    q: "Apa bedanya kebutuhan dan keinginan?",
    a: "Kebutuhan adalah yang membuat rumah tangga berjalan: makan, tempat tinggal, transportasi, tagihan wajib, dan kesehatan. Keinginan adalah yang membuat hidup menyenangkan tapi bisa ditunda: hiburan, makan di luar, dan langganan tambahan.",
  },
  {
    q: "Dana darurat sebaiknya berapa?",
    a: "Untuk keluarga dengan satu sumber penghasilan, 6 bulan pengeluaran. Dengan dua penghasilan, 3 bulan biasanya cukup. Untuk keluarga contoh di situs ini, itu berarti sekitar Rp20–40 juta.",
  },
  {
    q: "Snowball atau avalanche — mana yang lebih baik?",
    a: "Avalanche lebih hemat bunga karena menyerang bunga tertinggi dulu. Snowball memberi kemenangan cepat karena utang terkecil lunas lebih dulu, dan itu membantu bertahan. Pilih yang membuatmu tidak berhenti di tengah jalan.",
  },
  {
    q: "Apakah data saya tersimpan di server?",
    a: "Tidak. Semua angka yang kamu ubah hanya tersimpan di browser kamu sendiri (localStorage). Tidak ada akun, tidak ada data yang dikirim ke mana pun.",
  },
];
