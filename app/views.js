/* views.js — halaman-halaman DompetKeluarga.
   Setiap halaman adalah pasangan view* (mengembalikan HTML) dan mount*
   (menghidupkan kontrolnya: hitung, simpan, gambar grafik). Semua angka
   dihitung di sini dari input pengguna atau data contoh. */

import { rupiah, rupiahShort, parseAmount, clamp, pct, esc, todayIso, monthName } from './format.js';
import { CATEGORIES, CATEGORY_MAP, HOUSEHOLD, householdIncome, householdMonthlyExpense, SAMPLE_TX, DEFAULT_DEBTS, TIPS } from './data.js';
import { drawDonut, drawBars, drawLine } from './charts.js';

const LS_TX = 'dompetkeluarga.tx.v1';
const LS_BUDGET = 'dompetkeluarga.budget.v1';
const LS_DEBTS = 'dompetkeluarga.debts.v1';

export function loadTx() {
  try {
    const raw = localStorage.getItem(LS_TX);
    if (raw) return JSON.parse(raw);
  } catch { /* rusak: pakai contoh */ }
  return SAMPLE_TX.map((t) => ({ ...t }));
}

export function saveTx(list) {
  localStorage.setItem(LS_TX, JSON.stringify(list));
}

function loadDebts() {
  try {
    const raw = localStorage.getItem(LS_DEBTS);
    if (raw) return JSON.parse(raw);
  } catch { /* rusak: pakai contoh */ }
  return DEFAULT_DEBTS.map((d) => ({ ...d }));
}

function saveDebts(list) {
  localStorage.setItem(LS_DEBTS, JSON.stringify(list));
}

function txOut(list) {
  return list.filter((t) => t.kind === 'keluar').reduce((s, t) => s + t.amount, 0);
}

function txIn(list) {
  return list.filter((t) => t.kind === 'masuk').reduce((s, t) => s + t.amount, 0);
}

function kpiCard(label, value, sub) {
  return `<div class="kpi"><span class="kpi-label">${label}</span>` +
    `<strong class="kpi-value">${value}</strong>` +
    `<span class="kpi-sub">${sub}</span></div>`;
}

function toolCard(href, icon, title, text) {
  return `<a class="tool-card" href="${href}">` +
    `<span class="tool-icon" aria-hidden="true">${icon}</span>` +
    `<strong>${title}</strong><span>${text}</span></a>`;
}

/* ---------------- Beranda ---------------- */

export function viewHome() {
  const income = householdIncome();
  const tx = loadTx();
  const out = txOut(tx);
  const inn = txIn(tx);
  const top = tx.filter((t) => t.kind === 'keluar').sort((a, b) => b.amount - a.amount).slice(0, 5);
  const rows = top.map((t) =>
    `<tr><td>${esc(t.date)}</td><td>${esc(t.desc)}</td><td>${esc(CATEGORY_MAP[t.cat]?.label || t.cat)}</td>` +
    `<td class="num">${rupiah(t.amount)}</td></tr>`).join('');
  return `
    <section class="hero"><div><p class="eyebrow">Anggaran rumah tangga · Bahasa Indonesia · Rupiah</p>
    <h1>Uang keluarga teratur, hidup lebih tenang.</h1>
    <p class="lede">DompetKeluarga membantu keluarga Indonesia membagi gaji dengan aturan 50/30/20, mencatat setiap pengeluaran, menyiapkan dana darurat, dan melunasi utang sampai lunas — semuanya tersimpan di perangkatmu sendiri.</p>
    <p class="cta-row"><a class="btn primary" href="#/kalkulator">Hitung anggaran 50/30/20</a>
    <a class="btn" href="#/pelacak">Catat pengeluaran hari ini</a></p></div>
    <div class="hero-card"><h2>Contoh keluarga: ${esc(HOUSEHOLD.name)}</h2>
    <p>${HOUSEHOLD.members} orang · ${esc(HOUSEHOLD.city)} · November 2026</p>
    <canvas id="homeDonut" class="chart" height="220" aria-label="Grafik pembagian anggaran 50 30 20"></canvas>
    <p class="fine">Gaji Rp8.500.000 + usaha Rp1.200.000 = <strong>${rupiah(income)}</strong> per bulan.</p></div></section>
    <section class="kpi-grid">
    ${kpiCard('Penghasilan bulan ini', rupiah(inn), 'tercatat di pelacak')}
    ${kpiCard('Pengeluaran bulan ini', rupiah(out), pct(out, inn).toFixed(0) + '% dari pemasukan')}
    ${kpiCard('Sisa bulan ini', rupiah(inn - out), inn - out >= 0 ? 'masih dalam anggaran' : 'melebihi pemasukan')}
    ${kpiCard('Dana darurat ideal', rupiah(householdMonthlyExpense() * 6), '6 × pengeluaran bulanan')}
    </section>
    <section><h2>Alat untuk keluargamu</h2><div class="tools">
    ${toolCard('#/kalkulator', '▦', 'Kalkulator Anggaran', 'Bagi gaji dengan 50/30/20 dan lihat per kategori.')}
    ${toolCard('#/pelacak', '✎', 'Pelacak Pengeluaran', 'Catat, ubah, dan hapus transaksi. Tersimpan otomatis.')}
    ${toolCard('#/tabungan', '⬢', 'Perencana Tabungan', 'Target dana darurat dan tabungan dengan simulasi.')}
    ${toolCard('#/utang', '◐', 'Kalkulator Lunasi Utang', 'Snowball vs avalanche: mana yang lebih cepat lunas.')}
    ${toolCard('#/panduan', '✦', 'Panduan & Tips', 'Enam kebiasaan keuangan keluarga yang bisa langsung dipakai.')}
    </div></section>
    <section><h2>Pengeluaran terbesar bulan ini</h2>
    <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th></tr></thead><tbody>
    ${rows}</tbody></table></div>
    <p><a href="#/pelacak">Lihat semua ${tx.length} transaksi di Pelacak Pengeluaran →</a></p></section>
    <section class="banner"><h2>Mulai dari yang kecil</h2><p>Catat pengeluaran selama 30 hari tanpa mengubah apa pun. Setelah itu, angka-angkanya yang akan memberitahumu ke mana uang pergi — dan di mana letak penghematannya. <a href="#/panduan">Baca enam tipsnya →</a></p></section>`;
}

