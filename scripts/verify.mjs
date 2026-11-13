import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';
import { filesUnder, noteRoute, output, publicPath, root } from './site.mjs';

const build = JSON.parse(await fs.readFile(path.join(output, 'site-build.json'), 'utf8'));
const origin = new URL(build.site).origin;
const files = await filesUnder(output);
const available = new Set(files);
const failures = new Set();
let links = 0;

function checkUrl(value, source, pageUrl) {
  if (!value || /^(?:#|data:|mailto:|tel:|javascript:)/i.test(value)) return;
  let url;
  try {
    url = new URL(value, pageUrl);
  } catch {
    failures.add(`${source}: invalid URL ${value}`);
    return;
  }
  if (url.origin !== origin) return;
  links += 1;
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    failures.add(`${source}: invalid URL encoding ${value}`);
    return;
  }
  if (!pathname.startsWith(build.base)) {
    failures.add(`${source}: URL outside site base ${value}`);
    return;
  }
  const relative = pathname.slice(build.base.length);
  if (!available.has(relative) && !available.has(`${relative.replace(/\/$/, '')}${relative ? '/' : ''}index.html`)) {
    failures.add(`${source}: missing ${value}`);
  }
}

function checkHtml(html, source, pageUrl) {
  const visit = (node) => {
    const attributes = Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
    for (const name of ['href', 'src', 'poster']) {
      if (attributes[name] && !(node.nodeName === 'use' && attributes[name].startsWith('#'))) {
        checkUrl(attributes[name], source, pageUrl);
      }
    }
    if (node.nodeName === 'meta' && attributes.name === 'note-source') {
      checkUrl(attributes.content, source, pageUrl);
    }
    for (const child of node.childNodes || []) visit(child);
  };
  visit(parse(html));
}

for (const file of files.filter((file) => file.endsWith('.html'))) {
  const html = await fs.readFile(path.join(output, file), 'utf8');
  const route = file.endsWith('index.html') ? file.slice(0, -10) : file;
  checkHtml(html, file, new URL(publicPath(build.base, route), origin));
  if (/\/api\/v1|data-account-(?:login|logout|profile)/.test(html)) {
    failures.add(`${file}: obsolete account/API markup`);
  }
}

const { renderMarkdown } = await import('../notes/reader/src/render-markdown.mjs');
const noteFiles = (await filesUnder(path.join(root, 'notes/content'))).filter((file) => /\.md$/i.test(file));
for (const file of noteFiles) {
  const markdown = await fs.readFile(path.join(root, 'notes/content', file), 'utf8');
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const html = await renderMarkdown(file, body, build.base);
  const route = noteRoute(file);
  checkHtml(html, `notes/content/${file}`, new URL(publicPath(build.base, `notes/${route ? `${route}/` : ''}`), origin));
}

for (const file of files.filter((file) => file.endsWith('.js'))) {
  if ((await fs.readFile(path.join(output, file), 'utf8')).includes('/api/v1/')) {
    failures.add(`${file}: obsolete backend API call`);
  }
}
if (!available.has('404.html')) failures.add('Missing GitHub Pages 404.html');
if (failures.size) {
  console.error([...failures].sort().join('\n'));
  throw new Error(`Static verification failed: ${failures.size} issues`);
}
console.log(`Verified ${files.filter((file) => file.endsWith('.html')).length} HTML pages, ${noteFiles.length} rendered notes and ${links} local links/assets (base=${build.base}).`);
