import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  tags: string;
  content?: string;
}

interface LegacyBlog {
  slug: string;
  content: string;
}

const element = <T extends Element>(selector: string) => {
  const matched = document.querySelector<T>(selector);
  if (!matched) throw new Error(`Required blog editor element is missing: ${selector}`);
  return matched;
};
const control = <T extends HTMLInputElement | HTMLTextAreaElement>(form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as T;
const form = element<HTMLFormElement>('#post-form');
const emptyEditor = element<HTMLElement>('#empty-editor');
const list = element<HTMLElement>('#posts-list');
const saveState = element<HTMLElement>('#save-state');
const notice = element<HTMLElement>('#notice');
const contentField = control<HTMLTextAreaElement>(form, 'content');
const titleField = control<HTMLInputElement>(form, 'title');
const slugField = control<HTMLInputElement>(form, 'slug');
let posts: Blog[] = [];
let selectedId: number | null = null;
let dirty = false;
let loadingEditor = false;
let creating = false;
let slugWasEdited = false;
let legacySources: LegacyBlog[] | undefined;
let noticeTimeout = 0;

const formatDate = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
const toLocalDateTime = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const slugify = (value: string) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);

const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
  notice.textContent = message;
  notice.className = `mb-5 border px-4 py-3 text-sm ${type === 'error'
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  window.clearTimeout(noticeTimeout);
  noticeTimeout = window.setTimeout(() => notice.classList.add('hidden'), 4500);
};

const updateSaveState = () => {
  saveState.textContent = loadingEditor ? 'Loading blog…' : dirty ? 'Unsaved changes' : 'No unsaved changes';
  saveState.classList.toggle('text-amber-200', dirty);
  saveState.classList.toggle('text-white/45', !dirty);
  element<HTMLElement>('#content-count').textContent = `${contentField.value.length.toLocaleString()} characters`;
};

const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved changes?');

const renderList = () => {
  const query = element<HTMLInputElement>('#post-search').value.trim().toLowerCase();
  const visible = posts.filter((post) => `${post.title} ${post.slug}`.toLowerCase().includes(query));
  element<HTMLElement>('#post-count').textContent = `${posts.length} blog${posts.length === 1 ? '' : 's'}`;
  if (!visible.length) {
    list.innerHTML = `<p class="px-3 py-8 text-center text-sm text-white/40">${posts.length ? 'No matching blogs.' : 'No blogs yet. Create your first one.'}</p>`;
    return;
  }
  list.innerHTML = visible.map((post) => {
    const active = post.id === selectedId;
    return `<button type="button" data-post-id="${post.id}" class="mb-1 w-full border-l-2 p-3 text-left transition ${active ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:border-white/30 hover:bg-white/5'}"><span class="block truncate font-bold ${active ? 'text-real-accent' : 'text-white/85'}">${escapeHtml(post.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(post.slug)}</span><span class="mt-2 block text-xs text-white/30">${formatDate(post.publishedAt)}</span></button>`;
  }).join('');
};

const loadLegacyContent = async (slug: string) => {
  if (!legacySources) {
    const response = await fetch('/blog-sources.json', { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Legacy blog source loading failed (${response.status}).`);
    legacySources = await response.json() as LegacyBlog[];
  }
  return legacySources.find((item) => item.slug.toLowerCase() === slug.toLowerCase())?.content || '';
};

const showForm = () => {
  emptyEditor.classList.add('hidden');
  form.classList.remove('hidden');
};

const fillForm = async (post: Blog) => {
  loadingEditor = true;
  showForm();
  control<HTMLInputElement>(form, 'id').value = String(post.id);
  titleField.value = post.title;
  slugField.value = post.slug;
  control<HTMLTextAreaElement>(form, 'description').value = post.description;
  control<HTMLInputElement>(form, 'publishedAt').value = toLocalDateTime(post.publishedAt);
  control<HTMLInputElement>(form, 'tags').value = post.tags || '';
  contentField.value = post.content || await loadLegacyContent(post.slug);
  selectedId = post.id;
  creating = false;
  slugWasEdited = true;
  dirty = false;
  loadingEditor = false;
  element<HTMLElement>('#editor-mode').textContent = 'Editing blog';
  element<HTMLElement>('#delete-post').classList.remove('hidden');
  const preview = element<HTMLAnchorElement>('#preview-post');
  preview.classList.remove('hidden');
  preview.href = `/real/blog/${encodeURIComponent(post.slug)}/`;
  updateSaveState();
  renderList();
  titleField.focus();
};

