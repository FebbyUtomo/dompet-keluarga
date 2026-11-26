/* main.js — titik masuk DompetKeluarga.
   Router hash sederhana: setiap rute memanggil pasangan view/mount dari
   views.js dan menandai tautan navigasi yang aktif. Tidak ada dependensi
   luar; seluruh situs berjalan dari file-file di app/ ini.
   window.__shotReady false saat halaman dirender, true setelah tampil,
   supaya skrip screenshot tahu kapan menangkap layar. */

import {
  viewHome, mountHome,
  viewBudget, mountBudget,
  viewTracker, mountTracker,
  viewSavings, mountSavings,
  viewDebt, mountDebt,
  viewGuide, mountGuide,
} from './views.js';

const ROUTES = {
  '/': { title: 'Beranda', view: viewHome, mount: mountHome },
  '/kalkulator': { title: 'Kalkulator Anggaran', view: viewBudget, mount: mountBudget },
  '/pelacak': { title: 'Pelacak Pengeluaran', view: viewTracker, mount: mountTracker },
  '/tabungan': { title: 'Perencana Tabungan', view: viewSavings, mount: mountSavings },
  '/utang': { title: 'Kalkulator Lunasi Utang', view: viewDebt, mount: mountDebt },
  '/panduan': { title: 'Panduan & Tips', view: viewGuide, mount: mountGuide },
};

const app = document.getElementById('app');

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ? hash : '/';
}

function render() {
  window.__shotReady = false;
  const path = currentRoute();
  const route = ROUTES[path];
  app.innerHTML = route.view();
  document.title = route.title + ' — DompetKeluarga';
  document.querySelectorAll('nav a').forEach((a) => {
    const active = a.getAttribute('href') === '#' + path;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  route.mount();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
