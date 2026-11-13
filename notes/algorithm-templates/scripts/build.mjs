import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(root, 'content');
const outputDirectory = path.join(root, 'dist');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sourcePattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n+```([a-z0-9+#-]+)\r?\n([\s\S]*?)\r?\n```(?:\r?\n+([\s\S]*?))?\s*$/;
const assetFiles = ['app.js', 'color-theme.js', 'jszip.min.js', 'styles.css'];
const baseInput = (process.env.SITE_BASE_PATH ?? '/').trim() || '/';
if (!baseInput.startsWith('/') || baseInput.startsWith('//') || /[?#\\]/.test(baseInput)
    || baseInput.split('/').some((part) => part === '.' || part === '..')) {
  throw new Error('SITE_BASE_PATH must be / or a root-relative path such as /repo/');
}
const siteBasePath = `${baseInput.replace(/\/+$/, '')}/`;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const strings = (value) => Array.isArray(value)
  && value.every((item) => typeof item === 'string' && item.trim() !== '');

const parseTemplate = (filename, source) => {
  const slug = path.basename(filename, '.md');
  const match = source.replace(/\r\n?/g, '\n').match(sourcePattern);
  if (!match) throw new Error(`${filename}: expected front matter followed by one template code block`);
  const metadata = YAML.parse(match[1]);
  if (!slugPattern.test(slug)
      || typeof metadata?.title !== 'string' || metadata.title.trim() === ''
      || typeof metadata.category !== 'string' || metadata.category.trim() === ''
      || !Number.isInteger(metadata.order) || metadata.order < 1
      || !strings(metadata.problems) || !strings(metadata.keywords) || !strings(metadata.tags)) {
    throw new Error(`${filename}: invalid template metadata`);
  }
  return {
    slug,
    title: metadata.title.trim(),
    category: metadata.category.trim(),
    order: metadata.order,
    problems: metadata.problems,
    keywords: metadata.keywords,
    tags: metadata.tags,
    language: match[2],
    code: match[3],
    details: match[4]?.trim() ?? '',
    path: `templates/${slug}.html`,
  };
};

const renderLayout = (layout, values) => layout.replace(/{{([A-Z_]+)}}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Missing layout value: ${key}`);
  return values[key];
});

const renderTags = (tags) => tags
  .map((tag, index) => `<span class="tag${index === 0 ? ' category' : ''}">${escapeHtml(tag)}</span>`)
  .join('');

const loadTemplates = async () => {
  const templates = await Promise.all((await fs.readdir(contentDirectory))
    .filter((filename) => filename.endsWith('.md'))
    .map(async (filename) => parseTemplate(
      filename,
      await fs.readFile(path.join(contentDirectory, filename), 'utf8'),
    )));
  if (new Set(templates.map((template) => template.slug)).size !== templates.length
      || new Set(templates.map((template) => template.order)).size !== templates.length) {
    throw new Error('Template slugs and order values must be unique');
  }
  return templates.sort((left, right) => left.order - right.order);
};

const build = async () => {
  const templates = await loadTemplates();
  const templateLayout = await fs.readFile(path.join(root, 'layouts/template.html'), 'utf8');
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(path.join(outputDirectory, 'assets'), { recursive: true });
  await fs.mkdir(path.join(outputDirectory, 'templates'), { recursive: true });
  const indexLayout = await fs.readFile(path.join(root, 'layouts/index.html'), 'utf8');
  await fs.writeFile(path.join(outputDirectory, 'index.html'), renderLayout(indexLayout, {
    SITE_BASE_PATH: escapeHtml(siteBasePath),
  }));
  await Promise.all(assetFiles.map((filename) => fs.copyFile(
    path.join(root, 'assets', filename),
    path.join(outputDirectory, 'assets', filename),
  )));
  await Promise.all(templates.map((template) => fs.writeFile(
    path.join(outputDirectory, template.path),
    renderLayout(templateLayout, {
      SITE_BASE_PATH: escapeHtml(siteBasePath),
      TITLE: escapeHtml(template.title),
      CATEGORY: escapeHtml(template.category),
      HEADING: escapeHtml(template.title),
      TAGS: renderTags(template.tags),
      CODE: escapeHtml(template.code),
      DETAILS: template.details
        ? `<section class="usage-note">${marked.parse(template.details)}</section>`
        : '',
    }),
  )));
  await fs.writeFile(
    path.join(outputDirectory, 'assets/index-data.js'),
    `window.ALGORITHM_TEMPLATE_INDEX = ${JSON.stringify(templates.map((template) => ({
      slug: template.slug,
      title: template.title,
      category: template.category,
      problems: template.problems,
      keywords: template.keywords,
      path: template.path,
    })), null, 2)};\n`,
  );
  console.log(`Built ${templates.length} algorithm templates (${crypto.createHash('sha256')
    .update(templates.map((template) => `${template.slug}\0${template.code}`).join('\0'))
    .digest('hex')})`);
};

await build();
