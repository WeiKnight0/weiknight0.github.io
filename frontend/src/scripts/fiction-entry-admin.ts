import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface EntrySummary {
  id: number;
  slug: string;
  title: string;
  displayOrder: number;
  published: boolean;
}

interface FictionEntry extends EntrySummary {
  description: string;
  content: string;
}

const root = document.querySelector<HTMLElement>('[data-fiction-entry-admin]');
if (!root) throw new Error('Fiction administration root is missing.');
const kind = root.dataset.kind;
const singular = root.dataset.singular;
if (!kind || !singular) throw new Error('Fiction administration configuration is incomplete.');
const publicBase = `/fiction/${kind}`;
const plural = kind === 'oc' ? 'OCs' : 'novels';
const element = <T extends Element>(selector: string) => {
  const matched = root.querySelector<T>(selector);
  if (!matched) throw new Error(`Required fiction editor element is missing: ${selector}`);
  return matched;
};
const control = <T extends HTMLInputElement | HTMLTextAreaElement>(form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as T;
const form = element<HTMLFormElement>('#fiction-form');
const list = element<HTMLElement>('#fiction-list');
const empty = element<HTMLElement>('#fiction-empty');
let entries: EntrySummary[] = [];
let selectedId: number | null = null;
let dirty = false;
let creating = false;
let slugEdited = false;
const moveButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-fiction-move]'));

