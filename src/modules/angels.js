/* ═══════════════════════════════════════════════════════════════════
   Anjos e a mão de Da Vinci como elementos interativos.

   Os anjos flutuam sozinhos, fogem do cursor quando ele chega perto,
   podem ser arrastados e arremessados — e sempre voltam para o lugar,
   com uma mola, para não estragarem o layout.
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const REPEL_RADIUS = 210;
const RETURN = 0.045; // força da mola de volta à origem
const FRICTION = 0.9;

export function initAngels() {
  const nodes = [...document.querySelectorAll('[data-angel]')];
  if (!nodes.length) return;

  const pointer = { x: -9999, y: -9999 };
  addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true }
  );

  const angels = nodes.map((el, i) => {
    const a = {
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      seed: i * 2.7,
      dragging: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      scroll: 0,
    };

    // parallax de scroll — cada anjo em uma profundidade diferente
    gsap.to(a, {
      scroll: (i % 2 === 0 ? -1 : 1) * (60 + i * 22),
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') || el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.1,
      },
    });

    el.addEventListener('pointerdown', (e) => {
      a.dragging = true;
      a.pointerId = e.pointerId;
      a.lastX = e.clientX;
      a.lastY = e.clientY;
      a.vx = a.vy = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.zIndex = '20';
      e.preventDefault();
    });

    el.addEventListener('pointermove', (e) => {
      if (!a.dragging || e.pointerId !== a.pointerId) return;
      const dx = e.clientX - a.lastX;
      const dy = e.clientY - a.lastY;
      a.lastX = e.clientX;
      a.lastY = e.clientY;
      a.x += dx;
      a.y += dy;
      a.vx = dx;
      a.vy = dy;
      a.vrot += dx * 0.06;
    });

    const release = (e) => {
      if (!a.dragging || (e && e.pointerId !== a.pointerId)) return;
      a.dragging = false;
      // arremesso: a velocidade do gesto vira impulso
      a.vx *= 1.35;
      a.vy *= 1.35;
      el.style.zIndex = '';
    };

    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('lostpointercapture', release);

    return a;
  });

  gsap.ticker.add((time) => {
    const t = time;
    for (const a of angels) {
      if (!a.dragging) {
        // mola de volta ao ponto de origem
        a.vx += -a.x * RETURN;
        a.vy += -a.y * RETURN;

        // fuga do cursor
        if (canHover) {
          const r = a.el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_RADIUS && d > 0.01) {
            const push = (1 - d / REPEL_RADIUS) ** 2 * 2.6;
            a.vx += (dx / d) * push;
            a.vy += (dy / d) * push;
          }
        }

        a.vx *= FRICTION;
        a.vy *= FRICTION;
        a.x += a.vx;
        a.y += a.vy;

        a.vrot += -a.rot * 0.03;
        a.vrot *= 0.9;
        a.rot += a.vrot;
      }

      // flutuação constante, independente do arrasto
      const floatY = reduced ? 0 : Math.sin(t * 0.7 + a.seed) * 12;
      const floatX = reduced ? 0 : Math.cos(t * 0.45 + a.seed) * 8;
      const floatR = reduced ? 0 : Math.sin(t * 0.5 + a.seed * 1.3) * 3.5;

      gsap.set(a.el, {
        x: a.x + floatX,
        y: a.y + floatY + a.scroll,
        rotation: a.rot + floatR,
      });
    }
  });
}

/* ── a mão do hero: aponta na direção do cursor ────────────────────── */
export function initHand() {
  const hand = document.getElementById('heroHand');
  if (!hand) return;

  const qr = gsap.quickTo(hand, 'rotation', { duration: 1.1, ease: 'power3.out' });
  const qx = gsap.quickTo(hand, 'x', { duration: 1.2, ease: 'power3.out' });
  const qy = gsap.quickTo(hand, 'y', { duration: 1.2, ease: 'power3.out' });

  if (canHover) {
    addEventListener(
      'pointermove',
      (e) => {
        const r = hand.getBoundingClientRect();
        const cx = r.left + r.width * 0.8;
        const cy = r.top + r.height * 0.85;
        const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
        // gira num arco curto — a mão sugere a direção, não persegue
        qr(gsap.utils.clamp(-16, 16, (ang * 180) / Math.PI * 0.16 - 6));
        qx(gsap.utils.clamp(-26, 26, (e.clientX - cx) * 0.02));
        qy(gsap.utils.clamp(-22, 22, (e.clientY - cy) * 0.02));
      },
      { passive: true }
    );
  }

  gsap.fromTo(
    hand,
    { xPercent: 26, opacity: 0 },
    { xPercent: 0, opacity: 1, duration: 1.6, ease: 'expo.out', delay: 0.5 }
  );

  gsap.to(hand, {
    yPercent: 26,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });
}

/* garante que os gatilhos de scroll conheçam o plugin mesmo se este
   módulo for importado isolado */
gsap.registerPlugin(ScrollTrigger);
