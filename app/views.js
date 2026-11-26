// Tampilan tiap halaman: HTML + wiring. State datang dari main.js.
import { rupiah, rupiahSingkat, tanggalIndo, bulanKeDepan } from "./format.js";
import { gambarDonat, gambarBatang, gambarProyeksi } from "./charts.js";
import { KATEGORI, TRANSAKSI_AWAL, TIPS, FAQ, KELUARGA } from "./data.js";

function esc(teks) {
  return String(teks).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function labelKategori(id) {
  const k = KATEGORI.find((x) => x.id === id);
  return k ? k.label : id;
}

function warnaKategori(id) {
  const k = KATEGORI.find((x) => x.id === id);
  return k ? k.warna : "#6b7268";
}

function totalTransaksi(daftar) {
  return daftar.reduce((s, t) => s + t.jumlah, 0);
}

// ---------- simulasi pelunasan utang ----------
// Setiap bulan: bunga menumpuk, cicilan minimum dibayar semua utang, lalu sisa
// anggaran (ekstra) dialirkan ke satu target: saldo terkecil (snowball) atau
// bunga tertinggi (avalanche).
export function simulasiUtang(daftar, anggaranBulanan, metode) {
  const utang = daftar.map((u) => ({ ...u, sisa: u.pokok }));
  const pokokTotal = daftar.reduce((s, u) => s + u.pokok, 0);
  let terbayar = 0;
  let bulan = 0;
  while (utang.some((u) => u.sisa > 0.005) && bulan < 600) {
    bulan += 1;
    for (const u of utang) {
      if (u.sisa > 0) u.sisa += (u.sisa * u.bunga) / 100 / 12;
    }
    let minimumTerbayar = 0;
    for (const u of utang) {
      if (u.sisa <= 0) continue;
      const bayar = Math.min(u.cicilan, u.sisa);
      u.sisa -= bayar;
      minimumTerbayar += bayar;
      terbayar += bayar;
    }
    let ekstra = anggaranBulanan - minimumTerbayar;
    while (ekstra > 0.005) {
      const aktif = utang.filter((u) => u.sisa > 0.005);
      if (!aktif.length) break;
      let target;
      if (metode === "snowball") {
        target = aktif.reduce((a, b) => (a.sisa <= b.sisa ? a : b));
      } else {
        target = aktif.reduce((a, b) => (a.bunga >= b.bunga ? a : b));
      }
      const bayar = Math.min(ekstra, target.sisa);
      target.sisa -= bayar;
      ekstra -= bayar;
      terbayar += bayar;
    }
  }
  return {
    bulan,
    totalBunga: Math.max(0, terbayar - pokokTotal),
    lunas: !utang.some((u) => u.sisa > 0.005),
  };
}

// ---------- BERANDA ----------
export function htmlBeranda(st) {
  const keluar = totalTransaksi(st.transaksi);
  const sisa = st.penghasilan - keluar;
  const tabunganBulan = Math.round((st.penghasilan * st.alokasi.tabungan) / 100);
  const limaBesar = [...st.transaksi].sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);
  const maks = limaBesar.length ? limaBesar[0].jumlah : 1;
  const barisLima = limaBesar.map((t, i) => {
    const lebar = Math.max(4, Math.round((t.jumlah / maks) * 100));
    return "<li><span class=\"peringkat\">" + (i + 1) + "</span><span><strong>" + esc(t.deskripsi) + "</strong><br><small>" +
      tanggalIndo(t.tanggal) + " · " + labelKategori(t.kategori) + "</small><span class=\"batang-latar\" style=\"display:block\"><span class=\"batang-isi\" style=\"display:block;width:" +
      lebar + "%\"></span></span></span><strong>" + rupiah(t.jumlah) + "</strong></li>";
  }).join("");
  return "<h1>Ringkasan Keuangan Keluarga</h1>" +
    "<p class=\"intro\">Keluarga " + esc(KELUARGA.kepala) + " &amp; " + esc(KELUARGA.pasangan) + ", " + esc(KELUARGA.kota) +
    " — " + KELUARGA.anggota + " anggota keluarga. Angka di bawah ini memakai contoh bulan November 2026.</p>" +
    "<div class=\"bariskpi\">" +
    "<div class=\"kpi\"><div class=\"kpi-label\">Penghasilan</div><div class=\"kpi-nilai\">" + rupiah(st.penghasilan) + "</div><div class=\"kpi-sub\">per bulan</div></div>" +
    "<div class=\"kpi\"><div class=\"kpi-label\">Pengeluaran</div><div class=\"kpi-nilai\">" + rupiah(keluar) + "</div><div class=\"kpi-sub\">November 2026 · " + st.transaksi.length + " transaksi</div></div>" +
    "<div class=\"kpi\"><div class=\"kpi-label\">Sisa</div><div class=\"kpi-nilai\">" + rupiah(sisa) + "</div><div class=\"kpi-sub\">penghasilan dikurangi pengeluaran</div></div>" +
    "<div class=\"kpi\"><div class=\"kpi-label\">Tabungan bulan ini</div><div class=\"kpi-nilai\">" + rupiah(tabunganBulan) + "</div><div class=\"kpi-sub\">" + st.alokasi.tabungan + "% dari penghasilan</div></div>" +
    "</div>" +
    "<div class=\"dua-kolom\">" +
    "<section class=\"kartu\"><h2>Alokasi 50/30/20</h2>" +
    "<div class=\"donat-bungkus\"><canvas id=\"donat-alokasi\" width=\"220\" height=\"220\" aria-label=\"Diagram donat alokasi anggaran\"></canvas>" +
    "<ul class=\"legenda\">" +
    "<li><span class=\"swatch\" style=\"background:#1f6b4a\"></span><span class=\"leg-nama\">Kebutuhan</span><span class=\"leg-nilai\">" + st.alokasi.kebutuhan + "% · " + rupiah((st.penghasilan * st.alokasi.kebutuhan) / 100) + "</span></li>" +
    "<li><span class=\"swatch\" style=\"background:#d9a441\"></span><span class=\"leg-nama\">Keinginan</span><span class=\"leg-nilai\">" + st.alokasi.keinginan + "% · " + rupiah((st.penghasilan * st.alokasi.keinginan) / 100) + "</span></li>" +
    "<li><span class=\"swatch\" style=\"background:#3f7d9e\"></span><span class=\"leg-nama\">Tabungan</span><span class=\"leg-nilai\">" + st.alokasi.tabungan + "% · " + rupiah((st.penghasilan * st.alokasi.tabungan) / 100) + "</span></li>" +
    "</ul></div>" +
    "<p><small>Geser alokasinya di halaman Kalkulator Anggaran — donat ini ikut berubah.</small></p></section>" +
    "<section class=\"kartu\"><h2>5 Pengeluaran Terbesar</h2><ol class=\"daftar-urut\">" + barisLima + "</ol>" +
    "<p><small>Lihat semuanya di halaman Pelacak Pengeluaran.</small></p></section>" +
    "</div>";
}

