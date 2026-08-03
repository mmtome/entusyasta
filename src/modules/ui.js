/* ═══════════════════════════════════════════════════════════════════
   Chrome interativo: cursor, preloader, navegação, ímã e tilt
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap';

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── cursor customizado ────────────────────────────────────────────
   Dois corpos com atrasos diferentes: o ponto acompanha na hora, o
   anel chega depois. É o que dá a sensação de peso.                 */
export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || !canHover) return { setState() {}, setLabel() {} };

  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');
  const text = document.getElementById('cursorText');

  // o ponteiro nativo só some depois que o substituto está de pé —
  // se o JS falhar, o usuário nunca fica sem cursor
  document.documentElement.classList.add('has-custom-cursor');

  const target = { x: innerWidth / 2, y: innerHeight / 2 };
  const fast = { ...target };
  const slow = { ...target };
  let locked = null;

  addEventListener(
    'pointermove',
    (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    },
    { passive: true }
  );

  gsap.ticker.add(() => {
    fast.x += (target.x - fast.x) * 0.42;
    fast.y += (target.y - fast.y) * 0.42;
    slow.x += (target.x - slow.x) * 0.15;
    slow.y += (target.y - slow.y) * 0.15;
    gsap.set(dot, { x: fast.x, y: fast.y });
    gsap.set(ring, { x: slow.x, y: slow.y });
  });

  const setLabel = (label) => {
    text.textContent = label || '';
    el.classList.toggle('is-hover', Boolean(label));
  };

  // qualquer elemento com data-cursor troca o rótulo do anel
  document.querySelectorAll('[data-cursor]').forEach((node) => {
    node.addEventListener('pointerenter', () => {
      if (!locked) setLabel(node.dataset.cursor);
    });
    node.addEventListener('pointerleave', () => {
      if (!locked) setLabel('');
    });
  });

  return {
    setState(name, on) {
      el.classList.toggle(`is-${name}`, on);
    },
    setLabel(label, lock = false) {
      locked = lock ? label : null;
      setLabel(label);
    },
  };
}

/* ── preloader ─────────────────────────────────────────────────────
   Conta até 100 com passos irregulares (nunca linear — linear parece
   falso), abre a cortina de baixo para cima e devolve uma timeline
   para o hero entrar em seguida.                                    */
export function runPreloader() {
  const root = document.getElementById('preloader');
  const fill = document.getElementById('preFill');
  const count = document.getElementById('preCount');
  const curtain = document.getElementById('curtain');
  const mark = root?.querySelector('.preloader__mark');

  document.body.classList.add('is-locked');

  const progress = { v: 0 };
  const tl = gsap.timeline();

  tl.to(mark, { opacity: 1, duration: 0.7, ease: 'power2.out' })
    .to(
      progress,
      {
        v: 100,
        duration: 2.1,
        ease: 'power2.inOut',
        onUpdate() {
          const v = Math.round(progress.v);
          count.textContent = String(v).padStart(2, '0');
          gsap.set(fill, { scaleX: v / 100 });
        },
      },
      0.15
    )
    .to(mark, { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in' }, '-=0.15')
    .to(root, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.3')
    .set(root, { display: 'none' })
    .fromTo(
      curtain,
      { yPercent: 100 },
      { yPercent: -100, duration: 1.15, ease: 'expo.inOut' },
      '-=0.35'
    )
    .add(() => {
      document.body.classList.remove('is-locked');
      curtain.style.display = 'none';
    }, '-=0.45');

  return tl;
}

/* ── navegação: some ao descer, volta ao subir ─────────────────────── */
export function initNav(lenis) {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const links = menu?.querySelectorAll('.menu__link') || [];
  let last = 0;
  let open = false;

  const onScroll = (y) => {
    nav.classList.toggle('is-stuck', y > 40);
    if (!open) nav.classList.toggle('is-hidden', y > last && y > 320);
    last = y;
  };

  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  const tl = gsap.timeline({ paused: true });
  tl.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.85, ease: 'expo.inOut' }).to(
    links,
    { y: 0, duration: 0.75, stagger: 0.06, ease: 'expo.out' },
    '-=0.45'
  );

  const toggle = (force) => {
    open = force ?? !open;
    nav.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open) {
      tl.play();
      lenis?.stop();
    } else {
      tl.reverse();
      lenis?.start();
    }
  };

  burger?.addEventListener('click', () => toggle());
  links.forEach((a) => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) toggle(false);
  });

  // âncoras internas passam pelo scroll suave
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (open) toggle(false);
      if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.3 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── botões magnéticos ─────────────────────────────────────────────── */
export function initMagnetic() {
  if (!canHover) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.34;
    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * strength);
      qy((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      qx(0);
      qy(0);
    });
  });
}

/* ── inclinação 3D nos cards ───────────────────────────────────────── */
export function initTilt() {
  if (!canHover) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tilt) || 7;
    gsap.set(el, { transformPerspective: 1000, transformOrigin: '50% 50%' });
    const qrx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const qry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      qry(px * max * 2);
      qrx(-py * max * 2);
    });
    el.addEventListener('pointerleave', () => {
      qrx(0);
      qry(0);
    });
  });
}