export function mountHome() {
  const income = householdIncome();
  drawDonut(document.getElementById('homeDonut'), [
    { label: 'Kebutuhan 50%', value: income * 0.5, color: '#2e7d4f' },
    { label: 'Keinginan 30%', value: income * 0.3, color: '#d97706' },
    { label: 'Tabungan 20%', value: income * 0.2, color: '#2563eb' },
  ], 'Gaji / bln', rupiahShort(income));
}

/* ---------------- Kalkulator Anggaran 50/30/20 ---------------- */

function budgetDefaults() {
  return {
    salary: HOUSEHOLD.salary, side: HOUSEHOLD.sideIncome,
    pNeed: 50, pWant: 30, pSave: 20,
    need: { sewa: 1500000, listrik: 550000, belanja: 2100000, transport: 750000, sekolah: 900000 },
    want: { makan: 700000, hiburan: 300000, jajan: 450000 },
    save: { darurat: 900000, tabungan: 600000, utang: 350000 },
  };
}

function loadBudget() {
  try {
    const raw = localStorage.getItem(LS_BUDGET);
    if (raw) return { ...budgetDefaults(), ...JSON.parse(raw) };
  } catch { /* rusak: pakai contoh */ }
  return budgetDefaults();
}

function moneyInput(id, label, value) {
  return `<label>${label}<input type="number" id="${id}" min="0" step="1000" value="${value}"></label>`;
}

export function viewBudget() {
  const b = loadBudget();
  const needRows = Object.entries({ sewa: 'Kontrakan / cicilan rumah', listrik: 'Listrik, air, internet', belanja: 'Belanja harian & dapur', transport: 'Transportasi', sekolah: 'Sekolah & anak' })
    .map(([k, label]) => moneyInput('need-' + k, label, b.need[k] || 0)).join('');
  const wantRows = Object.entries({ makan: 'Makan di luar', hiburan: 'Hiburan & langganan', jajan: 'Jajan & kopi' })
    .map(([k, label]) => moneyInput('want-' + k, label, b.want[k] || 0)).join('');
  const saveRows = Object.entries({ darurat: 'Dana darurat', tabungan: 'Tabungan & investasi', utang: 'Cicilan utang' })
    .map(([k, label]) => moneyInput('save-' + k, label, b.save[k] || 0)).join('');
  return `
    <h1>Kalkulator Anggaran 50/30/20</h1>
    <p class="lede">Masukkan penghasilan bersih keluargamu, lalu atur pembagiannya. Aturan klasik: 50% kebutuhan, 30% keinginan, 20% tabungan dan pelunasan utang — tapi persentasenya boleh kamu geser sesuai keadaanmu.</p>
    <div class="split"><form id="budgetForm" class="panel" onsubmit="return false">
    <h2>1 · Penghasilan</h2>
    ${moneyInput('salary', 'Gaji / penghasilan utama (Rp/bulan)', b.salary)}
    ${moneyInput('side', 'Penghasilan tambahan (Rp/bulan)', b.side)}
    <h2>2 · Pembagian (%)</h2>
    <label>Kebutuhan <output id="outNeed">${b.pNeed}%</output><input type="range" id="pNeed" min="30" max="70" value="${b.pNeed}"></label>
    <label>Keinginan <output id="outWant">${b.pWant}%</output><input type="range" id="pWant" min="10" max="50" value="${b.pWant}"></label>
    <label>Tabungan &amp; utang <output id="outSave">${b.pSave}%</output><input type="range" id="pSave" min="5" max="40" value="${b.pSave}"></label>
    <p id="pctWarn" class="alert" hidden>Persentase harus berjumlah 100% — sekarang <span id="pctSum"></span>%.</p>
    <h2>3 · Rincian per kategori</h2>
    <h3>Kebutuhan</h3><div class="field-grid">${needRows}</div>
    <h3>Keinginan</h3><div class="field-grid">${wantRows}</div>
    <h3>Tabungan &amp; utang</h3><div class="field-grid">${saveRows}</div>
    <p class="cta-row"><button type="button" class="btn primary" id="calcBtn">Hitung anggaran</button>
    <button type="button" class="btn" id="resetBudget">Kembali ke contoh</button></p>
    <p id="savedNote" class="fine" hidden>Anggaran tersimpan di perangkat ini.</p></form>
    <div class="panel sticky" id="budgetResult" aria-live="polite"></div></div>`;
}

