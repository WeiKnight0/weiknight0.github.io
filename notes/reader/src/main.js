import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import remarkCodeLanguageMarker from './remark-code-language-marker.mjs';
import remarkEnv from './remark-env.mjs';
import remarkNoteLinks from './remark-note-links.mjs';

const NOTE_ROUTE = /^\/real\/notes(?:\/(.*?))?\/?$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function element(selector) {
  return document.querySelector(selector);
}

function notePath() {
  const match = NOTE_ROUTE.exec(decodeURIComponent(window.location.pathname));
  if (!match) throw new Error('Invalid note route');
  return match[1] ?? '';
}

function scalar(frontMatter, name) {
  return frontMatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))[1]
    .trim()
    .replace(/^(["'])(.*)\1$/, '$2');
}

function optionalScalar(frontMatter, name) {
  const match = frontMatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^(["'])(.*)\1$/, '$2') : '';
}

function tags(frontMatter) {
  const block = frontMatter.match(/^tags:\s*\r?\n((?:\s+-\s+.*(?:\r?\n|$))*)/m);
  if (!block) return [];
  return block[1].split(/\r?\n/)
    .map((line) => line.replace(/^\s+-\s+/, '').trim())
    .filter(Boolean);
}

function parseMarkdown(markdown) {
  const match = FRONT_MATTER.exec(markdown);
  if (!match) throw new Error('Note front matter is required');
  return {
    title: scalar(match[1], 'title'),
    date: scalar(match[1], 'date'),
    lang: optionalScalar(match[1], 'lang'),
    tags: tags(match[1]),
    body: markdown.slice(match[0].length),
  };
}

async function renderMarkdown(sourcePath, markdown) {
  return String(await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEnv)
    .use(remarkMath)
    .use(remarkNoteLinks)
    .use(remarkCodeLanguageMarker)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process({ path: `/notes/docs/${sourcePath}`, value: markdown }));
}

function languageLabel(lang) {
  return {
    en: 'Language: English',
    'zh-cn': 'Language: 简体中文',
    'zh-tw': 'Language: 繁體中文',
    'zh-hk': 'Language: 繁體中文(香港)',
  }[lang] ?? 'Language: Other Language';
}

function renderMetadata(note, path) {
  document.title = `${note.title} | Notes | My Homepage`;
  element('#note-title').textContent = note.title;
  element('#note-date').dateTime = new Date(note.date).toISOString();
  element('#note-date').textContent = new Intl.DateTimeFormat(
    note.lang === 'zh-cn' ? 'zh-CN' : 'en',
    { dateStyle: 'long' },
  ).format(new Date(note.date));
  element('#note-language').textContent = languageLabel(note.lang);
  element('#note-tags').replaceChildren(...note.tags.map((tag) => {
    const item = document.createElement('span');
    item.className = 'tag';
    item.textContent = tag;
    return item;
  }));
  const parent = path.split('/').slice(0, -1).join('/');
  element('#notes-back').href = parent ? `/real/notes/${parent}/` : '/real/notes/';
  element('#notes-back').hidden = path === '';
}

function prepareCodeBlock(pre) {
  const code = pre.querySelector('code');
  const source = code.textContent;
  const marker = pre.previousElementSibling?.classList.contains('note-code-language')
    ? pre.previousElementSibling
    : null;
  const language = marker?.dataset.language
    ?? Array.from(code.classList).find((name) => name.startsWith('language-'))?.slice(9)
    ?? 'code';
  marker?.remove();
  pre.classList.add('astro-code');
  code.replaceChildren(...source.split('\n').flatMap((line, index, lines) => {
    const row = document.createElement('span');
    const number = document.createElement('span');
    row.className = 'line';
    number.className = 'line-number';
    number.textContent = String(index + 1);
    row.append(number, document.createTextNode(line));
    return index === lines.length - 1 ? [row] : [row, document.createTextNode('\n')];
  }));
  const label = document.createElement('div');
  label.className = 'code-lang-label';
  label.textContent = language;
  const copy = document.createElement('button');
  copy.className = 'copy-code-btn';
  copy.type = 'button';
  copy.textContent = 'Copy';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(source);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Failed';
    }
    window.setTimeout(() => { copy.textContent = 'Copy'; }, 1200);
  });
  pre.prepend(label, copy);
}

function initializeTools() {
  const toggle = element('#toggle-dark');
  const savedTheme = localStorage.getItem('wkn-color-theme')
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (savedTheme === 'dark') document.body.dataset.theme = 'dark';
  const updateToggle = () => {
    toggle.innerHTML = document.body.dataset.theme === 'dark'
      ? '<i class="fas fa-sun"></i><span>Light Mode</span>'
      : '<i class="fas fa-moon"></i><span>Dark Mode</span>';
  };
  updateToggle();
  toggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('wkn-color-theme', document.body.dataset.theme);
    updateToggle();
  });
  element('#print-note').addEventListener('click', () => window.print());
  document.querySelectorAll('.chapter-content img').forEach((image) => {
    image.style.cursor = 'zoom-in';
    image.addEventListener('click', () => {
      image.classList.toggle('zoomed');
      image.style.cursor = image.classList.contains('zoomed') ? 'zoom-out' : 'zoom-in';
    });
  });
  document.querySelectorAll('.chapter-content pre').forEach(prepareCodeBlock);
}

async function main() {
  const path = notePath();
  const response = await fetch(`/api/v1/notes/source?${new URLSearchParams({ path })}`);
  if (!response.ok) throw new Error(`Cannot load note: HTTP ${response.status}`);
  const source = await response.json();
  const note = parseMarkdown(source.markdown);
  renderMetadata(note, path);
  element('#note-body').innerHTML = await renderMarkdown(source.path, note.body);
  initializeTools();
}

main();
