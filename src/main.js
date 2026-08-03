/* ═══════════════════════════════════════════════════════════════════
   ENTUSYASTA — orquestração
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initCursor, runPreloader, initNav, initMagnetic, initTilt } from './modules/ui.js';
import {
  splitWords,
  initReveals,
  initMarquee,
  initQuotes,
  initCounters,
  initMethod,
  initServicePreview,
  initPlumes,
  initProgress,
} from './modules/motion.js';
import { initAngels, initHand } from './modules/angels.js';
import { paintCases, serviceArt } from './modules/art.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── scroll suave ──────────────────────────────────────────────────── */
function initLenis() {
  if (reduced) return null;
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ── entrada do hero, disparada quando o preloader sai ─────────────── */
function heroIntro() {
  const title = document.querySelector('.hero__title');
  const words = title ? splitWords(title) : [];
  const symbol = document.getElementById('heroSymbol');
  const sub = document.querySelector('.hero__sub');
  const pills = document.querySelectorAll('.pills > *');
  const scroll = document.querySelector('.hero__scroll');

  gsap.set([sub, scroll], { opacity: 0, y: 22 });
  gsap.set(pills, { opacity: 0, y: 20, scale: 0.95 });
  gsap.set(symbol, { opacity: 0, y: -18, scale: 0.82 });

  const tl = gsap.timeline({ delay: 0.1 });
  tl.to(symbol, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' })
    .to(words, { y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035 }, '-=0.7')
    .to(sub, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
    .to(
      pills,
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.055 },
      '-=0.55'
    )
    .to(scroll, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');

  return tl;
}

/* ── o símbolo respira e sobe com o scroll ─────────────────────────── */
function initSymbol() {
  const symbol = document.getElementById('heroSymbol');
  if (!symbol || reduced) return;

  gsap.to(symbol, {
    y: '+=9',
    duration: 2.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: 3.2, // só depois que a entrada terminou
  });

  gsap.to(symbol, {
    yPercent: -70,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
  });
}

/* ── boot ──────────────────────────────────────────────────────────── */
function boot() {
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const lenis = initLenis();
  initCursor();

  initNav(lenis);
  initMagnetic();
  initTilt();

  paintCases();
  initServicePreview(serviceArt(6));

  initReveals({ skip: '#hero' });
  initMarquee(lenis);
  initQuotes();
  initCounters();
  initMethod();
  initPlumes();
  initProgress();

  initAngels();
  initHand();
  initSymbol();

  // esconde a entrada do hero até o preloader terminar
  const title = document.querySelector('.hero__title');
  if (title) splitWords(title);

  runPreloader().add(heroIntro(), '-=0.55');

  // o layout só é confiável depois das fontes
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
