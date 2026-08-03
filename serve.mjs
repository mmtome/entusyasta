/* ═══════════════════════════════════════════════════════════════════
   Servidor estático sem dependências.

   Este projeto mora no Google Drive, que corrompe instalações de npm
   (o node_modules sai com arquivos de 0 byte). Por isso o site roda
   sem bundler: as bibliotecas estão em /vendor como ESM minificado e
   o navegador resolve os imports por importmap.

     node serve.mjs            → http://localhost:5173
     node serve.mjs 8080       → outra porta

   Para publicar, basta enviar esta pasta para qualquer hospedagem
   estática. Não há passo de build.
   ═══════════════════════════════════════════════════════════════════ */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.join(ROOT, url === '/' ? 'index.html' : url);

  // nunca sair da pasta do projeto
  if (!path.resolve(file).startsWith(path.resolve(ROOT))) {
    res.writeHead(403).end('403');
    return;
  }

  fs.stat(file, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`404 — ${url}`);
      return;
    }
    if (stat.isDirectory()) file = path.join(file, 'index.html');

    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'content-type': type,
      'cache-control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n  entusyasta  →  http://localhost:${PORT}\n`);
});
