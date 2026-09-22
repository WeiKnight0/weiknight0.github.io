import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkCjkFriendly from 'remark-cjk-friendly/parseOnly';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

import remarkCodeLanguageMarker from './remark-code-language-marker.mjs';
import remarkEnv from './remark-env.mjs';
import remarkNoteLinks from './remark-note-links.mjs';

const NOTE_ROUTE = /^\/real\/notes(?:\/(.*?))?\/?$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const CODE_LANGUAGE_LABELS = {
  asm: 'Assembly',
  bash: 'Shell',
  c: 'C',
  cpp: 'C++',
  css: 'CSS',
  html: 'HTML',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  md: 'Markdown',
  python: 'Python',
  plaintext: 'Plain text',
  sh: 'Shell',
  shell: 'Shell',
  text: 'Plain text',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  yaml: 'YAML',
  yml: 'YAML',
};
const HIGHLIGHT_LANGUAGES = {
  asm: 'plaintext',
  bash: 'bash',
  c: 'c',
  cpp: 'cpp',
  css: 'css',
  html: 'xml',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  json: 'json',
  markdown: 'markdown',
  md: 'markdown',
  python: 'python',
  sh: 'bash',
  shell: 'bash',
  ts: 'typescript',
  typescript: 'typescript',
  yaml: 'yaml',
  yml: 'yaml',
};
const iconHref = (name) => `${import.meta.env.BASE_URL}icons.svg#${name}`;
const ICP_RECORD_NUMBER = import.meta.env.VITE_ICP_RECORD_NUMBER?.trim();

[
  ['bash', bash],
  ['c', c],
  ['cpp', cpp],
  ['css', css],
  ['java', java],
  ['javascript', javascript],
  ['json', json],
  ['markdown', markdown],
  ['python', python],
  ['typescript', typescript],
  ['xml', xml],
  ['yaml', yaml],
].forEach(([name, definition]) => hljs.registerLanguage(name, definition));

function element(selector) {
  return document.querySelector(selector);
}

function initializeFooter() {
  if (!ICP_RECORD_NUMBER) return;
  const link = document.createElement('a');
  link.href = 'https://beian.miit.gov.cn/';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = ICP_RECORD_NUMBER;
  element('#footer-records').append(link);
}