function readBudgetForm() {
  const v = (id) => parseAmount(document.getElementById(id).value);
  const b = budgetDefaults();
  b.salary = v('salary'); b.side = v('side');
  b.pNeed = clamp(v('pNeed'), 0, 100); b.pWant = clamp(v('pWant'), 0, 100); b.pSave = clamp(v('pSave'), 0, 100);
  ['sewa', 'listrik', 'belanja', 'transport', 'sekolah'].forEach((k) => { b.need[k] = v('need-' + k); });
  ['makan', 'hiburan', 'jajan'].forEach((k) => { b.want[k] = v('want-' + k); });
  ['darurat', 'tabungan', 'utang'].forEach((k) => { b.save[k] = v('save-' + k); });
  return b;
}

function renderBudgetResult(b) {
  const income = b.salary + b.side;
  const need = Object.values(b.need).reduce((s, x) => s + x, 0);
  const want = Object.values(b.want).reduce((s, x) => s + x, 0);
  const save = Object.values(b.save).reduce((s, x) => s + x, 0);
  const spent = need + want + save;
  const rest = income - spent;
  const sumPct = b.pNeed + b.pWant + b.pSave;
  const bar = (label, actual, target) => {
    const over = actual > target;
    return `<div class="compare"><span>${label}</span><strong>${rupiah(actual)}</strong>` +
      `<span class="fine">target ${rupiah(target)} · ${pct(actual, income).toFixed(0)}% dari gaji</span>` +
      `<span class="${over ? 'bad' : 'good'}">${over ? '▲ melebihi target ' + rupiah(actual - target) : '✓ dalam target'}</span></div>`;
  };
  const verdict = rest >= 0
    ? `<p class="verdict good">✓ Anggaran seimbang. Sisa ${rupiah(rest)} per bulan bisa ditambahkan ke dana darurat.</p>`
    : `<p class="verdict bad">⚠ Pengeluaran melebihi penghasilan ${rupiah(-rest)}. Pangkas keinginan dulu: makan di luar dan langganan adalah yang paling mudah dipotong.</p>`;
  document.getElementById('budgetResult').innerHTML =
    '<h2>Hasil anggaranmu</h2>' +
    '<canvas id="budgetDonut" class="chart" height="220" aria-label="Grafik pembagian anggaran"></canvas>' +
    `<p>Penghasilan: <strong>${rupiah(income)}</strong> · Direncanakan: <strong>${rupiah(spent)}</strong> · Sisa: <strong>${rupiah(rest)}</strong></p>` +
    bar('Kebutuhan', need, income * b.pNeed / 100) +
    bar('Keinginan', want, income * b.pWant / 100) +
    bar('Tabungan & utang', save, income * b.pSave / 100) +
    verdict +
    (sumPct !== 100 ? `<p class="alert">Persentase pembagian berjumlah ${sumPct}%, bukan 100% — geser pengatur di atas sampai pas.</p>` : '');
  drawDonut(document.getElementById('budgetDonut'), [
    { label: 'Kebutuhan', value: need, color: '#2e7d4f' },
    { label: 'Keinginan', value: want, color: '#d97706' },
    { label: 'Tabungan', value: save, color: '#2563eb' },
    { label: 'Sisa', value: Math.max(0, rest), color: '#cbd5e1' },
  ], 'Terencana', rupiahShort(spent));
}

export function mountBudget() {
  const sync = () => {
    const b = readBudgetForm();
    document.getElementById('outNeed').textContent = b.pNeed + '%';
    document.getElementById('outWant').textContent = b.pWant + '%';
    document.getElementById('outSave').textContent = b.pSave + '%';
    const sum = b.pNeed + b.pWant + b.pSave;
    document.getElementById('pctWarn').hidden = sum === 100;
    document.getElementById('pctSum').textContent = sum;
    renderBudgetResult(b);
  };
  document.getElementById('budgetForm').addEventListener('input', sync);
  document.getElementById('calcBtn').addEventListener('click', () => {
    const b = readBudgetForm();
    localStorage.setItem(LS_BUDGET, JSON.stringify(b));
    document.getElementById('savedNote').hidden = false;
    renderBudgetResult(b);
  });
  document.getElementById('resetBudget').addEventListener('click', () => {
    localStorage.removeItem(LS_BUDGET);
    location.hash = '#/kalkulator';
    location.reload();
  });
  sync();
}