export function pasangBeranda(el, ctx) {
  const { state } = ctx;
  const kanvas = el.querySelector("#donat-alokasi");
  if (kanvas) {
    gambarDonat(kanvas, [
      { label: "Kebutuhan", nilai: (state.penghasilan * state.alokasi.kebutuhan) / 100, warna: "#1f6b4a" },
      { label: "Keinginan", nilai: (state.penghasilan * state.alokasi.keinginan) / 100, warna: "#d9a441" },
      { label: "Tabungan", nilai: (state.penghasilan * state.alokasi.tabungan) / 100, warna: "#3f7d9e" },
    ]);
  }
}

// ---------- KALKULATOR ANGGARAN ----------
export function htmlAnggaran(st) {
  return "<h1>Kalkulator Anggaran 50/30/20</h1>" +
    "<p class=\"intro\">Atur penghasilan dan geser alokasinya. Keinginan dihitung otomatis supaya total selalu 100%.</p>" +
    "<div class=\"dua-kolom\">" +
    "<section class=\"kartu\"><h2>Atur Anggaran</h2>" +
    "<div class=\"form-grid\">" +
    "<div class=\"lebar\"><label for=\"input-penghasilan\">Penghasilan per bulan (Rp)</label>" +
    "<input type=\"number\" id=\"input-penghasilan\" min=\"0\" step=\"1000\" value=\"" + st.penghasilan + "\"></div>" +
    "<div class=\"lebar\"><label for=\"geser-kebutuhan\">Kebutuhan — <span class=\"slider-nilai\" id=\"nilai-kebutuhan\">" + st.alokasi.kebutuhan + "%</span></label>" +
    "<input type=\"range\" id=\"geser-kebutuhan\" min=\"0\" max=\"80\" step=\"5\" value=\"" + st.alokasi.kebutuhan + "\"></div>" +
    "<div class=\"lebar\"><label for=\"geser-tabungan\">Tabungan — <span class=\"slider-nilai\" id=\"nilai-tabungan\">" + st.alokasi.tabungan + "%</span></label>" +
    "<input type=\"range\" id=\"geser-tabungan\" min=\"0\" max=\"50\" step=\"5\" value=\"" + st.alokasi.tabungan + "\"></div>" +
    "<div class=\"lebar\"><p>Keinginan: <strong id=\"nilai-keinginan\">" + st.alokasi.keinginan + "%</strong> (otomatis, sisa dari 100%)</p></div>" +
    "</div></section>" +
    "<section class=\"kartu\"><h2>Hasilnya</h2>" +
    "<ul class=\"legenda\">" +
    "<li><span class=\"swatch\" style=\"background:#1f6b4a\"></span><span class=\"leg-nama\">Kebutuhan</span><span class=\"leg-nilai\" id=\"nom-kebutuhan\">" + rupiah((st.penghasilan * st.alokasi.kebutuhan) / 100) + "</span></li>" +
    "<li><span class=\"swatch\" style=\"background:#d9a441\"></span><span class=\"leg-nama\">Keinginan</span><span class=\"leg-nilai\" id=\"nom-keinginan\">" + rupiah((st.penghasilan * st.alokasi.keinginan) / 100) + "</span></li>" +
    "<li><span class=\"swatch\" style=\"background:#3f7d9e\"></span><span class=\"leg-nama\">Tabungan</span><span class=\"leg-nilai\" id=\"nom-tabungan\">" + rupiah((st.penghasilan * st.alokasi.tabungan) / 100) + "</span></li>" +
    "</ul>" +
    "<div id=\"verdict\" class=\"verdict\" style=\"margin-top:1rem\"></div>" +
    "<p><small>Perubahan tersimpan otomatis di browser kamu.</small></p></section>" +
    "</div>";
}

