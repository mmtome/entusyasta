# Entusyasta — site institucional

Agência de growth marketing. Site de página única, escuro, com a pena da marca
reconstruída em 3D e animações amarradas ao scroll.

---

## Rodar

```bash
node serve.mjs          # http://localhost:5173
node serve.mjs 8080     # outra porta
```

Só isso. **Não há passo de build e não existe `node_modules`.**

> **Por quê:** esta pasta fica no Google Drive, que corrompe instalações do npm
> — os 1744 arquivos de uma instalação saíram todos com 0 byte, e o Windows
> recusa criar junction para um volume virtual. A solução foi remover o bundler:
> as bibliotecas ficam em `vendor/` como ESM já minificado e o navegador resolve
> os imports por *importmap*. Como efeito colateral, publicar virou copiar a pasta.

## Publicar

**No ar em https://entusyasta.vercel.app** — projeto `matheus-mm/entusyasta`.

Para reimplantar depois de mexer em qualquer arquivo:

```bash
npx vercel deploy --prod --yes
```

Se o `npx` falhar aqui (é o Google Drive de novo), instale a CLI fora do Drive e
aponte para esta pasta:

```bash
cd C:\Users\mathe\AppData\Local\entusyasta-deps && npm i -D vercel
cd "g:\Meu Drive\ENTUSYASTA\SITE"
node C:\Users\mathe\AppData\Local\entusyasta-deps\node_modules\vercel\dist\index.js deploy --prod --yes
```

O `vercel.json` desliga qualquer build (é site estático puro) e define cache
longo para `vendor/` e `fonts/`. O `.vercelignore` mantém fora do deploy os
originais em `assets/` — inclusive um instalador `.exe` de 1,7 MB que estava
ali — além do `.env.local` que a CLI cria com um token.

Serve em qualquer outra hospedagem estática do mesmo jeito (Netlify, Hostinger,
S3, Apache): os caminhos são relativos, funciona até em subdiretório.

---

## Estrutura

```
index.html              markup + importmap
src/
  main.js               orquestra tudo
  modules/
    ui.js               cursor, preloader, navegação, ímã, tilt
    motion.js           revelações, marquees, contadores, método, miniaturas
    angels.js           anjos arrastáveis e a mão de Da Vinci
    art.js              arte dos cases gerada em canvas
  styles/
    tokens.css          ← paleta e tipografia (fonte da verdade do design)
    base.css  chrome.css  sections.css
vendor/                 gsap · ScrollTrigger · lenis (ESM minificado)
img/ logos/ fonts/      assets servidos
assets/                 originais do designer (não são servidos)
PALETA-DE-CORES.txt     documentação de cor e tipografia
```

---

## Elementos visuais

**Hero:** o símbolo da marca em PNG, pequeno, logo acima do título — flutua
devagar e sobe com o scroll. O hero usa `align-content: start` de propósito: com
centramento, o título subia e descia conforme a altura da janela.

> Existiu aqui uma reconstrução 3D procedural da pena (Three.js, ~460 barbas
> geradas por código a partir da silhueta do `pena.jpg`, com girar arrastando e
> inércia). Foi substituída pelo símbolo chapado a pedido — o que também tirou
> os 724 KB do `three.js` do pacote. O histórico do arquivo `src/three/feather.js`
> tem a implementação, caso um dia queira voltar.

**Anjos:** quatro, um por seção, **sem repetir** — hero = anjo 2, manifesto =
anjo 3, método = anjo 1, CTA = anjo 4. Cada um flutua sozinho, foge do cursor
quando ele chega perto, pode ser arrastado e arremessado, e volta ao lugar por
uma mola (`src/modules/angels.js`). A mão de Da Vinci aponta na direção do
ponteiro no hero.

**Favicon:** gerado a partir de `logos/simbolo-branco.png`. O arquivo de logo é
60×165 — usado direto, viraria um risco espremido na aba. `favicon-32.png`,
`favicon-512.png` e `apple-touch-icon.png` são o mesmo símbolo centralizado num
quadrado preto com cantos arredondados, que se lê tanto em aba clara quanto
escura.

---

## Design system

Todas as cores saíram da amostragem pixel a pixel dos arquivos de logo — nenhuma
foi estimada. Documentação completa, com escalas, gradientes, contraste WCAG
calculado e regras tipográficas: **`PALETA-DE-CORES.txt`**.

| | |
|---|---|
| Ciano Entusyasta | `#00B7AC` |
| Marfim | `#FBF9F3` (não é branco puro) |
| Verde Abissal | `#00252E` |
| Preto Entusyasta | `#040707` |

Display: **Ibrand** (`fonts/Ibrand.otf`, 226 glifos, acentuação do português
completa). Texto: **Inter**.

Regra que mais importa: `#00B7AC` é cor de fundo escuro. Em superfície clara ele
reprova em contraste (2,38:1) — use `#007871`.

---

## Regenerar `vendor/`

Só é necessário ao atualizar three, gsap ou lenis. Faça **fora** do Google Drive:

```bash
mkdir /caminho/local/deps && cd /caminho/local/deps
npm init -y && npm i gsap lenis && npm i -D vite
```

Crie um arquivo por biblioteca em `vendor-src/` (`export { default } from 'gsap';`,
`export { default } from 'gsap/ScrollTrigger';`, `export { default } from 'lenis';`),
rode um `vite build` com esses três arquivos como entradas em formato `es` e
`minify: true`, e copie os `.js` resultantes para `vendor/` aqui. Os nomes
precisam bater com o importmap do `index.html`.

---

## Conteúdo a substituir antes de publicar

Os textos institucionais são reais e prontos, mas estes campos são placeholders:

- números da seção **resultados** (`data-count` no `index.html`)
- depoimentos e cases — estão descritos por segmento, sem nome de cliente
- `wa.me/5500000000000`, `contato@entusyasta.com.br` e os links de redes