/* ---------------- Pelacak Pengeluaran ---------------- */

export function viewTracker() {
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  return `
    <h1>Pelacak Pengeluaran</h1>
    <p class="lede">Catat setiap pemasukan dan pengeluaran. Data tersimpan di localStorage perangkatmu — tidak dikirim ke mana pun — dan ringkasan di bawah ini selalu mengikuti catatanmu.</p>
    <div class="kpi-grid" id="trackerStats"></div>
    <div class="split"><form id="txForm" class="panel" onsubmit="return false">
    <h2 id="txFormTitle">Tambah transaksi</h2>
    <input type="hidden" id="txId" value="">
    <label>Tanggal<input type="date" id="txDate" value="${todayIso()}"></label>
    <label>Keterangan<input type="text" id="txDesc" placeholder="cth: Belanja sayur di pasar pagi" maxlength="80"></label>
    <label>Kategori<select id="txCat">${catOptions}</select></label>
    <div class="field-grid"><label>Jenis<select id="txKind"><option value="keluar">Pengeluaran</option><option value="masuk">Pemasukan</option></select></label>
    <label>Jumlah (Rp)<input type="number" id="txAmount" min="0" step="1000" placeholder="250000"></label></div>
    <p class="cta-row"><button type="submit" class="btn primary" id="txSave">Simpan transaksi</button>
    <button type="button" class="btn" id="txCancel" hidden>Batal ubah</button></p>
    <p id="txMsg" class="fine" hidden></p></form>
    <div class="panel"><h2>Ringkasan per kategori</h2>
    <canvas id="txDonut" class="chart" height="230" aria-label="Grafik pengeluaran per kategori"></canvas>
    <canvas id="txBars" class="chart" height="260" aria-label="Batang pengeluaran per kategori"></canvas></div></div>
    <section><h2>Daftar transaksi</h2>
    <div class="filters"><label>Filter kategori <select id="txFilter"><option value="">Semua kategori</option>${catOptions}</select></label>
    <label>Cari <input type="search" id="txSearch" placeholder="cari keterangan…"></label>
    <button type="button" class="btn" id="txReset">Muat ulang contoh</button></div>
    <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th class="num">Jumlah</th><th>Aksi</th></tr></thead>
    <tbody id="txTable"></tbody></table></div>
    <p class="fine" id="txCount"></p></section>`;
}

function renderTracker() {
  const list = loadTx();
  const filter = document.getElementById('txFilter').value;
  const q = document.getElementById('txSearch').value.trim().toLowerCase();
  const shown = list.filter((t) =>
    (!filter || t.cat === filter) && (!q || t.desc.toLowerCase().includes(q)))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const out = txOut(list), inn = txIn(list);
  document.getElementById('trackerStats').innerHTML =
    kpiCard('Pemasukan', rupiah(inn), list.filter((t) => t.kind === 'masuk').length + ' transaksi') +
    kpiCard('Pengeluaran', rupiah(out), list.filter((t) => t.kind === 'keluar').length + ' transaksi') +
    kpiCard('Sisa', rupiah(inn - out), 'dari ' + list.length + ' transaksi tercatat') +
    kpiCard('Rata-rata keluar / hari', rupiah(out / 30), 'asumsi 30 hari sebulan');
  document.getElementById('txTable').innerHTML = shown.map((t) =>
    `<tr><td>${esc(t.date)}</td><td>${esc(t.desc)}</td><td>${esc(CATEGORY_MAP[t.cat]?.label || t.cat)}</td>` +
    `<td>${t.kind === 'masuk' ? 'Masuk' : 'Keluar'}</td>` +
    `<td class="num ${t.kind === 'masuk' ? 'good' : ''}">${t.kind === 'masuk' ? '+' : '−'}${rupiah(t.amount)}</td>` +
    `<td><button type="button" class="mini" data-edit="${t.id}">Ubah</button> ` +
    `<button type="button" class="mini danger" data-del="${t.id}">Hapus</button></td></tr>`).join('') ||
    '<tr><td colspan="6">Tidak ada transaksi yang cocok dengan filter.</td></tr>';
  document.getElementById('txCount').textContent = `Menampilkan ${shown.length} dari ${list.length} transaksi.`;
  const byCat = CATEGORIES.map((c) => ({
    label: c.label,
    value: list.filter((t) => t.kind === 'keluar' && t.cat === c.id).reduce((s, t) => s + t.amount, 0),
    color: c.color,
  }));
  drawDonut(document.getElementById('txDonut'), byCat, 'Keluar', rupiahShort(out));
  drawBars(document.getElementById('txBars'), byCat.filter((b) => b.value > 0));
}

