/* ═══════════════════════════════════════════════════════════════════
   Navegação do deck. Sem bibliotecas: o scroll-snap do CSS já dá
   swipe, roda de mouse e barra de rolagem; aqui entram teclado,
   bolinhas, progresso, tela cheia e o atalho para PDF.
   ═══════════════════════════════════════════════════════════════════ */

const deck = document.getElementById('deck');
const slides = [...deck.querySelectorAll('.slide')];
const pontos = document.getElementById('pontos');
const barra = document.getElementById('barra');
const rotuloAtual = document.getElementById('atual');
const rotuloTotal = document.getElementById('total');
const btnAnterior = document.getElementById('anterior');
const btnProximo = document.getElementById('proximo');

let indice = 0;
const dois = (n) => String(n).padStart(2, '0');

rotuloTotal.textContent = dois(slides.length);

/* ── bolinhas laterais ─────────────────────────────────────────────── */
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.className = 'ponto';
  b.type = 'button';
  b.setAttribute('aria-label', `Slide ${i + 1}`);
  b.addEventListener('click', () => irPara(i));
  pontos.appendChild(b);
});
const bolinhas = [...pontos.children];

/* ── estado ────────────────────────────────────────────────────────── */
function marcar(i) {
  indice = i;
  rotuloAtual.textContent = dois(i + 1);
  barra.style.width = `${((i + 1) / slides.length) * 100}%`;
  bolinhas.forEach((b, k) => b.classList.toggle('is-atual', k === i));
  btnAnterior.disabled = i === 0;
  btnProximo.disabled = i === slides.length - 1;
}

function irPara(i) {
  const alvo = Math.max(0, Math.min(slides.length - 1, i));
  slides[alvo].scrollIntoView({ behavior: 'smooth', block: 'start' });
  marcar(alvo);
}

/* ── qual slide está na tela ───────────────────────────────────────── */
const observador = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-live');
      marcar(slides.indexOf(e.target));
    }
  },
  { threshold: 0.55 }
);
slides.forEach((s) => observador.observe(s));

/* o primeiro slide entra sem esperar o scroll */
requestAnimationFrame(() => slides[0].classList.add('is-live'));

/* ── teclado ───────────────────────────────────────────────────────── */
addEventListener('keydown', (e) => {
  const avanca = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'];
  const volta = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];

  if (avanca.includes(e.key)) {
    e.preventDefault();
    irPara(indice + 1);
  } else if (volta.includes(e.key)) {
    e.preventDefault();
    irPara(indice - 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    irPara(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    irPara(slides.length - 1);
  } else if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    window.print();
  }
});

btnAnterior.addEventListener('click', () => irPara(indice - 1));
btnProximo.addEventListener('click', () => irPara(indice + 1));

/* ── abrir direto num slide: ?s=7 ou #7 ────────────────────────────── */
const pedido =
  Number(new URLSearchParams(location.search).get('s')) ||
  Number(location.hash.replace('#', ''));
if (pedido >= 1 && pedido <= slides.length) {
  requestAnimationFrame(() => irPara(pedido - 1));
}

marcar(0);
