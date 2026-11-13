import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { normalizeBase, output } from './site.mjs';

let build;
try {
  build = JSON.parse(await fs.readFile(path.join(output, 'site-build.json'), 'utf8'));
} catch {
  throw new Error('Build the site first with npm run build.');
}
const base = normalizeBase(build.base);
const port = Number(process.env.PORT || 4321);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Invalid URL');
    return;
  }
  if (base !== '/' && pathname === base.slice(0, -1)) {
    response.writeHead(301, { Location: base }).end();
    return;
  }
  if (!pathname.startsWith(base)) {
    response.writeHead(404).end('Not found');
    return;
  }
  let filename = path.resolve(output, pathname.slice(base.length));
  const relative = path.relative(output, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some((segment) => segment.startsWith('.'))) {
    response.writeHead(404).end('Not found');
    return;
  }
  try {
    const stat = await fs.stat(filename);
    if (stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${new URL(request.url, 'http://localhost').pathname}/${new URL(request.url, 'http://localhost').search}` }).end();
        return;
      }
      filename = path.join(filename, 'index.html');
    }
    const body = await fs.readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : await fs.readFile(path.join(output, '404.html')));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}${base}`));