export function mountTracker() {
  const form = document.getElementById('txForm');
  renderTracker();
  document.getElementById('txFilter').addEventListener('input', renderTracker);
  document.getElementById('txSearch').addEventListener('input', renderTracker);
  document.getElementById('txReset').addEventListener('click', () => {
    localStorage.removeItem(LS_TX);
    renderTracker();
    const msg = document.getElementById('txMsg');
    msg.hidden = false;
    msg.textContent = 'Data contoh November 2026 dimuat ulang.';
  });
  form.addEventListener('submit', () => {
    const desc = document.getElementById('txDesc').value.trim();
    const amount = parseAmount(document.getElementById('txAmount').value);
    const msg = document.getElementById('txMsg');
    msg.hidden = false;
    if (!desc || amount <= 0) {
      msg.textContent = 'Isi keterangan dan jumlah yang lebih dari Rp0.';
      return;
    }
    const list = loadTx();
    const id = document.getElementById('txId').value;
    const rec = {
      id: id || ('t' + Date.now().toString(36)),
      date: document.getElementById('txDate').value || todayIso(),
      desc, cat: document.getElementById('txCat').value,
      amount, kind: document.getElementById('txKind').value,
    };
    if (id) {
      const i = list.findIndex((t) => t.id === id);
      if (i >= 0) list[i] = rec;
      msg.textContent = 'Transaksi diubah.';
    } else {
      list.push(rec);
      msg.textContent = 'Transaksi disimpan.';
    }
    saveTx(list);
    form.reset();
    document.getElementById('txDate').value = todayIso();
    document.getElementById('txId').value = '';
    document.getElementById('txFormTitle').textContent = 'Tambah transaksi';
    document.getElementById('txCancel').hidden = true;
    renderTracker();
  });
  document.getElementById('txCancel').addEventListener('click', () => {
    form.reset();
    document.getElementById('txDate').value = todayIso();
    document.getElementById('txId').value = '';
    document.getElementById('txFormTitle').textContent = 'Tambah transaksi';
    document.getElementById('txCancel').hidden = true;
    document.getElementById('txMsg').hidden = true;
  });
  document.getElementById('txTable').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const list = loadTx();
    if (btn.dataset.del) {
      saveTx(list.filter((t) => t.id !== btn.dataset.del));
      renderTracker();
      return;
    }
    if (btn.dataset.edit) {
      const t = list.find((x) => x.id === btn.dataset.edit);
      if (!t) return;
      document.getElementById('txId').value = t.id;
      document.getElementById('txDate').value = t.date;
      document.getElementById('txDesc').value = t.desc;
      document.getElementById('txCat').value = t.cat;
      document.getElementById('txKind').value = t.kind;
      document.getElementById('txAmount').value = t.amount;
      document.getElementById('txFormTitle').textContent = 'Ubah transaksi';
      document.getElementById('txCancel').hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ---------------- Perencana Tabungan & Dana Darurat ---------------- */

export function viewSavings() {
  const expense = householdMonthlyExpense();
  return `
    <h1>Perencana Tabungan &amp; Dana Darurat</h1>
    <p class="lede">Tentukan targetmu — dana darurat, DP rumah, biaya pendidikan — lalu lihat berapa setoran bulanan yang dibutuhkan dan kapan target tercapai, dengan asumsi imbal hasil tahunan.</p>
    <div class="split"><form id="saveForm" class="panel" onsubmit="return false">
    <h2>Rencanamu</h2>
    <label>Nama target<input type="text" id="svName" value="Dana darurat" maxlength="60"></label>
    <label>Target (Rp)<input type="number" id="svTarget" min="0" step="100000" value="34800000"></label>
    <label>Sudah terkumpul (Rp)<input type="number" id="svHave" min="0" step="100000" value="7250000"></label>
    <label>Setoran per bulan (Rp)<input type="number" id="svMonthly" min="0" step="50000" value="1250000"></label>
    <label>Imbal hasil per tahun (%)<input type="number" id="svRate" min="0" max="20" step="0.5" value="4"></label>
    <p class="fine">Target cepat:
    <button type="button" class="mini" data-target="${expense * 3}">Dana darurat 3 bln (${rupiahShort(expense * 3)})</button>
    <button type="button" class="mini" data-target="${expense * 6}">6 bln (${rupiahShort(expense * 6)})</button>
    <button type="button" class="mini" data-target="100000000">DP rumah Rp100 jt</button></p>
    <p class="cta-row"><button type="button" class="btn primary" id="svCalc">Simulasikan</button></p></form>
    <div class="panel sticky" id="saveResult" aria-live="polite"></div></div>
    <section><h2>Kenapa dana darurat 3–6 bulan?</h2>
    <p>Keluarga contoh di situs ini menghabiskan sekitar ${rupiah(expense)} per bulan. Dana darurat 3 bulan (${rupiah(expense * 3)}) menutup gaji telat atau perbaikan besar; 6 bulan (${rupiah(expense * 6)}) memberi ruang mencari kerja baru tanpa berutang. Simpan di rekening terpisah yang mudah dicairkan, bukan di investasi yang naik-turun.</p></section>`;
}

/* Simulasikan saldo tiap bulan: bunga majemuk bulanan + setoran tetap. */
function simulateSavings(target, have, monthly, annualRate) {
  const r = annualRate / 100 / 12;
  let balance = have;
  const points = [Math.round(balance)];
  let months = 0;
  while (balance < target && months < 600) {
    balance = balance * (1 + r) + monthly;
    months++;
    points.push(Math.round(balance));
  }
  return { months, points, reached: balance >= target, final: Math.round(balance) };
}

export function mountSavings() {
  const run = () => {
    const target = parseAmount(document.getElementById('svTarget').value);
    const have = parseAmount(document.getElementById('svHave').value);
    const monthly = parseAmount(document.getElementById('svMonthly').value);
    const rate = parseAmount(document.getElementById('svRate').value);
    const name = document.getElementById('svName').value.trim() || 'Target tabungan';
    const el = document.getElementById('saveResult');
    if (target <= 0) { el.innerHTML = '<p class="alert">Isi target yang lebih dari Rp0.</p>'; return; }
    if (have >= target) {
      el.innerHTML = `<h2>${esc(name)} tercapai!</h2><p>Kamu sudah mengumpulkan ${rupiah(have)} dari target ${rupiah(target)}. Pertahankan, atau naikkan targetmu.</p>`;
      return;
    }
    if (monthly <= 0) { el.innerHTML = '<p class="alert">Setoran bulanan harus lebih dari Rp0 agar target bisa tercapai.</p>'; return; }
    const sim = simulateSavings(target, have, monthly, rate);
    const years = Math.floor(sim.months / 12);
    const rem = sim.months % 12;
    const milestones = [25, 50, 75, 100].map((p) => {
      const need = target * p / 100;
      const idx = sim.points.findIndex((v) => v >= need);
      return `<tr><td>${p}% · ${rupiah(need)}</td><td>${idx < 0 ? '—' : 'bulan ke-' + idx}</td></tr>`;
    }).join('');
    el.innerHTML = `<h2>${esc(name)}</h2>` +
      `<p class="big">${sim.reached ? `Tercapai dalam <strong>${sim.months} bulan</strong>` : 'Tidak tercapai dalam 50 tahun — naikkan setoran'}` +
      (years ? ` (${years} tahun ${rem} bulan)` : '') + `</p>` +
      `<p>Kekurangan: ${rupiah(target - have)} · Setoran: ${rupiah(monthly)}/bulan · Imbal hasil: ${rate}%/tahun · Total setor: ${rupiah(monthly * sim.months)} · Imbal hasil menambah sekitar ${rupiah(Math.max(0, sim.final - have - monthly * sim.months))}.</p>` +
      '<canvas id="saveLine" class="chart" height="220" aria-label="Grafik proyeksi tabungan"></canvas>' +
      `<div class="table-wrap"><table><thead><tr><th>Tonggak</th><th>Tercapai</th></tr></thead><tbody>${milestones}</tbody></table></div>`;
    drawLine(document.getElementById('saveLine'), sim.points, target);
  };
  document.getElementById('svCalc').addEventListener('click', run);
  document.getElementById('saveForm').addEventListener('input', run);
  document.querySelectorAll('#saveForm [data-target]').forEach((b) => {
    b.addEventListener('click', () => {
      document.getElementById('svTarget').value = b.dataset.target;
      run();
    });
  });
  run();
}

/* ---------------- Kalkulator Lunasi Utang ---------------- */

/* Simulasi pelunasan bulan demi bulan: bunga berjalan dulu, lalu bayar
   minimum semua utang, lalu kerahkan sisa dana ke utang prioritas sesuai
   strategi (snowball = saldo terkecil, avalanche = bunga tertinggi). */
function simulateDebt(debts, extra, strategy) {
  const order = debts.map((d, i) => ({ ...d, idx: i }))
    .sort((a, b) => strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate);
  const state = debts.map((d) => ({ ...d }));
  const paidOrder = [];
  let months = 0;
  let interest = 0;
  const totalMin = state.reduce((s, d) => s + d.minPay, 0);
  const budget = totalMin + extra;
  const balances = [state.reduce((s, d) => s + d.balance, 0)];
  while (state.some((d) => d.balance > 0) && months < 600) {
    months++;
    let pool = budget;
    for (const d of state) {
      if (d.balance <= 0) continue;
      const intr = d.balance * (d.rate / 100 / 12);
      interest += intr;
      d.balance += intr;
    }
    for (const d of state) {
      if (d.balance <= 0 || pool <= 0) continue;
      const pay = Math.min(d.minPay, d.balance, pool);
      d.balance -= pay;
      pool -= pay;
      if (d.balance <= 0 && !paidOrder.includes(d.name)) paidOrder.push(d.name);
    }
    for (const target of order) {
      const d = state[target.idx];
      if (!d || d.balance <= 0 || pool <= 0) continue;
      const pay = Math.min(d.balance, pool);
      d.balance -= pay;
      pool -= pay;
      if (d.balance <= 0 && !paidOrder.includes(d.name)) paidOrder.push(d.name);
    }
    for (const d of state) {
      if (d.balance <= 0.005) d.balance = 0;
    }
    balances.push(Math.round(state.reduce((s, d) => s + d.balance, 0)));
  }
  return { months, interest: Math.round(interest), paidOrder, balances, done: !state.some((d) => d.balance > 0) };
}

export function viewDebt() {
  return `
    <h1>Kalkulator Lunasi Utang</h1>
    <p class="lede">Bandingkan dua strategi: <strong>snowball</strong> — lunasi saldo terkecil dulu untuk kemenangan cepat — dan <strong>avalanche</strong> — lunasi bunga tertinggi dulu untuk total bunga paling kecil. Masukkan utangmu, tambah dana ekstra bulanan, dan lihat mana yang lebih cepat lunas.</p>
    <div class="split"><div class="panel"><h2>Utangmu</h2>
    <div id="debtList"></div>
    <form id="debtForm" onsubmit="return false"><h3>Tambah utang</h3>
    <label>Nama utang<input type="text" id="dbName" placeholder="cth: Kartu Kredit Bank C" maxlength="60"></label>
    <div class="field-grid">
    <label>Saldo (Rp)<input type="number" id="dbBalance" min="0" step="100000"></label>
    <label>Bunga (%/thn)<input type="number" id="dbRate" min="0" max="60" step="0.5"></label>
    <label>Bayar min. (Rp)<input type="number" id="dbMin" min="0" step="10000"></label></div>
    <p class="cta-row"><button type="submit" class="btn primary">Tambah utang</button>
    <button type="button" class="btn" id="dbReset">Muat ulang contoh</button></p></form></div>
    <div class="panel"><h2>Strategi &amp; dana ekstra</h2>
    <label>Strategi<select id="dbStrategy"><option value="avalanche">Avalanche — bunga tertinggi dulu</option><option value="snowball">Snowball — saldo terkecil dulu</option></select></label>
    <label>Dana ekstra per bulan (Rp)<input type="number" id="dbExtra" min="0" step="50000" value="500000"></label>
    <div id="debtResult" aria-live="polite"></div>
    <canvas id="debtBars" class="chart" height="220" aria-label="Grafik saldo utang per bulan"></canvas></div></div>
    <section><h2>Aturan praktisnya</h2><p>Selalu bayar minimum semua utang tepat waktu — denda keterlambatan dan bunga berjalan adalah musuh terbesar. Dana ekstra apa pun, bahkan Rp200.000 per bulan, memangkas berbulan-bulan masa utang kartu kredit. Setelah satu utang lunas, gulirkan cicilannya ke utang berikutnya tanpa mengubah gaya hidup: itulah "bola salju" yang sesungguhnya.</p></section>`;
}

function renderDebts() {
  const list = loadDebts();
  document.getElementById('debtList').innerHTML = list.map((d) =>
    `<div class="debt-row"><div><strong>${esc(d.name)}</strong><br><span class="fine">Saldo ${rupiah(d.balance)} · bunga ${d.rate}%/thn · min. ${rupiah(d.minPay)}/bln</span></div>` +
    `<button type="button" class="mini danger" data-del-debt="${d.id}">Hapus</button></div>`).join('') ||
    '<p class="fine">Belum ada utang. Tambahkan satu di bawah — atau nikmati kebebasanmu.</p>';
  const extra = parseAmount(document.getElementById('dbExtra').value);
  const strategy = document.getElementById('dbStrategy').value;
  const el = document.getElementById('debtResult');
  if (list.length === 0) { el.innerHTML = ''; return; }
  const total = list.reduce((s, d) => s + d.balance, 0);
  const totalMin = list.reduce((s, d) => s + d.minPay, 0);
  const sim = simulateDebt(list, extra, strategy);
  const other = simulateDebt(list, extra, strategy === 'snowball' ? 'avalanche' : 'snowball');
  const stratName = strategy === 'snowball' ? 'Snowball' : 'Avalanche';
  const otherName = strategy === 'snowball' ? 'Avalanche' : 'Snowball';
  el.innerHTML = `<h3>Hasil: ${stratName}</h3>` +
    `<p class="big">Lunas dalam <strong>${sim.done ? sim.months + ' bulan' : 'lebih dari 50 tahun'}</strong> · total bunga <strong>${rupiah(sim.interest)}</strong></p>` +
    `<p>Total utang ${rupiah(total)} · bayar minimum ${rupiah(totalMin)}/bln + ekstra ${rupiah(extra)}/bln.</p>` +
    `<p>Urutan lunas: ${sim.paidOrder.map(esc).join(' → ') || '—'}</p>` +
    `<p class="fine">Perbandingan: ${otherName} lunas dalam ${other.done ? other.months + ' bulan' : 'lebih dari 50 tahun'} dengan total bunga ${rupiah(other.interest)}. ` +
    (sim.interest <= other.interest
      ? `${stratName} lebih hemat ${rupiah(other.interest - sim.interest)}.`
      : `${otherName} lebih hemat ${rupiah(sim.interest - other.interest)} — tapi ${stratName} bisa terasa lebih memotivasi.`) + '</p>';
  const step = Math.max(1, Math.floor(sim.balances.length / 8));
  const sampled = sim.balances.filter((_, i) => i % step === 0).slice(0, 9);
  drawBars(document.getElementById('debtBars'), sampled.map((v, i) => ({
    label: 'Bln ' + (i * step), value: v, color: '#b45309',
  })));
}

export function mountDebt() {
  renderDebts();
  document.getElementById('dbStrategy').addEventListener('input', renderDebts);
  document.getElementById('dbExtra').addEventListener('input', renderDebts);
  document.getElementById('dbReset').addEventListener('click', () => {
    localStorage.removeItem(LS_DEBTS);
    renderDebts();
  });
  document.getElementById('debtList').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-del-debt]');
    if (!btn) return;
    saveDebts(loadDebts().filter((d) => d.id !== btn.dataset.delDebt));
    renderDebts();
  });
  document.getElementById('debtForm').addEventListener('submit', () => {
    const name = document.getElementById('dbName').value.trim();
    const balance = parseAmount(document.getElementById('dbBalance').value);
    const rate = parseAmount(document.getElementById('dbRate').value);
    const minPay = parseAmount(document.getElementById('dbMin').value);
    if (!name || balance <= 0 || minPay <= 0) return;
    const list = loadDebts();
    list.push({ id: 'd' + Date.now().toString(36), name, balance, rate, minPay });
    saveDebts(list);
    document.getElementById('debtForm').reset();
    renderDebts();
  });
}