export function pasangAnggaran(el, ctx) {
  const { state, simpan } = ctx;
  const inputGaji = el.querySelector("#input-penghasilan");
  const geserButuh = el.querySelector("#geser-kebutuhan");
  const geserTabung = el.querySelector("#geser-tabungan");
  const verdict = el.querySelector("#verdict");
  function segarkan() {
    const k = Number(geserButuh.value);
    let t = Number(geserTabung.value);
    if (k + t > 100) {
      t = 100 - k;
      geserTabung.value = String(t);
    }
    const i = 100 - k - t;
    state.penghasilan = Number(inputGaji.value) || 0;
    state.alokasi = { kebutuhan: k, keinginan: i, tabungan: t };
    el.querySelector("#nilai-kebutuhan").textContent = k + "%";
    el.querySelector("#nilai-tabungan").textContent = t + "%";
    el.querySelector("#nilai-keinginan").textContent = i + "%";
    el.querySelector("#nom-kebutuhan").textContent = rupiah((state.penghasilan * k) / 100);
    el.querySelector("#nom-keinginan").textContent = rupiah((state.penghasilan * i) / 100);
    el.querySelector("#nom-tabungan").textContent = rupiah((state.penghasilan * t) / 100);
    if (t >= 20) {
      verdict.className = "verdict";
      verdict.innerHTML = "<strong>Sehat.</strong> Tabungan " + t + "% sudah di jalur ideal — dana darurat dan tujuan lain bisa terkumpul sesuai rencana.";
    } else if (t >= 10) {
      verdict.className = "verdict waspada";
      verdict.innerHTML = "<strong>Cukup, tapi bisa lebih baik.</strong> Tabungan " + t + "% masih di bawah patokan 20%. Coba naikkan 1–2% tiap dua bulan.";
    } else {
      verdict.className = "verdict bahaya";
      verdict.innerHTML = "<strong>Perlu penyesuaian.</strong> Tabungan di bawah 10% membuat dana darurat sulit terkumpul. Lihat lagi pos keinginan — biasanya ada yang bisa dipangkas.";
    }
    simpan();
  }
  inputGaji.addEventListener("input", segarkan);
  geserButuh.addEventListener("input", segarkan);
  geserTabung.addEventListener("input", segarkan);
  segarkan();
}

