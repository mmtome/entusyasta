/* ═══════════════════════════════════════════════════════════════════
   Movimento ligado ao scroll: revelações, marquees, contadores,
   método em scroll fixo e a miniatura que segue o cursor.
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── divisão em palavras preservando <em>, <strong> etc. ───────────── */
export function splitWords(root) {
  if (root.dataset.split === 'done') return root.querySelectorAll('.wi');

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    const parts = node.nodeValue.split(/(\s+)/);
    parts.forEach((part) => {
      if (!part) return;
      if (!part.trim()) {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      const outer = document.createElement('span');
      outer.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = part;
      outer.appendChild(inner);
      frag.appendChild(outer);
    });
    node.parentNode.replaceChild(frag, node);
  });

  root.dataset.split = 'done';
  return root.querySelectorAll('.wi');
}

/* ── revelações genéricas ──────────────────────────────────────────── */
export function initReveals({ skip = null } = {}) {
  const keep = (el) => !skip || !el.closest(skip);

  [...document.querySelectorAll('[data-split]')].filter(keep).forEach((el) => {
    const words = splitWords(el);
    if (reduced) {
      gsap.set(words, { y: 0 });
      return;
    }
    gsap.to(words, {
      y: 0,
      duration: 1.05,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  [...document.querySelectorAll('[data-reveal]')].filter(keep).forEach((el) => {
    gsap.fromTo(
      el,
      { y: reduced ? 0 : 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  [...document.querySelectorAll('[data-stagger]')].filter(keep).forEach((el) => {
    gsap.fromTo(
      el.children,
      { y: reduced ? 0 : 22, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.6)',
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });

}

/* ── marquee que reage à velocidade do scroll ──────────────────────── */
export function initMarquee(lenis) {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  const original = [...track.children];
  // duplicamos o suficiente para cobrir a tela com folga
  for (let i = 0; i < 3; i++) {
    original.forEach((n) => track.appendChild(n.cloneNode(true)));
  }

  const loopWidth = () => track.scrollWidth / 4;
  let x = 0;
  let base = -0.55; // px por frame
  let boost = 0;

  lenis?.on('scroll', ({ velocity }) => {
    boost = gsap.utils.clamp(-42, 42, velocity * 0.9);
  });

  gsap.ticker.add(() => {
    boost *= 0.93;
    x += base - boost * 0.1;
    const w = loopWidth();
    if (w > 0) x = ((x % w) + w) % w;
    gsap.set(track, { x: -x });
  });
}

/* ── trilho de depoimentos empurrado pelo scroll ───────────────────── */
export function initQuotes() {
  const track = document.getElementById('quotesTrack');
  if (!track) return;
  const overflow = () => Math.max(0, track.scrollWidth - innerWidth + 80);

  gsap.fromTo(
    track,
    { x: () => innerWidth * 0.06 },
    {
      x: () => -overflow(),
      ease: 'none',
      scrollTrigger: {
        trigger: track.parentElement,
        start: 'top 78%',
        end: 'bottom top',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    }
  );
}

/* ── contadores ────────────────────────────────────────────────────── */
export function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 2.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate() {
        el.textContent = obj.v.toFixed(decimals).replace('.', ',');
      },
    });
  });
}

/* ── método: passo ativo + contador gigante ────────────────────────── */
export function initMethod() {
  const steps = [...document.querySelectorAll('.step')];
  const counter = document.getElementById('methodCounter');
  if (!steps.length) return;

  // um passo ativo por vez: start e end na MESMA linha da tela, senão
  // vários intervalos se sobrepõem e todos os cards acendem juntos
  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (counter) counter.textContent = String(i + 1).padStart(2, '0');
  };

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });

    gsap.fromTo(
      step,
      { y: reduced ? 0 : 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: step, start: 'top 90%', once: true },
      }
    );
  });
}

/* ── miniatura que persegue o cursor na lista de serviços ──────────── */
export function initServicePreview(artUrls) {
  const box = document.getElementById('svcPreview');
  const list = document.getElementById('svcList');
  if (!box || !list || !canHover) return;

  artUrls.forEach((url) => {
    const img = document.createElement('div');
    img.className = 'svc-preview__img';
    img.style.backgroundImage = `url(${url})`;
    box.appendChild(img);
  });

  const imgs = [...box.children];
  const qx = gsap.quickTo(box, 'x', { duration: 0.62, ease: 'power3.out' });
  const qy = gsap.quickTo(box, 'y', { duration: 0.62, ease: 'power3.out' });
  const qr = gsap.quickTo(box, 'rotation', { duration: 0.9, ease: 'power3.out' });

  let lastX = 0;
  addEventListener(
    'pointermove',
    (e) => {
      qx(e.clientX);
      qy(e.clientY);
      qr(gsap.utils.clamp(-11, 11, (e.clientX - lastX) * 0.7));
      lastX = e.clientX;
    },
    { passive: true }
  );

  list.querySelectorAll('.svc').forEach((svc) => {
    const idx = Number(svc.dataset.preview);
    svc.addEventListener('pointerenter', () => {
      imgs.forEach((n, i) => n.classList.toggle('is-active', i === idx));
      gsap.to(box, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    });
  });

  list.addEventListener('pointerleave', () => {
    gsap.to(box, { opacity: 0, scale: 0.86, duration: 0.4, ease: 'power3.out' });
  });

  gsap.set(box, { scale: 0.86, opacity: 0 });
}

/* ── penas decorativas com parallax entre as seções ────────────────── */
export function initPlumes() {
  const spots = [
    { parent: '#servicos', css: { right: '-6%', top: '4%', width: '30vw', rotate: 14 }, depth: 0.18 },
    { parent: '#cases', css: { left: '-8%', bottom: '-6%', width: '26vw', rotate: -22 }, depth: -0.14 },
    { parent: '#depoimentos', css: { right: '2%', top: '-8%', width: '18vw', rotate: 38 }, depth: 0.1 },
  ];

  spots.forEach(({ parent, css, depth }) => {
    const host = document.querySelector(parent);
    if (!host) return;
    const img = document.createElement('img');
    img.className = 'plume';
    img.src = 'img/pena.png';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    Object.assign(img.style, {
      right: css.right ?? 'auto',
      left: css.left ?? 'auto',
      top: css.top ?? 'auto',
      bottom: css.bottom ?? 'auto',
      width: css.width,
      transform: `rotate(${css.rotate}deg)`,
    });
    host.appendChild(img);

    gsap.to(img, {
      yPercent: depth * 100,
      rotate: css.rotate + depth * 26,
      ease: 'none',
      scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });
}

/* ── barra de progresso do documento ───────────────────────────────── */
export function initProgress() {
  const fill = document.getElementById('progressFill');
  if (!fill) return;
  gsap.to(fill, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}
