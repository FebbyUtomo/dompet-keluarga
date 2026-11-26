// Router hash + state aplikasi DompetKeluarga.
import { KELUARGA, TRANSAKSI_AWAL, UTANG_AWAL, ALOKASI_DEFAULT, TABUNGAN_AWAL } from "./data.js";
import {
  htmlBeranda, pasangBeranda,
  htmlAnggaran, pasangAnggaran,
  htmlPelacak, pasangPelacak,
  htmlTabungan, pasangTabungan,
  htmlUtang, pasangUtang,
  htmlPanduan, pasangPanduan,
} from "./views.js";

const KUNCI = "dompetkeluarga-v2";

function benihState() {
  return {
    penghasilan: KELUARGA.penghasilan,
    alokasi: { ...ALOKASI_DEFAULT },
    transaksi: TRANSAKSI_AWAL.map((t) => ({ ...t })),
    tabungan: { ...TABUNGAN_AWAL },
    utang: UTANG_AWAL.map((u) => ({ ...u })),
    anggaranUtang: 3000000,
  };
}

function muatState() {
  try {
    const mentah = localStorage.getItem(KUNCI);
    if (!mentah) return benihState();
    const data = JSON.parse(mentah);
    const benih = benihState();
    return { ...benih, ...data };
  } catch (e) {
    return benihState();
  }
}

let state = muatState();

function simpan() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(state));
  } catch (e) {
    // Penyimpanan penuh atau diblokir — situs tetap jalan tanpa menyimpan.
  }
}

const RUTE = {
  beranda: { judul: "Beranda", html: htmlBeranda, pasang: pasangBeranda },
  anggaran: { judul: "Kalkulator Anggaran", html: htmlAnggaran, pasang: pasangAnggaran },
  pelacak: { judul: "Pelacak Pengeluaran", html: htmlPelacak, pasang: pasangPelacak },
  tabungan: { judul: "Perencana Tabungan", html: htmlTabungan, pasang: pasangTabungan },
  utang: { judul: "Kalkulator Lunasi Utang", html: htmlUtang, pasang: pasangUtang },
  panduan: { judul: "Panduan & Tips", html: htmlPanduan, pasang: pasangPanduan },
};

function ruteAktif() {
  const hash = location.hash.replace(/^#\/?/, "");
  return RUTE[hash] ? hash : "beranda";
}

function tampilkan() {
  const kunci = ruteAktif();
  const halaman = RUTE[kunci];
  document.querySelectorAll(".nav-tautan").forEach((a) => {
    a.classList.toggle("aktif", a.dataset.rute === kunci);
  });
  const wadah = document.getElementById("app");
  wadah.innerHTML = halaman.html(state);
  halaman.pasang(wadah, { state, simpan, tampilkanUlang: tampilkan });
  document.title = "DompetKeluarga — " + halaman.judul;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", tampilkan);
tampilkan();