// ---------- PELACAK PENGELUARAN ----------
let filterKategori = "semua";
let cariTeks = "";
let ubahId = null;

export function htmlPelacak(st) {
  const opsiKategori = KATEGORI.map((k) => "<option value=\"" + k.id + "\">" + k.label + "</option>").join("");
  return "<h1>Pelacak Pengeluaran</h1>" +
    "<p class=\"intro\">Catat, ubah, dan hapus transaksi. Semua tersimpan di browser kamu.</p>" +
    "<section class=\"kartu\"><h2>Ringkasan November 2026</h2>" +
    "<p>Total pengeluaran: <strong id=\"total-semua\">" + rupiah(totalTransaksi(st.transaksi)) + "</strong> dari <span id=\"jumlah-semua\">" + st.transaksi.length + "</span> transaksi.</p>" +
    "<canvas id=\"grafik-kategori\" class=\"grafik-kecil\" aria-label=\"Grafik pengeluaran per kategori\"></canvas></section>" +
    "<div class=\"dua-kolom\">" +
    "<section class=\"kartu\"><h2>Tambah Transaksi</h2>" +
    "<form id=\"form-transaksi\"><div class=\"form-grid\">" +
    "<div><label for=\"form-tanggal\">Tanggal</label><input type=\"date\" id=\"form-tanggal\" value=\"2026-11-15\" required></div>" +
    "<div><label for=\"form-kategori\">Kategori</label><select id=\"form-kategori\">" + opsiKategori + "</select></div>" +
    "<div class=\"lebar\"><label for=\"form-deskripsi\">Deskripsi</label><input type=\"text\" id=\"form-deskripsi\" placeholder=\"Contoh: Belanja sayur pasar\" required></div>" +
    "<div class=\"lebar\"><label for=\"form-jumlah\">Jumlah (Rp)</label><input type=\"number\" id=\"form-jumlah\" min=\"1\" step=\"1\" placeholder=\"50000\" required></div>" +
    "</div>" +
    "<p id=\"form-pesan\" style=\"color:#a33d2a;min-height:1.2em\"></p>" +
    "<button class=\"tombol\" type=\"submit\" id=\"tombol-simpan-transaksi\">Tambah transaksi</button> " +
    "<button class=\"tombol-kecil\" type=\"button\" id=\"tombol-batal-ubah\" hidden>Batal ubah</button>" +
    "</form></section>" +
    "<section class=\"kartu\"><h2>Daftar Transaksi</h2>" +
    "<div class=\"form-grid\" style=\"grid-template-columns:1fr 1fr\">" +
    "<div><label for=\"filter-kategori\">Filter kategori</label><select id=\"filter-kategori\"><option value=\"semua\">Semua kategori</option>" + opsiKategori + "</select></div>" +
    "<div><label for=\"cari-transaksi\">Cari</label><input type=\"search\" id=\"cari-transaksi\" placeholder=\"Cari deskripsi…\"></div>" +
    "</div>" +
    "<p><small id=\"info-terfilter\"></small></p>" +
    "<table class=\"tabel\"><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th class=\"jumlah\">Jumlah</th><th></th></tr></thead>" +
    "<tbody id=\"daftar-transaksi\"></tbody></table>" +
    "<p style=\"margin-top:0.8rem\"><button class=\"tombol-kecil\" type=\"button\" id=\"tombol-reset-contoh\">Kembalikan 18 contoh awal</button></p>" +
    "</section></div>";
}

