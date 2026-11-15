import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { escapeHtml, filesUnder, normalizeBase, output, publicPath, root } from './site.mjs';

const base = normalizeBase(process.env.SITE_BASE_PATH);
const site = new URL(process.env.SITE_URL || 'https://weiknight0.github.io/');
if (!['https:', 'http:'].includes(site.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
if (site.pathname !== '/' || site.search || site.hash) {
  throw new Error('Use SITE_URL for the origin and SITE_BASE_PATH for the repository path');
}
const notesSite = new URL(process.env.NOTES_SITE_URL || 'https://weiknight0.github.io/notes/');
if (!['https:', 'http:'].includes(notesSite.protocol) || notesSite.search || notesSite.hash || !notesSite.pathname.endsWith('/')) {
  throw new Error('NOTES_SITE_URL must be an HTTP(S) URL ending in / with no query or fragment');
}

const environment = { ...process.env, SITE_URL: site.origin, SITE_BASE_PATH: base, NOTES_SITE_URL: notesSite.href };
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build', '--workspace', 'frontend'], {
  cwd: root, env: environment, stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

await fs.rm(output, { recursive: true, force: true });
await fs.cp(path.join(root, 'frontend/dist'), output, { recursive: true });
await fs.writeFile(path.join(output, '.nojekyll'), '');
await fs.writeFile(path.join(output, 'site-build.json'), `${JSON.stringify({ base, site: site.origin, notesSite: notesSite.href }, null, 2)}\n`);

const pages = (await filesUnder(output)).filter((file) => file.endsWith('.html') && file !== '404.html');
const urls = pages.map((file) => {
  const route = file.endsWith('index.html') ? file.slice(0, -10) : file;
  return new URL(publicPath(base, route), site).href;
});
await fs.writeFile(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join('\n') + '\n</urlset>\n');
await fs.writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL(publicPath(base, 'sitemap.xml'), site).href}\n`);
console.log(`Built static site: ${pages.length} pages; base=${base}; output=dist/`);
