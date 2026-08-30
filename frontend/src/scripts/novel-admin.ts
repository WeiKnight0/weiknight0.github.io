import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface Novel {
  id: number;
  slug: string;
  title: string;
  description: string;
  displayOrder: number;
}

interface Chapter {
  id: number;
  slug: string;
  title: string;
  content: string;
  displayOrder: number;
}

const root = document.querySelector<HTMLElement>('[data-novel-admin]');
if (!root) throw new Error('Novel administration root is missing.');

const element = <T extends Element>(selector: string) => {
  const matched = root.querySelector<T>(selector);
  if (!matched) throw new Error(`Required novel editor element is missing: ${selector}`);
  return matched;
};
const field = <T extends HTMLInputElement | HTMLTextAreaElement>(
  form: HTMLFormElement,
  name: string,
) => form.elements.namedItem(name) as T;
const message = (reason: unknown) => reason instanceof SiteApiError
  ? reason.message
  : 'The request failed.';

const novelForm = element<HTMLFormElement>('#novel-form');
const chapterForm = element<HTMLFormElement>('#chapter-form');
const novelList = element<HTMLElement>('#novel-list');
const chapterList = element<HTMLElement>('#chapter-list');
let novels: Novel[] = [];
let chapters: Chapter[] = [];
let selectedNovelId: number | null = null;
let selectedChapterId: number | null = null;
const novelMoveButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-novel-move]'));
const chapterMoveButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-chapter-move]'));