async function initializeAccountMenu() {
  const response = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Cannot load account: HTTP ${response.status}`);
  const account = await response.json();
  if (typeof account.username !== 'string'
    || typeof account.displayName !== 'string'
    || (account.avatarUrl !== null && typeof account.avatarUrl !== 'string')
    || (account.role !== 'admin' && account.role !== 'user')) {
    throw new Error('Invalid account response');
  }

  const name = account.displayName || account.username;
  const avatar = element('#notes-account-avatar');
  avatar.hidden = !account.avatarUrl;
  avatar.src = account.avatarUrl || '';
  avatar.alt = `${name} avatar`;
  element('#notes-account-initial').hidden = Boolean(account.avatarUrl);
  element('#notes-account-initial').textContent = name.trim().charAt(0).toUpperCase();
  element('#notes-account-menu').querySelector('.account-trigger')
    .setAttribute('aria-label', `${name} — Personal center`);
  element('#notes-account-admin').hidden = account.role !== 'admin';
  element('#notes-sign-out').addEventListener('click', async () => {
    const signOut = await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
    if (!signOut.ok) throw new Error(`Cannot sign out: HTTP ${signOut.status}`);
    window.location.replace('/');
  });
}

function notePath() {
  const match = NOTE_ROUTE.exec(decodeURIComponent(window.location.pathname));
  if (!match) throw new Error('Invalid note route');
  return match[1] ?? '';
}

function scalar(frontMatter, name) {
  return scalarValue(frontMatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))[1]);
}

function optionalScalar(frontMatter, name) {
  const match = frontMatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return match ? scalarValue(match[1]) : '';
}

function scalarValue(value) {
  const normalized = value.trim();
  if (normalized.startsWith('"') && normalized.endsWith('"')) return JSON.parse(normalized);
  return normalized.replace(/^'(.*)'$/, '$1');
}

function pageKind(frontMatter) {
  const value = optionalScalar(frontMatter, 'page');
  if (!value) return 'content';
  if (value === 'content' || value === 'index') return value;
  throw new Error(`Unsupported note page type: ${value}`);
}

function wideLayout(frontMatter) {
  const value = optionalScalar(frontMatter, 'wide');
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  throw new Error(`Unsupported wide layout value: ${value}`);
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
    page: pageKind(match[1]),
    wide: wideLayout(match[1]),
    tags: tags(match[1]),
    body: markdown.slice(match[0].length),
  };
}

async function renderMarkdown(sourcePath, markdown) {
  return String(await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCjkFriendly)
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

function codeLanguageLabel(language) {
  return CODE_LANGUAGE_LABELS[language.toLowerCase()] ?? language.toUpperCase();
}

function highlightCodeLine(line, language) {
  const registeredLanguage = HIGHLIGHT_LANGUAGES[language.toLowerCase()];
  if (!registeredLanguage) return document.createTextNode(line);
  const content = document.createElement('span');
  content.className = 'line-content';
  content.innerHTML = hljs.highlight(line, { language: registeredLanguage }).value;
  return content;
}

function legacyCopy(text) {
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.cssText = 'position:fixed;opacity:0';
  document.body.append(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Browser rejected clipboard copy');
}

async function copyCodeText(text) {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    legacyCopy(text);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // A user click permits this fallback on browsers that deny the async Clipboard API.
    legacyCopy(text);
  }
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
  document.querySelectorAll('[data-notes-back]').forEach((link) => {
    link.href = '../';
    const rootNote = path === '';
    link.hidden = false;
    link.title = rootNote ? 'Back to Real' : 'Back to parent';
    link.querySelector('.outline-parent-label').textContent = rootNote ? 'Back to Real' : 'Back to parent';
  });
}

function headingId(heading, occurrences) {
  const title = heading.textContent.trim();
  const base = title.normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '');
  if (!base) throw new Error('Note headings must contain searchable text');
  const occurrence = occurrences.get(base) ?? 0;
  occurrences.set(base, occurrence + 1);
  return occurrence === 0 ? base : `${base}-${occurrence + 1}`;
}

function revealHeading(heading) {
  for (let parent = heading.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
}

function initializeOutline(page) {
  const layout = element('#note-layout');
  const outline = element('#note-outline');
  const toggle = element('#toggle-outline');
  const toggleLabel = toggle.querySelector('.visually-hidden');
  const setCollapsed = (collapsed) => {
    layout.classList.toggle('outline-collapsed', collapsed);
    document.documentElement.dataset.notesOutline = collapsed ? 'collapsed' : 'expanded';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggleLabel.textContent = collapsed ? 'Expand table of contents' : 'Collapse table of contents';
  };
  setCollapsed(document.documentElement.dataset.notesOutline === 'collapsed');
  toggle.addEventListener('click', () => {
    const collapsed = !layout.classList.contains('outline-collapsed');
    setCollapsed(collapsed);
    localStorage.setItem('wkn-notes-outline', collapsed ? 'collapsed' : 'expanded');
  });
  const showParentOnly = () => {
    outline.classList.add('parent-only');
    outline.hidden = false;
  };
  if (page === 'index') {
    showParentOnly();
    return;
  }
  const headings = Array.from(document.querySelectorAll('#note-body h1, #note-body h2, #note-body h3, #note-body h4, #note-body h5, #note-body h6'));
  if (headings.length === 0) {
    showParentOnly();
    return;
  }

  const occurrences = new Map();
  const links = headings.map((heading) => {
    heading.id = headingId(heading, occurrences);
    const link = document.createElement('a');
    link.className = 'outline-link';
    link.href = `#${heading.id}`;
    link.dataset.headingId = heading.id;
    link.dataset.level = heading.tagName.slice(1);
    link.textContent = heading.textContent.trim();
    link.addEventListener('click', (event) => {
      event.preventDefault();
      revealHeading(heading);
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${heading.id}`);
    });
    return link;
  });
  element('#note-outline-links').replaceChildren(...links);
  outline.hidden = false;

  const activateHeading = () => {
    const threshold = window.innerHeight / 2;
    const current = headings.reduce(
      (active, heading) => !heading.closest('details:not([open])') && heading.getBoundingClientRect().top <= threshold ? heading : active,
      headings.find((heading) => !heading.closest('details:not([open])')),
    );
    links.forEach((link) => link.toggleAttribute('aria-current', link.dataset.headingId === current?.id));
  };
  let activationPending = false;
  const scheduleActivation = () => {
    if (activationPending) return;
    activationPending = true;
    requestAnimationFrame(() => {
      activationPending = false;
      activateHeading();
    });
  };
  activateHeading();
  window.addEventListener('scroll', scheduleActivation, { passive: true });
  document.addEventListener('scroll', scheduleActivation, { capture: true, passive: true });
  window.addEventListener('resize', scheduleActivation, { passive: true });
  element('#note-body').addEventListener('toggle', scheduleActivation, true);
  const initialHeading = headings.find((heading) => heading.id === decodeURIComponent(window.location.hash.slice(1)));
  if (initialHeading) {
    revealHeading(initialHeading);
    initialHeading.scrollIntoView({ block: 'start' });
  }
}

function prepareCodeBlock(pre) {
  const code = pre.querySelector('code');
  const source = code.textContent;
  const lines = source.endsWith('\n') ? source.slice(0, -1).split('\n') : source.split('\n');
  const marker = pre.previousElementSibling?.classList.contains('note-code-language')
    ? pre.previousElementSibling
    : null;
  const language = marker?.dataset.language
    ?? Array.from(code.classList).find((name) => name.startsWith('language-'))?.slice(9)
    ?? 'code';
  marker?.remove();
  pre.classList.add('astro-code');
  code.replaceChildren(...lines.map((line, index) => {
    const row = document.createElement('span');
    const number = document.createElement('span');
    row.className = 'line';
    number.className = 'line-number';
    number.textContent = String(index + 1);
    row.append(number, highlightCodeLine(line, language));
    return row;
  }));
  const toolbar = document.createElement('span');
  toolbar.className = 'code-toolbar';
  const label = document.createElement('span');
  label.className = 'code-lang-label';
  label.textContent = codeLanguageLabel(language);
  const copy = document.createElement('button');
  copy.className = 'copy-code-btn';
  copy.type = 'button';
  copy.dataset.state = 'idle';
  copy.innerHTML = `<svg class="icon" aria-hidden="true"><use href="${iconHref('copy')}"></use></svg><span>Copy</span>`;
  copy.setAttribute('aria-label', 'Copy code');
  copy.addEventListener('click', async () => {
    const icon = copy.querySelector('use');
    const text = copy.querySelector('span');
    try {
      await copyCodeText(source);
      copy.dataset.state = 'copied';
      icon.setAttribute('href', iconHref('check'));
      text.textContent = 'Copied';
    } catch {
      copy.dataset.state = 'failed';
      icon.setAttribute('href', iconHref('xmark'));
      text.textContent = 'Failed';
    }
    window.setTimeout(() => {
      copy.dataset.state = 'idle';
      icon.setAttribute('href', iconHref('copy'));
      text.textContent = 'Copy';
    }, 1200);
  });
  toolbar.append(label, copy);
  pre.prepend(toolbar);
}

function initializeTools() {
  const toggle = element('#toggle-dark');
  const savedTheme = localStorage.getItem('wkn-color-theme')
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (savedTheme === 'dark') document.body.dataset.theme = 'dark';
  const updateToggle = () => {
    const dark = document.body.dataset.theme === 'dark';
    element('#theme-icon').setAttribute('href', iconHref(dark ? 'sun' : 'moon'));
    toggle.querySelector('span').textContent = dark ? 'Light Mode' : 'Dark Mode';
  };
  updateToggle();
  toggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('wkn-color-theme', document.body.dataset.theme);
    updateToggle();
  });
  element('#print-note').addEventListener('click', () => window.print());
  let printClosedSolutions = [];
  window.addEventListener('beforeprint', () => {
    printClosedSolutions = Array.from(document.querySelectorAll('#note-body details.note-solution:not([open])'));
    printClosedSolutions.forEach((solution) => { solution.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printClosedSolutions.forEach((solution) => { solution.open = false; });
    printClosedSolutions = [];
  });
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
  initializeFooter();
  await initializeAccountMenu();
  const path = notePath();
  const response = await fetch(`/api/v1/notes/source?${new URLSearchParams({ path })}`);
  if (!response.ok) throw new Error(`Cannot load note: HTTP ${response.status}`);
  const source = await response.json();
  const note = parseMarkdown(source.markdown);
  element('.content-section').classList.toggle('wide-content', note.wide);
  element('#note-layout').classList.toggle('wide-content', note.wide);
  renderMetadata(note, path);
  element('#note-body').innerHTML = await renderMarkdown(source.path, note.body);
  initializeOutline(note.page);
  initializeTools();
}

main();
