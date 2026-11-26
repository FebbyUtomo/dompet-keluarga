/* charts.js — grafik canvas tanpa pustaka luar.
   Semua grafik digambar langsung ke <canvas> dengan Canvas 2D API:
   donat untuk pembagian anggaran, batang untuk perbandingan kategori,
   dan garis untuk proyeksi tabungan. Responsif terhadap lebar kanvas. */

import { rupiahShort } from './format.js';

/* Siapkan kanvas untuk layar retina: ukur dari CSS, gambar dalam piksel perangkat. */
function prepare(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 320;
  const h = canvas.clientHeight || 220;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawLegend(ctx, items, x, y) {
  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let cy = y;
  for (const it of items) {
    ctx.fillStyle = it.color;
    ctx.fillRect(x, cy - 5, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText(it.label + ' — ' + it.value, x + 16, cy);
    cy += 22;
  }
}

/* Donat: slices = [{label, value, color}]. Menulis total di tengah. */
export function drawDonut(canvas, slices, centerLabel, centerValue) {
  if (!canvas) return;
  const { ctx, w, h } = prepare(canvas);
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  const narrow = w < 420;
  const cx = narrow ? w / 2 : Math.min(w * 0.32, 110);
  const cy = narrow ? 78 : h / 2;
  const r = narrow ? 58 : Math.min(cx - 14, h / 2 - 14, 86);
  ctx.clearRect(0, 0, w, h);
  if (total <= 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada data', cx, cy);
    return;
  }
  let a0 = -Math.PI / 2;
  for (const s of slices) {
    const frac = Math.max(0, s.value) / total;
    if (frac <= 0) continue;
    const a1 = a0 + frac * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    a0 = a1;
  }
  /* Lubang tengah + label total. */
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(centerLabel, cx, cy - 8);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(centerValue, cx, cy + 10);
  const items = slices
    .filter((s) => s.value > 0)
    .map((s) => ({ label: s.label, value: rupiahShort(s.value), color: s.color }));
  if (narrow) drawLegend(ctx, items, 16, cy + r + 24);
  else drawLegend(ctx, items, cx + r + 18, 24);
}

/* Batang horizontal: bars = [{label, value, color}]. */
export function drawBars(canvas, bars, moneyFmt) {
  if (!canvas) return;
  const fmt = moneyFmt || rupiahShort;
  const { ctx, w, h } = prepare(canvas);
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(1, ...bars.map((b) => b.value));
  const rowH = Math.min(34, (h - 8) / Math.max(bars.length, 1));
  const labelW = 118;
  const barX = labelW + 8;
  const barW = Math.max(40, w - barX - 86);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  bars.forEach((b, i) => {
    const y = 8 + i * rowH + rowH / 2;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'right';
    const label = b.label.length > 16 ? b.label.slice(0, 15) + '…' : b.label;
    ctx.fillText(label, labelW, y);
    const bw = Math.max(2, (b.value / max) * barW);
    ctx.fillStyle = b.color;
    ctx.fillRect(barX, y - 8, bw, 16);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(fmt(b.value), barX + bw + 6, y);
  });
}

/* Garis proyeksi: points = saldo per bulan, target = garis target putus-putus. */
export function drawLine(canvas, points, target) {
  if (!canvas) return;
  const { ctx, w, h } = prepare(canvas);
  ctx.clearRect(0, 0, w, h);
  const padL = 64, padR = 14, padT = 14, padB = 26;
  const maxV = Math.max(target || 0, ...points, 1) * 1.05;
  const x0 = padL, x1 = w - padR, y0 = padT, y1 = h - padB;
  const px = (i) => x0 + (i / Math.max(points.length - 1, 1)) * (x1 - x0);
  const py = (v) => y1 - (v / maxV) * (y1 - y0);
  /* Garis grid + label sumbu kiri. */
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  for (let g = 0; g <= 4; g++) {
    const y = y0 + (g / 4) * (y1 - y0);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(rupiahShort(maxV * (1 - g / 4)), x0 - 6, y);
  }
  if (target) {
    ctx.strokeStyle = '#dc2626';
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, py(target));
    ctx.lineTo(x1, py(target));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'left';
    ctx.fillText('Target', x0 + 4, py(target) - 8);
  }
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((v, i) => {
    if (i === 0) ctx.moveTo(px(i), py(v));
    else ctx.lineTo(px(i), py(v));
  });
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Bulan 0', px(0), h - 8);
  ctx.fillText('Bulan ' + (points.length - 1), px(points.length - 1), h - 8);
}
