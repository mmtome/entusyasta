# Entusyasta — site institucional

Agência de growth marketing. Site de página única, escuro, com animações
amarradas ao scroll — mais uma apresentação institucional em slides.

| | |
|---|---|
| Site | https://entusyasta.com.br · https://entusyasta.vercel.app |
| Apresentação | https://entusyasta.com.br/apresentacao/ |
| Repositório | https://github.com/mmtome/entusyasta |

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

O projeto vive em três lugares e os três precisam ser atualizados a cada
mudança: **GitHub** (fonte), **Vercel** e **HostGator**.

```bash
git add -A && git commit -m "..." && git push
```

### Vercel — projeto `matheus-mm/entusyasta`

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

### HostGator — entusyasta.com.br

Publica-se por FTPS com um script que mora fora do Drive (a dependência e as
credenciais não podem sincronizar para a nuvem):

```bash
cd C:\Users\mathe\AppData\Local\entusyasta-deps
node hg.mjs check     # olha o que existe no servidor
node hg.mjs deploy    # envia
```

**Atenção ao host:** o cPanel exibe `ftp.artmineiruberaba.com.br`, que **não tem
registro IPv4** e não conecta de jeito nenhum. O servidor que funciona é
`br196.hostgator.com.br`, porta 21, FTPS explícito.

O `.htaccess` faz lá o que o `vercel.json` faz na Vercel: nega dotfiles, `.zip`,
`.exe` e os arquivos de configuração, e liga compressão e cache. Depois de
publicar, vale conferir que `/.env.local` responde 403 e que `/src/main.js`,
`/vendor/gsap.js` e `/fonts/Ibrand.otf` respondem 200.

Serve em qualquer outra hospedagem estática do mesmo jeito (Netlify, Hostinger,
S3, Apache): os caminhos são relativos, funciona até em subdiretório.

---

## Estrutura

```
index.html              markup + importmap
apresentacao/           deck de 14 slides (index.html, deck.css, deck.js)
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

## Apresentação institucional

`apresentacao/` — 14 slides em HTML, **sem nenhuma biblioteca**. Importa
`../src/styles/tokens.css`, então herda a paleta e a tipografia do site: mudou a
cor lá, mudou aqui.

A mecânica é `scroll-snap-type: y mandatory`, o que já entrega swipe no celular,
roda de mouse, barra de rolagem e histórico do navegador de graça. O JS só
acrescenta teclado, bolinhas, barra de progresso e os atalhos.

| Atalho | |
|---|---|
| `←` `→` `↑` `↓` `PageUp/Down` `espaço` | navegar |
| `Home` / `End` | primeiro / último slide |
| `F` | tela cheia |
| `P` | imprimir — sai em A4 paisagem, um slide por página |

Abrir direto num slide: `?s=7` ou `#7`.

Roteiro: capa → o problema → quem somos → visão geral dos serviços → seis slides
de serviço (um por frente, com entregáveis) → método → números → formatos de
contrato → contato.

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
