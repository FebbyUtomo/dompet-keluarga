// Format angka dan tanggal berbahasa Indonesia.
const fmtAngka = new Intl.NumberFormat("id-ID");

export function rupiah(nilai) {
  return "Rp" + fmtAngka.format(Math.round(nilai));
}

// Bentuk ringkas: Rp7,2 jt atau Rp850 rb.
export function rupiahSingkat(nilai) {
  const n = Math.round(nilai);
  if (n >= 1000000) {
    const jt = n / 1000000;
    const teks = Number.isInteger(jt) ? String(jt) : jt.toFixed(1).replace(".", ",");
    return "Rp" + teks + " jt";
  }
  if (n >= 1000) {
    return "Rp" + fmtAngka.format(Math.round(n / 1000)) + " rb";
  }
  return "Rp" + fmtAngka.format(n);
}

const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const NAMA_BULAN_PANJANG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// "2026-11-02" -> "2 Nov 2026"
export function tanggalIndo(iso) {
  const [tahun, bulan, tanggal] = iso.split("-").map(Number);
  return tanggal + " " + NAMA_BULAN[bulan - 1] + " " + tahun;
}

// Nama bulan + tahun sekian bulan setelah bulan berjalan, mis. "Juli 2027".
export function bulanKeDepan(jumlahBulan, dariTanggal = new Date()) {
  const d = new Date(dariTanggal.getFullYear(), dariTanggal.getMonth() + jumlahBulan, 1);
  return NAMA_BULAN_PANJANG[d.getMonth()] + " " + d.getFullYear();
}

export function hanyaAngka(teks) {
  const n = Number(String(teks).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function persen(bagian, total) {
  if (!total) return 0;
  return Math.round((bagian / total) * 100);
}
