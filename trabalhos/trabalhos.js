/* ═══════════════════════════════════════════════════════════════════
   Página de trabalhos: filtros, revelação na rolagem e o mesmo chrome
   do site (cursor, menu, scroll suave).
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initCursor, initNav, initMagnetic } from '../src/modules/ui.js';
import { initReveals, initProgress } from '../src/modules/motion.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── scroll suave ──────────────────────────────────────────────────── */
function initLenis() {
  if (reduced) return null;
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ── filtros por categoria ─────────────────────────────────────────── */
function initFiltros() {
  const botoes = [...document.querySelectorAll('.filtro')];
  const itens = [...document.querySelectorAll('.trab')];
  const vazio = document.getElementById('vazio');
  if (!botoes.length) return;

  // conta quantos trabalhos cada filtro tem e mostra ao lado do rótulo
  botoes.forEach((b) => {
    const cat = b.dataset.filtro;
    const n =
      cat === 'todos'
        ? itens.length
        : itens.filter((i) => i.dataset.cat.split(' ').includes(cat)).length;
    const marca = document.createElement('span');
    marca.className = 'filtro__n';
    marca.textContent = n;
    b.appendChild(marca);
    if (n === 0) b.disabled = true;
  });

  const aplicar = (cat) => {
    let visiveis = 0;
    itens.forEach((item) => {
      const bate = cat === 'todos' || item.dataset.cat.split(' ').includes(cat);
      item.classList.toggle('is-oculto', !bate);
      if (bate) visiveis++;
    });
    vazio?.classList.toggle('is-visivel', visiveis === 0);

    // reanima os que entraram
    const abertos = itens.filter((i) => !i.classList.contains('is-oculto'));
    gsap.fromTo(
      abertos,
      { opacity: 0, y: reduced ? 0 : 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.05, overwrite: true }
    );

    ScrollTrigger.refresh();
  };

  botoes.forEach((b) => {
    b.addEventListener('click', () => {
      botoes.forEach((o) => o.classList.toggle('is-ativo', o === b));
      aplicar(b.dataset.filtro);
      history.replaceState(null, '', b.dataset.filtro === 'todos' ? location.pathname : `?f=${b.dataset.filtro}`);
    });
  });

  // abrir já filtrado: ?f=sistema
  const pedido = new URLSearchParams(location.search).get('f');
  const alvo = pedido && botoes.find((b) => b.dataset.filtro === pedido && !b.disabled);
  if (alvo) {
    botoes.forEach((o) => o.classList.toggle('is-ativo', o === alvo));
    aplicar(pedido);
  }
}

/* ── entrada dos cards ─────────────────────────────────────────────── */
function initGrade() {
  document.querySelectorAll('.trab').forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.delayedCall((i % 3) * 0.08, () => card.classList.add('is-visivel'));
      },
    });
  });
}

/* ── boot ──────────────────────────────────────────────────────────── */
function boot() {
  const ano = document.getElementById('year');
  if (ano) ano.textContent = String(new Date().getFullYear());

  const lenis = initLenis();
  initCursor();
  initNav(lenis);
  initMagnetic();

  initReveals(); // já divide os [data-split] internamente
  initProgress();
  initGrade();
  initFiltros();

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
