import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { escapeHtml, filesUnder, normalizeBase, noteRoute, output, publicPath, root } from './site.mjs';

const base = normalizeBase(process.env.SITE_BASE_PATH);
const site = new URL(process.env.SITE_URL || 'https://weiknight0.github.io/');
if (!['https:', 'http:'].includes(site.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
if (site.pathname !== '/' || site.search || site.hash) {
  throw new Error('Use SITE_URL for the origin and SITE_BASE_PATH for the repository path');
}
const notesRoot = path.join(root, 'notes/content');
let noteFiles;
try {
  noteFiles = await filesUnder(notesRoot);
} catch (error) {
  throw new Error('Cannot read notes/content. Restore the notes/content directory from the website repository.', { cause: error });
}
if (!noteFiles.includes('index.md')) {
  throw new Error('notes/content/index.md is missing. Restore the notes/content directory from the website repository.');
}

const notes = [];
const routes = new Set();
for (const source of noteFiles.filter((file) => /\.md$/i.test(file))) {
  const route = noteRoute(source);
  if (['_sources', 'algorithm-templates'].includes(route.split('/')[0])) {
    throw new Error(`Note uses a reserved route: ${source}`);
  }
  if (routes.has(route)) throw new Error(`Duplicate note route: ${route} (${source})`);
  routes.add(route);
  const markdown = await fs.readFile(path.join(notesRoot, source), 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  const metadata = frontmatter && YAML.parse(frontmatter[1]);
  if (typeof metadata?.title !== 'string' || !metadata.title.trim() || !metadata.date
      || Number.isNaN(Date.parse(String(metadata.date)))) {
    throw new Error(`Note needs a title and valid date in front matter: ${source}`);
  }
  notes.push({ source, route, title: metadata.title });
}

const environment = { ...process.env, SITE_URL: site.origin, SITE_BASE_PATH: base };
for (const workspace of ['frontend-v2', 'notes/reader', 'notes/algorithm-templates']) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build', '--workspace', workspace], {
    cwd: root, env: environment, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

await fs.rm(output, { recursive: true, force: true });
await fs.cp(path.join(root, 'frontend-v2/dist'), output, { recursive: true });
const readerRoot = path.join(root, 'notes/reader/dist');
await fs.cp(readerRoot, path.join(output, 'notes-reader'), { recursive: true });
const reader = await fs.readFile(path.join(readerRoot, 'index.html'), 'utf8');
await fs.rm(path.join(output, 'notes-reader/index.html'));
for (const note of notes) {
  const sourceUrl = publicPath(base, `notes/_sources/${note.source}`);
  const head = `<meta name="note-source" content="${escapeHtml(sourceUrl)}">\n`
    + `<meta name="note-path" content="${escapeHtml(note.source)}">\n`;
  const html = reader.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(note.title)} | Notes | My Homepage</title>`)
    .replace('</head>', `${head}</head>`);
  const destination = path.join(output, 'notes', note.route, 'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, html);
  const sourceDestination = path.join(output, 'notes/_sources', note.source);
  await fs.mkdir(path.dirname(sourceDestination), { recursive: true });
  await fs.copyFile(path.join(notesRoot, note.source), sourceDestination);
}

for (const asset of noteFiles.filter((file) => !/\.md$/i.test(file))) {
  if (['_sources', 'algorithm-templates'].includes(asset.split('/')[0])) {
    throw new Error(`Note asset uses a reserved path: ${asset}`);
  }
  const destination = path.join(output, 'notes', asset);
  try {
    await fs.access(destination);
    throw new Error(`Note asset collides with a page: ${asset}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(path.join(notesRoot, asset), destination);
}
await fs.cp(path.join(root, 'notes/algorithm-templates/dist'), path.join(output, 'notes/algorithm-templates'), { recursive: true });
await fs.writeFile(path.join(output, '.nojekyll'), '');
await fs.writeFile(path.join(output, 'site-build.json'), `${JSON.stringify({ base, site: site.origin, notes: notes.length }, null, 2)}\n`);

const pages = (await filesUnder(output)).filter((file) => file.endsWith('.html') && file !== '404.html');
const urls = pages.map((file) => {
  const route = file.endsWith('index.html') ? file.slice(0, -10) : file;
  return new URL(publicPath(base, route), site).href;
});
await fs.writeFile(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join('\n') + '\n</urlset>\n');
await fs.writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL(publicPath(base, 'sitemap.xml'), site).href}\n`);
console.log(`Built static site: ${pages.length} pages including ${notes.length} notes; base=${base}; output=dist/`);
