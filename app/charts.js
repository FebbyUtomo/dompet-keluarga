// Gambar grafik di canvas tanpa library.
import { rupiahSingkat } from "./format.js";

function siapkanKanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const lebar = rect.width || 300;
  const tinggi = rect.height || 200;
  canvas.width = Math.round(lebar * dpr);
  canvas.height = Math.round(tinggi * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, lebar, tinggi);
  return { ctx, lebar, tinggi };
}

// Diagram donat. segmen: [{ label, nilai, warna }]. Teks tengah = total.
export function gambarDonat(canvas, segmen) {
  const { ctx, lebar, tinggi } = siapkanKanvas(canvas);
  const total = segmen.reduce((s, g) => s + g.nilai, 0);
  const cx = lebar / 2;
  const cy = tinggi / 2;
  const jariLuar = Math.min(lebar, tinggi) / 2 - 6;
  const jariDalam = jariLuar * 0.62;
  let sudut = -Math.PI / 2;
  for (const g of segmen) {
    if (g.nilai <= 0) continue;
    const porsi = (g.nilai / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, jariLuar, sudut, sudut + porsi);
    ctx.closePath();
    ctx.fillStyle = g.warna;
    ctx.fill();
    sudut += porsi;
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, jariDalam, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#243129";
  ctx.font = "700 17px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(rupiahSingkat(total), cx, cy - 9);
  ctx.fillStyle = "#6b7268";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("per bulan", cx, cy + 11);
}

// Diagram batang tegak. batang: [{ label, nilai, warna }]
export function gambarBatang(canvas, batang) {
  const { ctx, lebar, tinggi } = siapkanKanvas(canvas);
  if (!batang.length) return;
  const maks = Math.max(...batang.map((b) => b.nilai), 1);
  const alas = tinggi - 30;
  const atas = 26;
  const celah = 12;
  const lebarBatang = (lebar - celah * (batang.length + 1)) / batang.length;
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  batang.forEach((b, i) => {
    const tinggiBatang = Math.max(3, ((alas - atas) * b.nilai) / maks);
    const x = celah + i * (lebarBatang + celah);
    const y = alas - tinggiBatang;
    ctx.fillStyle = b.warna;
    ctx.beginPath();
    ctx.roundRect(x, y, lebarBatang, tinggiBatang, 4);
    ctx.fill();
    ctx.fillStyle = "#243129";
    ctx.fillText(rupiahSingkat(b.nilai), x + lebarBatang / 2, y - 8);
    ctx.fillStyle = "#6b7268";
    const label = b.label.length > 9 ? b.label.slice(0, 9) + "…" : b.label;
    ctx.fillText(label, x + lebarBatang / 2, alas + 16);
  });
}

// Grafik proyeksi saldo: batang kumulatif per bulan. nilai: [saldoBulan1, ...]
export function gambarProyeksi(canvas, nilai, target) {
  const { ctx, lebar, tinggi } = siapkanKanvas(canvas);
  if (!nilai.length) return;
  const maks = Math.max(target, ...nilai);
  const alas = tinggi - 28;
  const atas = 24;
  const n = nilai.length;
  const celah = 4;
  const lebarBatang = (lebar - celah * (n + 1)) / n;
  // Garis target
  const yTarget = alas - ((alas - atas) * target) / maks;
  ctx.strokeStyle = "#c96f3f";
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, yTarget);
  ctx.lineTo(lebar, yTarget);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#c96f3f";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Target " + rupiahSingkat(target), 4, yTarget - 5);
  nilai.forEach((v, i) => {
    const tinggiBatang = Math.max(3, ((alas - atas) * v) / maks);
    const x = celah + i * (lebarBatang + celah);
    ctx.fillStyle = v >= target ? "#1f6b4a" : "#7fb894";
    ctx.beginPath();
    ctx.roundRect(x, alas - tinggiBatang, lebarBatang, tinggiBatang, 3);
    ctx.fill();
  });
  ctx.fillStyle = "#6b7268";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Bulan 1", lebarBatang / 2 + celah, alas + 15);
  ctx.textAlign = "right";
  ctx.fillText("Bulan " + n, lebar - 2, alas + 15);
}