const selectPost = async (id: number, skipConfirm = false) => {
  if (id === selectedId && !creating) return;
  if (!skipConfirm && !confirmDiscard()) return;
  selectedId = id;
  renderList();
  loadingEditor = true;
  updateSaveState();
  try {
    await fillForm(await siteApi<Blog>(`/admin/posts/${id}`));
  } catch (reason) {
    const error = reason as SiteApiError;
    selectedId = null;
    renderList();
    showNotice(error.message, 'error');
    if (error.status === 403) location.replace('/login/');
  } finally {
    loadingEditor = false;
    updateSaveState();
  }
};

const newPost = () => {
  if (!confirmDiscard()) return;
  form.reset();
  showForm();
  selectedId = null;
  creating = true;
  slugWasEdited = false;
  dirty = false;
  control<HTMLInputElement>(form, 'publishedAt').value = toLocalDateTime();
  element<HTMLElement>('#editor-mode').textContent = 'New blog';
  element<HTMLElement>('#delete-post').classList.add('hidden');
  element<HTMLElement>('#preview-post').classList.add('hidden');
  updateSaveState();
  renderList();
  titleField.focus();
};

const loadPosts = async (select = true, preferredId: number | null = null) => {
  posts = await siteApi<Blog[]>('/admin/posts');
  renderList();
  if (!select || !posts.length) return;
  const target = posts.find((post) => post.id === preferredId) || posts[0];
  if (!target) return;
  if (preferredId) selectedId = null;
  await selectPost(target.id, true);
};

form.addEventListener('input', (event) => {
  if (loadingEditor) return;
  if (event.target === slugField) slugWasEdited = true;
  if (event.target === titleField && creating && !slugWasEdited) slugField.value = slugify(titleField.value);
  dirty = true;
  updateSaveState();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (!contentField.value.trim()) {
    showNotice('Blog content cannot be empty.', 'error');
    contentField.focus();
    return;
  }
  const id = control<HTMLInputElement>(form, 'id').value;
  const button = element<HTMLButtonElement>('#save-post');
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    const saved = await siteApi<Blog>(`/admin/posts${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({
        slug: slugField.value.trim(),
        title: titleField.value.trim(),
        description: control<HTMLTextAreaElement>(form, 'description').value.trim(),
        tags: control<HTMLInputElement>(form, 'tags').value.split(',').map((tag) => tag.trim()).filter(Boolean).join(','),
        publishedAt: new Date(control<HTMLInputElement>(form, 'publishedAt').value).toISOString(),
        content: contentField.value,
      }),
    });
    dirty = false;
    showNotice(id ? 'Blog saved.' : 'Blog created.');
    await loadPosts(true, saved.id);
  } catch (reason) {
    const error = reason as SiteApiError;
    showNotice(error.message, 'error');
    if (error.status === 403) location.replace('/login/');
  } finally {
    button.disabled = false;
    button.textContent = 'Save blog';
    updateSaveState();
  }
});

list.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-post-id]');
  if (button?.dataset.postId) void selectPost(Number(button.dataset.postId));
});
element<HTMLInputElement>('#post-search').addEventListener('input', renderList);
element<HTMLButtonElement>('#new-post').addEventListener('click', newPost);
element<HTMLButtonElement>('#delete-post').addEventListener('click', async () => {
  if (!selectedId || !window.confirm(`Delete “${titleField.value}”? This cannot be undone.`)) return;
  try {
    await siteApi(`/admin/posts/${selectedId}`, { method: 'DELETE' });
    dirty = false;
    selectedId = null;
    form.classList.add('hidden');
    emptyEditor.classList.remove('hidden');
    showNotice('Blog deleted.');
    await loadPosts();
  } catch (reason) {
    showNotice((reason as SiteApiError).message, 'error');
  }
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !form.classList.contains('hidden')) {
    event.preventDefault();
    form.requestSubmit();
  }
});
window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return loadPosts();
}).catch((reason: SiteApiError) => {
  if (reason.status === 403) location.replace('/login/');
  else showNotice(reason.message, 'error');
});
