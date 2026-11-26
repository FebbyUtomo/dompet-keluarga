/* format.js — angka dan uang untuk DompetKeluarga.
   Satu-satunya tempat pemformatan Rupiah dan penguraian input angka,
   supaya semua halaman menampilkan uang dengan cara yang sama. */

export function rupiah(n) {
  const v = Math.round(Number(n) || 0);
  return 'Rp' + v.toLocaleString('id-ID');
}

export function rupiahShort(n) {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1e9) return 'Rp' + (v / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
  if (v >= 1e6) return 'Rp' + (v / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (v >= 1e3) return 'Rp' + (v / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' rb';
  return rupiah(v);
}

/* Mengurai angka dari input pengguna: "1.250.000" dan "1,5" sama-sama jalan. */
export function parseAmount(raw) {
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, Number(n) || 0));
}

export function pct(part, whole) {
  const w = Number(whole) || 0;
  if (w <= 0) return 0;
  return (Number(part) / w) * 100;
}

export function monthName(isoMonth) {
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const parts = String(isoMonth || '').split('-');
  const y = parts[0] || '';
  const m = Number(parts[1] || 1);
  return (names[m - 1] || '') + ' ' + y;
}

export function todayIso() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

/* Loloskan teks pengguna sebelum disisipkan ke HTML. */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
