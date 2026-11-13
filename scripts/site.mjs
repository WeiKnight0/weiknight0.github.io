import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const output = path.join(root, 'dist');

export function normalizeBase(value = '/') {
  if (!value || value === '/') return '/';
  const segments = value.replace(/^\/+|\/+$/g, '').split('/');
  if (segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment) || segment === '.' || segment === '..')) {
    throw new Error('SITE_BASE_PATH must be a URL path such as / or /wkn-personal-site/');
  }
  return `/${segments.join('/')}/`;
}

export function publicPath(base, relative = '') {
  return base + relative.split('/').map(encodeURIComponent).join('/');
}

export function noteRoute(source) {
  const route = source.replace(/\.md$/i, '').replace(/(^|\/)index$/i, '');
  return route.replace(/\/$/, '');
}

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;');
}

export async function filesUnder(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.filter((entry) => !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map(async (entry) => {
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symbolic link: ${relative}`);
      if (entry.isDirectory()) return filesUnder(path.join(directory, entry.name), relative);
      return entry.isFile() ? [relative] : [];
    }));
  return files.flat().sort();
}
