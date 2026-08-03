/* ═══════════════════════════════════════════════════════════════════
   Arte gerada em canvas para os cases e para as miniaturas de serviço.
   Nada de banco de imagens: as peças usam só as cores da marca, então
   nunca destoam da paleta em PALETA-DE-CORES.txt.
   ═══════════════════════════════════════════════════════════════════ */

const PRETO = '#040707';
const ABISSAL = '#00252e';
const CIANO = '#00b7ac';
const CLARO = '#56d7cf';
const MARFIM = '#fbf9f3';

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function grain(ctx, w, h, amount = 12) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Composição abstrata: campo escuro, um halo ciano fora de centro e
 * uma família de arcos finos — a leitura é "sinal emergindo do ruído".
 */
export function makeArt(w, h, seed = 1) {
  const c = document.createElement('canvas');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = w * dpr;
  c.height = h * dpr;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  const rand = rng(seed);

  // campo
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, ABISSAL);
  base.addColorStop(0.55, '#071113');
  base.addColorStop(1, PRETO);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // halo da marca
  const gx = w * (0.2 + rand() * 0.6);
  const gy = h * (0.2 + rand() * 0.6);
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.72);
  glow.addColorStop(0, 'rgba(0,183,172,0.42)');
  glow.addColorStop(0.42, 'rgba(0,183,172,0.10)');
  glow.addColorStop(1, 'rgba(0,183,172,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // arcos concêntricos deslocados
  ctx.lineWidth = 1;
  const cx = w * (0.1 + rand() * 0.8);
  const cy = h * (0.8 + rand() * 0.4);
  const rings = 16 + Math.floor(rand() * 10);
  for (let i = 0; i < rings; i++) {
    const r = (i / rings) * Math.max(w, h) * 1.15 + 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * (0.9 + rand() * 0.2), Math.PI * (1.9 + rand() * 0.25));
    ctx.strokeStyle = i % 4 === 0 ? `rgba(0,183,172,${0.30 - i * 0.012})` : `rgba(251,249,243,${0.13 - i * 0.006})`;
    ctx.stroke();
  }

  // curva de crescimento — o gesto de "growth" da marca
  ctx.beginPath();
  ctx.moveTo(-10, h * 0.92);
  ctx.bezierCurveTo(w * 0.3, h * 0.9, w * 0.42, h * 0.5, w + 10, h * (0.06 + rand() * 0.16));
  const stroke = ctx.createLinearGradient(0, h, w, 0);
  stroke.addColorStop(0, 'rgba(0,183,172,0)');
  stroke.addColorStop(0.5, CIANO);
  stroke.addColorStop(1, CLARO);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // pontos de dado sobre a curva
  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.18;
    const px = t * w;
    const py = h * 0.92 - Math.pow(t, 1.7) * h * 0.78;
    ctx.beginPath();
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = MARFIM;
    ctx.fill();
  }

  // véu inferior para o texto respirar
  const veil = ctx.createLinearGradient(0, h * 0.4, 0, h);
  veil.addColorStop(0, 'rgba(4,7,7,0)');
  veil.addColorStop(1, 'rgba(4,7,7,0.72)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);

  grain(ctx, c.width, c.height, 10);
  return c.toDataURL('image/png');
}

/** aplica a arte nos cards de case */
export function paintCases() {
  document.querySelectorAll('[data-art]').forEach((el) => {
    const seed = Number(el.dataset.art) * 37 + 11;
    const url = makeArt(640, 480, seed);
    el.style.backgroundImage = `url(${url})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  });
}

/** seis miniaturas para a lista de serviços */
export function serviceArt(count = 6) {
  return Array.from({ length: count }, (_, i) => makeArt(320, 400, i * 13 + 5));
}