/* ---------------- Panduan & Tips ---------------- */

export function viewGuide() {
  const cards = TIPS.map((t) =>
    `<article class="tip-card" id="${t.id}"><h2>${esc(t.title)}</h2><p>${esc(t.body)}</p>` +
    `<p class="example">${esc(t.figure)}</p></article>`).join('');
  return `
    <h1>Panduan &amp; Tips Keuangan Keluarga</h1>
    <p class="lede">Enam kebiasaan yang bisa langsung dipakai minggu ini — masing-masing dengan angka contoh supaya kamu tahu persis dari mana memulainya.</p>
    <div class="tip-grid">${cards}</div>
    <section><h2>Pertanyaan yang sering ditanyakan</h2>
    <details><summary>Berapa dana darurat yang cukup untuk keluarga?</summary><p>3–6 kali pengeluaran bulanan. Keluarga dengan satu penghasilan dan anak kecil sebaiknya mengincar 6 bulan; dua penghasilan yang stabil bisa mulai dari 3 bulan.</p></details>
    <details><summary>Apakah 50/30/20 wajib diikuti persis?</summary><p>Tidak. Itu titik awal, bukan hukum. Di kota besar, kebutuhan sering menyentuh 60% — yang penting tabungan tidak nol dan persentasenya bergerak ke arah yang benar tiap bulan.</p></details>
    <details><summary>Utang mana yang dilunasi dulu?</summary><p>Yang bunganya tertinggi (avalanche) paling hemat uang; yang saldonya terkecil (snowball) paling memotivasi. Coba keduanya di <a href="#/utang">Kalkulator Lunasi Utang</a> dan pilih yang membuatmu bertahan.</p></details>
    <details><summary>Apakah dataku dikirim ke server?</summary><p>Tidak. Semua catatan tersimpan di localStorage perambanmu sendiri. Situs ini tidak memakai jaringan sama sekali — hapus data peramban dan catatanmu ikut terhapus.</p></details>
    <details><summary>Dari mana memulai kalau gajiku pas-pasan?</summary><p>Mulai dari mencatat 30 hari, lalu sisihkan Rp50.000 per gajian ke rekening terpisah. Dana darurat Rp1.000.000 pertama adalah tonggak terbesar — setelah itu kebiasaan sudah terbentuk.</p></details></section>
    <section class="banner"><h2>Siap mempraktikkan?</h2><p>Buka <a href="#/kalkulator">Kalkulator Anggaran</a>, masukkan gajimu yang sebenarnya, dan lihat pembagian 50/30/20 untuk keluargamu dalam satu menit.</p></section>`;
}

export function mountGuide() { /* halaman statis: tidak ada kontrol */ }