function gambarDaftar(el, ctx) {
  const { state, simpan } = ctx;
  const daftar = state.transaksi
    .filter((t) => (filterKategori === "semua" || t.kategori === filterKategori))
    .filter((t) => !cariTeks || t.deskripsi.toLowerCase().includes(cariTeks))
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  const badan = el.querySelector("#daftar-transaksi");
  if (!daftar.length) {
    badan.innerHTML = "<tr><td colspan=\"5\" class=\"kosong\">Tidak ada transaksi yang cocok.</td></tr>";
  } else {
    badan.innerHTML = daftar.map((t) => "<tr><td>" + tanggalIndo(t.tanggal) + "</td><td>" + esc(t.deskripsi) + "</td>" +
      "<td><span class=\"cip\" style=\"background:" + warnaKategori(t.kategori) + "\">" + labelKategori(t.kategori) + "</span></td>" +
      "<td class=\"jumlah\">" + rupiah(t.jumlah) + "</td>" +
      "<td><div class=\"aksi-sel\"><button class=\"tombol-kecil\" type=\"button\" data-ubah=\"" + t.id + "\">Ubah</button>" +
      "<button class=\"tombol-kecil bahaya\" type=\"button\" data-hapus=\"" + t.id + "\">Hapus</button></div></td></tr>").join("");
  }
  el.querySelector("#info-terfilter").textContent = "Menampilkan " + daftar.length + " dari " + state.transaksi.length + " transaksi.";
  el.querySelector("#total-semua").textContent = rupiah(totalTransaksi(state.transaksi));
  el.querySelector("#jumlah-semua").textContent = String(state.transaksi.length);
  const perKategori = KATEGORI.map((k) => ({
    label: k.label,
    nilai: state.transaksi.filter((t) => t.kategori === k.id).reduce((s, t) => s + t.jumlah, 0),
    warna: k.warna,
  })).filter((b) => b.nilai > 0);
  gambarBatang(el.querySelector("#grafik-kategori"), perKategori);
  simpan();
}