const showNotice = (text: string, error = false) => {
  const notice = element<HTMLElement>('#novel-notice');
  notice.className = `mb-5 border px-4 py-3 text-sm ${error
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  notice.textContent = text;
};

const syncMoveButtons = <T extends { id: number }>(
  items: T[],
  selectedId: number | null,
  buttons: HTMLButtonElement[],
) => {
  const index = items.findIndex((item) => item.id === selectedId);
  buttons.forEach((button) => {
    button.hidden = index < 0;
    button.disabled = button.dataset.novelMove === 'up' || button.dataset.chapterMove === 'up'
      ? index <= 0
      : index < 0 || index === items.length - 1;
  });
};

const renderNovels = () => {
  const query = element<HTMLInputElement>('#novel-search').value.trim().toLowerCase();
  const visible = novels.filter((novel) => `${novel.title} ${novel.slug}`.toLowerCase().includes(query));
  element<HTMLElement>('#novel-count').textContent = `${novels.length} ${novels.length === 1 ? 'novel' : 'novels'}`;
  novelList.innerHTML = visible.length
    ? visible.map((novel) => `<button type="button" data-novel-id="${novel.id}" class="mb-1 flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${novel.id === selectedNovelId ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:bg-white/5'}"><span class="min-w-0 flex-1"><span class="block truncate font-bold text-white">${escapeHtml(novel.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(novel.slug)}</span></span></button>`).join('')
    : '<p class="p-6 text-center text-sm text-white/40">No matching novels.</p>';
  syncMoveButtons(novels, selectedNovelId, novelMoveButtons);
};

const renderChapters = () => {
  element<HTMLElement>('#chapter-count').textContent = `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}`;
  chapterList.innerHTML = chapters.length
    ? chapters.map((chapter) => `<button type="button" data-chapter-id="${chapter.id}" class="flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${chapter.id === selectedChapterId ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:bg-white/5'}"><span class="min-w-0 flex-1"><span class="block truncate font-bold text-white">${escapeHtml(chapter.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(chapter.slug)}</span></span></button>`).join('')
    : '<p class="p-6 text-center text-sm text-white/40">No chapters yet.</p>';
  syncMoveButtons(chapters, selectedChapterId, chapterMoveButtons);
};

const showNovel = (novel: Novel) => {
  selectedNovelId = novel.id;
  field<HTMLInputElement>(novelForm, 'id').value = String(novel.id);
  field<HTMLInputElement>(novelForm, 'title').value = novel.title;
  field<HTMLInputElement>(novelForm, 'slug').value = novel.slug;
  field<HTMLInputElement>(novelForm, 'slug').disabled = false;
  field<HTMLTextAreaElement>(novelForm, 'description').value = novel.description;
  element<HTMLElement>('#novel-slug-field').hidden = false;
  element<HTMLElement>('#novel-mode').textContent = 'Editing novel';
  element<HTMLElement>('#novel-workspace').classList.remove('hidden');
  element<HTMLElement>('#novel-empty').classList.add('hidden');
  element<HTMLElement>('#novel-delete').hidden = false;
  const preview = element<HTMLAnchorElement>('#novel-preview');
  preview.hidden = false;
  preview.href = `/fiction/novels/${encodeURIComponent(novel.slug)}/`;
  element<HTMLElement>('#chapter-manager').hidden = false;
  renderNovels();
};

const loadChapters = async () => {
  if (!selectedNovelId) throw new Error('A novel must be selected before loading chapters.');
  chapters = await siteApi<Chapter[]>(`/admin/fiction/novels/${selectedNovelId}/chapters`);
  selectedChapterId = null;
  chapterForm.hidden = true;
  element<HTMLElement>('#chapter-empty').classList.remove('hidden');
  renderChapters();
};

const selectNovel = async (id: number) => {
  showNovel(await siteApi<Novel>(`/admin/fiction/novels/${id}`));
  await loadChapters();
};

const loadNovels = async (preferredId?: number) => {
  novels = await siteApi<Novel[]>('/admin/fiction/novels');
  renderNovels();
  if (preferredId) await selectNovel(preferredId);
};

const newNovel = () => {
  novelForm.reset();
  selectedNovelId = null;
  selectedChapterId = null;
  element<HTMLElement>('#novel-mode').textContent = 'New novel';
  element<HTMLElement>('#novel-workspace').classList.remove('hidden');
  element<HTMLElement>('#novel-empty').classList.add('hidden');
  element<HTMLElement>('#novel-delete').hidden = true;
  element<HTMLElement>('#novel-preview').hidden = true;
  element<HTMLElement>('#novel-slug-field').hidden = true;
  field<HTMLInputElement>(novelForm, 'slug').disabled = true;
  element<HTMLElement>('#chapter-manager').hidden = true;
  renderNovels();
  field<HTMLInputElement>(novelForm, 'title').focus();
};

const showChapter = (chapter: Chapter) => {
  selectedChapterId = chapter.id;
  field<HTMLInputElement>(chapterForm, 'id').value = String(chapter.id);
  field<HTMLInputElement>(chapterForm, 'title').value = chapter.title;
  field<HTMLTextAreaElement>(chapterForm, 'content').value = chapter.content;
  chapterForm.hidden = false;
  element<HTMLElement>('#chapter-empty').classList.add('hidden');
  element<HTMLElement>('#chapter-delete').hidden = false;
  renderChapters();
};

const newChapter = () => {
  chapterForm.reset();
  selectedChapterId = null;
  chapterForm.hidden = false;
  element<HTMLElement>('#chapter-empty').classList.add('hidden');
  element<HTMLElement>('#chapter-delete').hidden = true;
  renderChapters();
  field<HTMLInputElement>(chapterForm, 'title').focus();
};

novelForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!novelForm.reportValidity()) return;
  const button = element<HTMLButtonElement>('#novel-save');
  const id = field<HTMLInputElement>(novelForm, 'id').value;
  button.disabled = true;
  try {
    const saved = await siteApi<Novel>(`/admin/fiction/novels${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({
        ...(id ? { slug: field<HTMLInputElement>(novelForm, 'slug').value } : {}),
        title: field<HTMLInputElement>(novelForm, 'title').value.trim(),
        description: field<HTMLTextAreaElement>(novelForm, 'description').value.trim(),
      }),
    });
    showNotice('Novel saved. You can now add chapters.');
    await loadNovels(saved.id);
  } catch (reason) {
    showNotice(message(reason), true);
  } finally {
    button.disabled = false;
  }
});

chapterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedNovelId || !chapterForm.reportValidity()) return;
  const button = element<HTMLButtonElement>('#chapter-save');
  const id = field<HTMLInputElement>(chapterForm, 'id').value;
  button.disabled = true;
  try {
    const saved = await siteApi<Chapter>(`/admin/fiction/novels/${selectedNovelId}/chapters${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({
        title: field<HTMLInputElement>(chapterForm, 'title').value.trim(),
        content: field<HTMLTextAreaElement>(chapterForm, 'content').value,
      }),
    });
    chapters = await siteApi<Chapter[]>(`/admin/fiction/novels/${selectedNovelId}/chapters`);
    showChapter(saved);
    showNotice('Chapter saved.');
  } catch (reason) {
    showNotice(message(reason), true);
  } finally {
    button.disabled = false;
  }
});

novelList.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-novel-id]');
  if (!button?.dataset.novelId) return;
  selectNovel(Number(button.dataset.novelId)).catch((reason) => showNotice(message(reason), true));
});

chapterList.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-chapter-id]');
  const chapter = chapters.find((item) => item.id === Number(button?.dataset.chapterId));
  if (chapter) showChapter(chapter);
});

element<HTMLButtonElement>('#novel-new').addEventListener('click', newNovel);
element<HTMLInputElement>('#novel-search').addEventListener('input', renderNovels);
element<HTMLButtonElement>('#chapter-new').addEventListener('click', newChapter);

element<HTMLButtonElement>('#novel-delete').addEventListener('click', async () => {
  if (!selectedNovelId || !window.confirm('Delete this novel and every chapter?')) return;
  try {
    await siteApi(`/admin/fiction/novels/${selectedNovelId}`, { method: 'DELETE' });
    selectedNovelId = null;
    element<HTMLElement>('#novel-workspace').classList.add('hidden');
    element<HTMLElement>('#novel-empty').classList.remove('hidden');
    showNotice('Novel deleted.');
    await loadNovels();
  } catch (reason) {
    showNotice(message(reason), true);
  }
});

element<HTMLButtonElement>('#chapter-delete').addEventListener('click', async () => {
  if (!selectedNovelId || !selectedChapterId || !window.confirm('Delete this chapter?')) return;
  try {
    await siteApi(`/admin/fiction/novels/${selectedNovelId}/chapters/${selectedChapterId}`, {
      method: 'DELETE',
    });
    showNotice('Chapter deleted.');
    await loadChapters();
  } catch (reason) {
    showNotice(message(reason), true);
  }
});

novelMoveButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!selectedNovelId) return;
    try {
      novels = await siteApi<Novel[]>(`/admin/fiction/novels/${selectedNovelId}/position`, {
        method: 'PUT',
        body: JSON.stringify({ direction: button.dataset.novelMove }),
      });
      renderNovels();
      showNotice(`Novel moved ${button.dataset.novelMove}.`);
    } catch (reason) {
      showNotice(message(reason), true);
    }
  });
});

chapterMoveButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!selectedNovelId || !selectedChapterId) return;
    try {
      chapters = await siteApi<Chapter[]>(
        `/admin/fiction/novels/${selectedNovelId}/chapters/${selectedChapterId}/position`,
        {
          method: 'PUT',
          body: JSON.stringify({ direction: button.dataset.chapterMove }),
        },
      );
      renderChapters();
      showNotice(`Chapter moved ${button.dataset.chapterMove}.`);
    } catch (reason) {
      showNotice(message(reason), true);
    }
  });
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return loadNovels();
}).catch((reason: SiteApiError) => {
  if (reason.status === 403) location.replace('/login/');
  else showNotice(reason.message, true);
});
