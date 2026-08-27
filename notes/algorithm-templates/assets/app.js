const templateIndex = window.ALGORITHM_TEMPLATE_INDEX || [];
const state = { query: '', category: '全部' };

const pageType = document.body.dataset.page;
const siteRoot = new URL(document.body.dataset.siteRoot || './', window.location.href);
const categoryStorageKey = 'algorithmTemplatesCategory';

function encodeHash(value) {
  return `#${encodeURIComponent(value)}`;
}

function decodeHash() {
  if (!window.location.hash) return '';
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSearchText(item) {
  return [item.title, item.category, item.slug, ...item.problems, ...item.keywords]
    .join(' ')
    .toLowerCase();
}

function getFilteredItems() {
  const query = state.query.trim().toLowerCase();

  return templateIndex.filter((item) => {
    const categoryMatched = state.category === '全部' || item.category === state.category;
    const queryMatched = query === '' || getSearchText(item).includes(query);
    return categoryMatched && queryMatched;
  });
}

function renderCategories() {
  const categoryList = document.getElementById('category-list');
  if (!categoryList) return;

  const counts = templateIndex.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + 1;
    return map;
  }, {});

  const categories = ['全部', ...Object.keys(counts).sort((a, b) => a.localeCompare(b, 'zh-CN'))];
  categoryList.innerHTML = categories
    .map((category) => {
      const count = category === '全部' ? templateIndex.length : counts[category];
      const active = category === state.category ? ' active' : '';
      return `<button class="category-button${active}" type="button" data-category="${escapeHtml(category)}">
        <span>${escapeHtml(category)}</span>
        <span class="category-count">${count}</span>
      </button>`;
    })
    .join('');
}

function renderTemplateCards() {
  const templateList = document.getElementById('template-list');
  const resultCount = document.getElementById('result-count');
  const activeFilter = document.getElementById('active-filter');
  const emptyState = document.getElementById('empty-state');
  if (!templateList || !resultCount || !activeFilter || !emptyState) return;

  const items = getFilteredItems();
  resultCount.textContent = items.length;
  activeFilter.textContent = state.category;
  emptyState.hidden = items.length > 0;

  templateList.innerHTML = items
    .map((item) => {
      const tags = [item.category, ...item.keywords.slice(0, 4)]
        .map((tag, index) => `<span class="tag${index === 0 ? ' category' : ''}">${escapeHtml(tag)}</span>`)
        .join('');
      return `<article class="template-card">
        <header class="card-header">
          <h2>${escapeHtml(item.title)}</h2>
          <div class="tag-row">${tags}</div>
        </header>
        <div class="card-body">
          <div class="meta-grid compact">
            <div class="meta-block">
              <div class="meta-label">常见题</div>
              <div class="meta-value">${escapeHtml(item.problems.join('，'))}</div>
            </div>
            <div class="meta-block">
              <div class="meta-label">关键词</div>
              <div class="meta-value">${escapeHtml(item.keywords.join('，'))}</div>
            </div>
          </div>
          <a class="open-link" href="./${escapeHtml(item.path)}">打开模板</a>
        </div>
      </article>`;
    })
    .join('');
}

function setupIndexPage() {
  const searchInput = document.getElementById('template-search');
  const resetButton = document.getElementById('reset-filters');
  const categoryList = document.getElementById('category-list');
  const knownCategories = ['全部', ...new Set(templateIndex.map((item) => item.category))];

  const initialHash = decodeHash();
  if (initialHash && knownCategories.includes(initialHash)) {
    state.category = initialHash;
  } else {
    const storedCategory = window.sessionStorage.getItem(categoryStorageKey);
    if (storedCategory && knownCategories.includes(storedCategory)) {
      state.category = storedCategory;
    }
  }

  window.sessionStorage.setItem(categoryStorageKey, state.category);

  renderCategories();
  renderTemplateCards();
  restoreHashPosition();

  searchInput?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderTemplateCards();
  });

  resetButton?.addEventListener('click', () => {
    state.query = '';
    state.category = '全部';
    if (searchInput) searchInput.value = '';
    window.location.hash = encodeHash(state.category);
    renderCategories();
    renderTemplateCards();
  });

  categoryList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    window.sessionStorage.setItem(categoryStorageKey, state.category);
    window.location.hash = encodeHash(state.category);
    renderCategories();
    renderTemplateCards();
  });

  window.addEventListener('hashchange', () => {
    const nextHash = decodeHash();
    if (!nextHash) return;
    if (knownCategories.includes(nextHash)) {
      state.category = nextHash;
      window.sessionStorage.setItem(categoryStorageKey, state.category);
      renderCategories();
      renderTemplateCards();
    }
  });
}

function restoreHashPosition() {
  if (!window.location.hash) return;

  const slug = window.location.hash.slice(1);
  const target = Array.from(document.querySelectorAll('[data-template-slug]')).find(
    (link) => link.dataset.templateSlug === slug
  );
  target?.closest('.template-card')?.scrollIntoView({ block: 'center' });
}

function setupTemplateBackLinks() {
  const storedCategory = window.sessionStorage.getItem(categoryStorageKey) || '全部';
  const categoryHash = encodeHash(storedCategory);

  document.querySelectorAll('a[href="../index.html"]').forEach((link) => {
    link.href = `../index.html${categoryHash}`;
  });
}

function setupCopyButtons() {
  document.querySelectorAll('.code-shell').forEach((shell) => {
    if (shell.querySelector('.copy-button')) return;

    const code = shell.querySelector('.template-source, code');
    if (!code) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      try {
        const text = 'value' in code ? code.value : code.textContent;
        await navigator.clipboard.writeText(text.trim());
        button.textContent = '已复制';
      } catch {
        button.textContent = '复制失败';
      }
      window.setTimeout(() => {
        button.textContent = '复制';
      }, 1200);
    });

    shell.prepend(button);
  });
}

function resizeTemplateSources() {
  document.querySelectorAll('.template-source').forEach((source) => {
    source.style.height = 'auto';
    source.style.height = `${source.scrollHeight}px`;
  });
}

async function downloadSiteZip() {
  const downloadButton = document.getElementById('download-page');
  if (!downloadButton) return;
  if (downloadButton.dataset.busy === 'true') return;
  if (typeof JSZip === 'undefined') {
    window.alert('JSZip 加载失败，无法生成压缩包。');
    return;
  }

  const files = [
    'index.html',
    'assets/styles.css',
    'assets/color-theme.js',
    'assets/jszip.min.js',
    'assets/app.js',
    'assets/index-data.js',
    ...templateIndex.map((item) => item.path),
  ];
  const zip = new JSZip();
  const originalText = downloadButton.textContent;
  downloadButton.dataset.busy = 'true';
  downloadButton.setAttribute('aria-disabled', 'true');
  downloadButton.textContent = '打包中...';

  try {
    for (const file of files) {
      const response = await fetch(new URL(file, siteRoot), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      zip.file(file, await response.text());
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'algorithm-templates.zip';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    window.alert('压缩包生成失败，请稍后重试。');
  } finally {
    downloadButton.dataset.busy = 'false';
    downloadButton.removeAttribute('aria-disabled');
    downloadButton.textContent = originalText;
  }
}

document.getElementById('download-page')?.addEventListener('click', (event) => {
  event.preventDefault();
  void downloadSiteZip();
});

if (pageType === 'index') setupIndexPage();
if (pageType === 'template') setupTemplateBackLinks();
setupCopyButtons();
resizeTemplateSources();