const slugify = (value: string) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 160);
const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved changes?');
const showNotice = (message: string, error = false) => {
  const notice = element<HTMLElement>('#fiction-notice');
  notice.className = `mb-5 border px-4 py-3 text-sm ${error
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  notice.textContent = message;
};
const updateSaveState = () => {
  element<HTMLElement>('#fiction-save-state').textContent = dirty ? 'Unsaved changes' : 'No unsaved changes';
};
const syncMoveButtons = () => {
  const index = entries.findIndex((entry) => entry.id === selectedId);
  moveButtons.forEach((button) => {
    button.hidden = creating || index < 0;
    button.disabled = button.dataset.fictionMove === 'up'
      ? index <= 0
      : index < 0 || index === entries.length - 1;
  });
};
const renderList = () => {
  const query = element<HTMLInputElement>('#fiction-search').value.trim().toLowerCase();
  const visible = entries.filter((entry) => `${entry.title} ${entry.slug}`.toLowerCase().includes(query));
  element<HTMLElement>('#fiction-count').textContent = `${entries.length} ${entries.length === 1 ? singular : plural}`;
  if (!visible.length) {
    list.innerHTML = `<p class="p-6 text-center text-sm text-white/40">No matching ${escapeHtml(kind)}.</p>`;
    return;
  }
  list.innerHTML = visible.map((entry) => `<button type="button" data-entry-id="${entry.id}" class="mb-1 flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${entry.id === selectedId ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:bg-white/5'}"><span class="text-xs text-white/30">${entry.displayOrder}</span><span class="min-w-0 flex-1"><span class="block truncate font-bold text-white">${escapeHtml(entry.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(entry.slug)}</span></span><span class="mt-1 h-2 w-2 shrink-0 rounded-full ${entry.published ? 'bg-emerald-400' : 'bg-white/20'}"></span></button>`).join('');
};
const showForm = () => {
  empty.classList.add('hidden');
  form.classList.remove('hidden');
};
const fillForm = (entry: FictionEntry) => {
  showForm();
  control<HTMLInputElement>(form, 'id').value = String(entry.id);
  control<HTMLInputElement>(form, 'title').value = entry.title;
  control<HTMLInputElement>(form, 'slug').value = entry.slug;
  control<HTMLTextAreaElement>(form, 'description').value = entry.description;
  control<HTMLInputElement>(form, 'displayOrder').value = String(entry.displayOrder);
  control<HTMLInputElement>(form, 'published').checked = entry.published;
  control<HTMLTextAreaElement>(form, 'content').value = entry.content;
  selectedId = entry.id;
  dirty = false;
  creating = false;
  slugEdited = true;
  element<HTMLElement>('#fiction-mode').textContent = `Editing ${singular}`;
  element<HTMLElement>('#fiction-delete').hidden = false;
  const preview = element<HTMLAnchorElement>('#fiction-preview');
  preview.hidden = false;
  preview.href = `${publicBase}/${encodeURIComponent(entry.slug)}/`;
  updateSaveState();
  renderList();
  syncMoveButtons();
};
const selectEntry = async (id: number) => {
  if (id === selectedId || !confirmDiscard()) return;
  selectedId = id;
  renderList();
  try {
    fillForm(await siteApi<FictionEntry>(`/admin/fiction/${kind}/${id}`));
  } catch (reason) {
    showNotice((reason as SiteApiError).message, true);
  }
};
const loadEntries = async (preferredId: number | null = selectedId) => {
  entries = await siteApi<EntrySummary[]>(`/admin/fiction/${kind}`);
  renderList();
  if (preferredId && entries.some((entry) => entry.id === preferredId)) {
    selectedId = null;
    await selectEntry(preferredId);
  }
};
const newEntry = () => {
  if (!confirmDiscard()) return;
  form.reset();
  showForm();
  selectedId = null;
  dirty = false;
  creating = true;
  slugEdited = false;
  control<HTMLInputElement>(form, 'displayOrder').value = '1000';
  element<HTMLElement>('#fiction-mode').textContent = `New ${singular}`;
  element<HTMLElement>('#fiction-delete').hidden = true;
  element<HTMLElement>('#fiction-preview').hidden = true;
  updateSaveState();
  renderList();
  syncMoveButtons();
  control<HTMLInputElement>(form, 'title').focus();
};

form.addEventListener('input', (event) => {
  const title = control<HTMLInputElement>(form, 'title');
  const slug = control<HTMLInputElement>(form, 'slug');
  if (event.target === slug) slugEdited = true;
  if (event.target === title && creating && !slugEdited) slug.value = slugify(title.value);
  dirty = true;
  updateSaveState();
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = element<HTMLButtonElement>('#fiction-save');
  const id = control<HTMLInputElement>(form, 'id').value;
  button.disabled = true;
  try {
    const saved = await siteApi<FictionEntry>(`/admin/fiction/${kind}${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({
        title: control<HTMLInputElement>(form, 'title').value.trim(),
        slug: control<HTMLInputElement>(form, 'slug').value.trim(),
        description: control<HTMLTextAreaElement>(form, 'description').value.trim(),
        displayOrder: Number(control<HTMLInputElement>(form, 'displayOrder').value),
        published: control<HTMLInputElement>(form, 'published').checked,
        content: control<HTMLTextAreaElement>(form, 'content').value,
      }),
    });
    dirty = false;
    showNotice(`${singular} saved.`);
    await loadEntries(saved.id);
  } catch (reason) {
    showNotice((reason as SiteApiError).message, true);
  } finally {
    button.disabled = false;
  }
});
list.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-entry-id]');
  if (button?.dataset.entryId) void selectEntry(Number(button.dataset.entryId));
});
element<HTMLInputElement>('#fiction-search').addEventListener('input', renderList);
element<HTMLButtonElement>('#fiction-new').addEventListener('click', newEntry);
element<HTMLButtonElement>('#fiction-delete').addEventListener('click', async () => {
  if (!selectedId || !window.confirm(`Delete this ${singular.toLowerCase()}?`)) return;
  try {
    await siteApi(`/admin/fiction/${kind}/${selectedId}`, { method: 'DELETE' });
    selectedId = null;
    dirty = false;
    form.classList.add('hidden');
    empty.classList.remove('hidden');
    syncMoveButtons();
    showNotice(`${singular} deleted.`);
    await loadEntries();
  } catch (reason) {
    showNotice((reason as SiteApiError).message, true);
  }
});
moveButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!selectedId || dirty) {
      if (dirty) showNotice('Save or discard changes before moving this OC.', true);
      return;
    }
    try {
      await siteApi(`/admin/fiction/${kind}/${selectedId}/position`, {
        method: 'PUT',
        body: JSON.stringify({ direction: button.dataset.fictionMove }),
      });
      showNotice(`OC moved ${button.dataset.fictionMove}.`);
      await loadEntries(selectedId);
    } catch (reason) {
      showNotice((reason as SiteApiError).message, true);
    }
  });
});
window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return loadEntries();
}).catch((reason: SiteApiError) => {
  if (reason.status === 403) location.replace('/login/');
  else showNotice(reason.message, true);
});
