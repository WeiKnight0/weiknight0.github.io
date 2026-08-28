import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
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
const CJK_BOLD_LABEL = /(\*\*)([^*\n]+?)([：:])\1(?=[\p{Script=Han}])/gu;
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

function normalizeCjkBoldLabels(markdown) {
  return markdown.replace(CJK_BOLD_LABEL, '$1$2$1$3');
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
    .process({ path: `/notes/docs/${sourcePath}`, value: normalizeCjkBoldLabels(markdown) }));
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
  const parent = path.split('/').slice(0, -1).join('/');
  element('#notes-back').href = parent ? `/real/notes/${parent}/` : '/real/notes/';
  element('#notes-back').hidden = path === '';
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
  copy.innerHTML = '<i class="far fa-copy" aria-hidden="true"></i><span>Copy</span>';
  copy.setAttribute('aria-label', 'Copy code');
  copy.addEventListener('click', async () => {
    const icon = copy.querySelector('i');
    const text = copy.querySelector('span');
    try {
      await copyCodeText(source);
      copy.dataset.state = 'copied';
      icon.className = 'fas fa-check';
      text.textContent = 'Copied';
    } catch {
      copy.dataset.state = 'failed';
      icon.className = 'fas fa-xmark';
      text.textContent = 'Failed';
    }
    window.setTimeout(() => {
      copy.dataset.state = 'idle';
      icon.className = 'far fa-copy';
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