export function pasangPelacak(el, ctx) {
  const { state } = ctx;
  ubahId = null;
  const form = el.querySelector("#form-transaksi");
  const pesan = el.querySelector("#form-pesan");
  const tombolSimpan = el.querySelector("#tombol-simpan-transaksi");
  const tombolBatal = el.querySelector("#tombol-batal-ubah");
  el.querySelector("#filter-kategori").value = filterKategori;
  el.querySelector("#cari-transaksi").value = cariTeks;
  el.querySelector("#filter-kategori").addEventListener("change", (e) => {
    filterKategori = e.target.value;
    gambarDaftar(el, ctx);
  });
  el.querySelector("#cari-transaksi").addEventListener("input", (e) => {
    cariTeks = e.target.value.trim().toLowerCase();
    gambarDaftar(el, ctx);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const tanggal = el.querySelector("#form-tanggal").value;
    const deskripsi = el.querySelector("#form-deskripsi").value.trim();
    const kategori = el.querySelector("#form-kategori").value;
    const jumlah = Number(el.querySelector("#form-jumlah").value);
    if (!tanggal || !deskripsi || !(jumlah > 0)) {
      pesan.textContent = "Isi tanggal, deskripsi, dan jumlah lebih dari 0.";
      return;
    }
    pesan.textContent = "";
    if (ubahId) {
      const t = state.transaksi.find((x) => x.id === ubahId);
      if (t) {
        t.tanggal = tanggal;
        t.deskripsi = deskripsi;
        t.kategori = kategori;
        t.jumlah = jumlah;
      }
      ubahId = null;
      tombolSimpan.textContent = "Tambah transaksi";
      tombolBatal.hidden = true;
    } else {
      state.transaksi.push({ id: "t" + Date.now(), tanggal, deskripsi, kategori, jumlah });
    }
    form.reset();
    el.querySelector("#form-tanggal").value = "2026-11-15";
    gambarDaftar(el, ctx);
  });
  tombolBatal.addEventListener("click", () => {
    ubahId = null;
    form.reset();
    el.querySelector("#form-tanggal").value = "2026-11-15";
    tombolSimpan.textContent = "Tambah transaksi";
    tombolBatal.hidden = true;
  });
  el.querySelector("#daftar-transaksi").addEventListener("click", (e) => {
    const tombolUbah = e.target.closest("[data-ubah]");
    const tombolHapus = e.target.closest("[data-hapus]");
    if (tombolUbah) {
      const t = state.transaksi.find((x) => x.id === tombolUbah.dataset.ubah);
      if (!t) return;
      ubahId = t.id;
      el.querySelector("#form-tanggal").value = t.tanggal;
      el.querySelector("#form-deskripsi").value = t.deskripsi;
      el.querySelector("#form-kategori").value = t.kategori;
      el.querySelector("#form-jumlah").value = String(t.jumlah);
      tombolSimpan.textContent = "Simpan perubahan";
      tombolBatal.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (tombolHapus) {
      state.transaksi = state.transaksi.filter((x) => x.id !== tombolHapus.dataset.hapus);
      if (ubahId === tombolHapus.dataset.hapus) {
        ubahId = null;
        form.reset();
        tombolSimpan.textContent = "Tambah transaksi";
        tombolBatal.hidden = true;
      }
      gambarDaftar(el, ctx);
    }
  });
  el.querySelector("#tombol-reset-contoh").addEventListener("click", () => {
    state.transaksi = TRANSAKSI_AWAL.map((t) => ({ ...t }));
    gambarDaftar(el, ctx);
  });
  gambarDaftar(el, ctx);
}

// ---------- PERENCANA TABUNGAN ----------
export function htmlTabungan(st) {
  return "<h1>Perencana Tabungan &amp; Dana Darurat</h1>" +
    "<p class=\"intro\">Tentukan target dan setoran bulanan, lalu lihat berapa lama sampai tercapai beserta tonggak-tonggaknya.</p>" +
    "<div class=\"dua-kolom\">" +
    "<section class=\"kartu\"><h2>Atur Rencana</h2>" +
    "<div class=\"form-grid\">" +
    "<div class=\"lebar\"><label for=\"input-target\">Target tabungan (Rp)</label><input type=\"number\" id=\"input-target\" min=\"0\" step=\"100000\" value=\"" + st.tabungan.target + "\"></div>" +
    "<div><label for=\"input-setoran\">Setoran per bulan (Rp)</label><input type=\"number\" id=\"input-setoran\" min=\"0\" step=\"50000\" value=\"" + st.tabungan.setoran + "\"></div>" +
    "<div><label for=\"input-saldo-awal\">Saldo awal (Rp)</label><input type=\"number\" id=\"input-saldo-awal\" min=\"0\" step=\"50000\" value=\"" + st.tabungan.saldoAwal + "\"></div>" +
    "</div>" +
    "<div id=\"hasil-tabungan\" style=\"margin-top:1rem\"></div></section>" +
    "<section class=\"kartu\"><h2>Tonggak Pencapaian</h2><ul class=\"milestone\" id=\"daftar-milestone\"></ul>" +
    "<p><small>Tonggak dihitung dari setoran bulanan yang sama, tanpa bunga.</small></p></section>" +
    "</div>" +
    "<section class=\"kartu\"><h2>Proyeksi Saldo</h2><canvas id=\"grafik-proyeksi\" class=\"grafik\" aria-label=\"Grafik proyeksi saldo tabungan\"></canvas>" +
    "<p><small id=\"catatan-proyeksi\"></small></p></section>";
}

export function pasangTabungan(el, ctx) {
  const { state, simpan } = ctx;
  const inputTarget = el.querySelector("#input-target");
  const inputSetoran = el.querySelector("#input-setoran");
  const inputAwal = el.querySelector("#input-saldo-awal");
  function hitung() {
    const target = Number(inputTarget.value) || 0;
    const setoran = Number(inputSetoran.value) || 0;
    const awal = Number(inputAwal.value) || 0;
    state.tabungan = { target, setoran, saldoAwal: awal };
    const hasil = el.querySelector("#hasil-tabungan");
    const daftar = el.querySelector("#daftar-milestone");
    const catatan = el.querySelector("#catatan-proyeksi");
    if (target <= 0 || setoran <= 0) {
      hasil.innerHTML = "<p>Isi target dan setoran lebih dari 0 untuk melihat rencana.</p>";
      daftar.innerHTML = "";
      catatan.textContent = "";
      simpan();
      return;
    }
    const kurang = Math.max(0, target - awal);
    const bulan = Math.ceil(kurang / setoran);
    hasil.innerHTML = "<p>Dengan setoran <strong>" + rupiah(setoran) + "</strong> per bulan, target <strong>" + rupiah(target) +
      "</strong> tercapai dalam <strong>" + bulan + " bulan</strong> — sekitar <strong>" + bulanKeDepan(bulan) + "</strong>.</p>";
    daftar.innerHTML = [25, 50, 75, 100].map((p) => {
      const jumlahTonggak = (target * p) / 100;
      let kapan;
      if (jumlahTonggak <= awal) kapan = "Sudah tercapai";
      else kapan = "Bulan ke-" + Math.ceil((jumlahTonggak - awal) / setoran);
      return "<li><span>" + p + "% — " + rupiah(jumlahTonggak) + "</span><strong>" + kapan + "</strong></li>";
    }).join("");
    const tampilBulan = Math.min(bulan, 36);
    const saldo = [];
    for (let i = 1; i <= tampilBulan; i += 1) saldo.push(Math.min(awal + setoran * i, target));
    gambarProyeksi(el.querySelector("#grafik-proyeksi"), saldo, target);
    catatan.textContent = bulan > 36 ? "Grafik menampilkan 36 bulan pertama dari " + bulan + " bulan." : "";
    simpan();
  }
  inputTarget.addEventListener("input", hitung);
  inputSetoran.addEventListener("input", hitung);
  inputAwal.addEventListener("input", hitung);
  hitung();
}

// ---------- KALKULATOR LUNASI UTANG ----------
export function htmlUtang(st) {
  const kartuUtang = st.utang.map((u) => "<div class=\"kartu\"><h3>" + esc(u.nama) + "</h3>" +
    "<div class=\"form-grid\">" +
    "<div><label for=\"pokok-" + u.id + "\">Sisa pokok (Rp)</label><input type=\"number\" id=\"pokok-" + u.id + "\" data-utang=\"" + u.id + "\" data-bidang=\"pokok\" min=\"0\" step=\"100000\" value=\"" + u.pokok + "\"></div>" +
    "<div><label for=\"bunga-" + u.id + "\">Bunga per tahun (%)</label><input type=\"number\" id=\"bunga-" + u.id + "\" data-utang=\"" + u.id + "\" data-bidang=\"bunga\" min=\"0\" step=\"0.5\" value=\"" + u.bunga + "\"></div>" +
    "<div><label for=\"cicilan-" + u.id + "\">Cicilan minimum (Rp/bulan)</label><input type=\"number\" id=\"cicilan-" + u.id + "\" data-utang=\"" + u.id + "\" data-bidang=\"cicilan\" min=\"0\" step=\"50000\" value=\"" + u.cicilan + "\"></div>" +
    "</div></div>").join("");
  return "<h1>Kalkulator Lunasi Utang</h1>" +
    "<p class=\"intro\">Bandingkan dua cara melunasi: <strong>snowball</strong> (serang saldo terkecil dulu) dan <strong>avalanche</strong> (serang bunga tertinggi dulu). Ubah angka utang atau anggaran di bawah, hasilnya ikut berubah.</p>" +
    "<section class=\"kartu\"><h2>Anggaran Bulanan</h2>" +
    "<label for=\"input-anggaran-utang\">Total yang bisa dibayar per bulan (Rp)</label>" +
    "<input type=\"number\" id=\"input-anggaran-utang\" min=\"0\" step=\"50000\" value=\"" + st.anggaranUtang + "\">" +
    "<p><small>Harus minimal sebesar total cicilan minimum: <strong id=\"total-minimum\"></strong>.</small></p></section>" +
    "<div class=\"dua-kolom\">" + kartuUtang + "</div>" +
    "<section class=\"kartu\"><h2>Hasil Perbandingan</h2><div id=\"hasil-utang\"></div></section>";
}

export function pasangUtang(el, ctx) {
  const { state, simpan } = ctx;
  function perbaruiHasil() {
    const minimumTotal = state.utang.reduce((s, u) => s + u.cicilan, 0);
    el.querySelector("#total-minimum").textContent = rupiah(minimumTotal);
    const bolaSalju = simulasiUtang(state.utang, state.anggaranUtang, "snowball");
    const longsor = simulasiUtang(state.utang, state.anggaranUtang, "avalanche");
    const selisih = Math.abs(bolaSalju.totalBunga - longsor.totalBunga);
    const pemenang = longsor.totalBunga <= bolaSalju.totalBunga ? "avalanche" : "snowball";
    const peringatan = state.anggaranUtang < minimumTotal
      ? "<p style=\"color:#a33d2a\">Anggaran di bawah total cicilan minimum — simulasi tetap memakai cicilan minimum tiap utang, jadi hasilnya bisa melebihi anggaran.</p>"
      : "";
    el.querySelector("#hasil-utang").innerHTML = peringatan +
      "<div class=\"hasil-dua\">" +
      "<div class=\"hasil-kartu" + (pemenang === "snowball" ? " menang" : "") + "\"><h3>Snowball</h3>" +
      (pemenang === "snowball" ? "<span class=\"lencana\">Lebih hemat</span>" : "") +
      "<p>Lunas dalam <span class=\"hasil-angka\">" + bolaSalju.bulan + " bulan</span><br>Total bunga: <strong>" + rupiah(bolaSalju.totalBunga) + "</strong></p>" +
      "<p><small>Utang terkecil dilunasi dulu, lalu beralih ke berikutnya.</small></p></div>" +
      "<div class=\"hasil-kartu" + (pemenang === "avalanche" ? " menang" : "") + "\"><h3>Avalanche</h3>" +
      (pemenang === "avalanche" ? "<span class=\"lencana\">Lebih hemat</span>" : "") +
      "<p>Lunas dalam <span class=\"hasil-angka\">" + longsor.bulan + " bulan</span><br>Total bunga: <strong>" + rupiah(longsor.totalBunga) + "</strong></p>" +
      "<p><small>Utang dengan bunga tertinggi dilunasi dulu.</small></p></div>" +
      "</div>" +
      "<p style=\"margin-top:0.9rem\">Selisih total bunga: <strong>" + rupiah(selisih) + "</strong>. " +
      (selisih > 0
        ? "Avalanche hampir selalu lebih hemat secara angka, tapi snowball memberi kemenangan lebih cepat — pilih yang membuatmu bertahan sampai lunas."
        : "Kedua cara memberi hasil yang sama untuk angka-angka ini.") + "</p>";
    simpan();
  }
  el.querySelector("#input-anggaran-utang").addEventListener("input", (e) => {
    state.anggaranUtang = Number(e.target.value) || 0;
    perbaruiHasil();
  });
  el.querySelectorAll("[data-utang]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const u = state.utang.find((x) => x.id === e.target.dataset.utang);
      if (!u) return;
      u[e.target.dataset.bidang] = Number(e.target.value) || 0;
      perbaruiHasil();
    });
  });
  perbaruiHasil();
}

// ---------- PANDUAN & TIPS ----------
export function htmlPanduan() {
  const kartuTips = TIPS.map((t) => "<article class=\"tip\"><h3>" + esc(t.judul) + "</h3><p>" + esc(t.isi) + "</p></article>").join("");
  const daftarFaq = FAQ.map((f) => "<details class=\"faq\"><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>").join("");
  return "<h1>Panduan &amp; Tips</h1>" +
    "<p class=\"intro\">Enam kebiasaan yang membuat anggaran bertahan lebih dari sebulan, plus jawaban atas pertanyaan yang paling sering muncul.</p>" +
    "<h2>6 Tips Mengatur Anggaran</h2><div class=\"tips\">" + kartuTips + "</div>" +
    "<h2>Pertanyaan yang Sering Ditanyakan</h2>" + daftarFaq;
}

export function pasangPanduan() {
  // FAQ memakai <details> bawaan browser — tidak butuh JavaScript.
}
