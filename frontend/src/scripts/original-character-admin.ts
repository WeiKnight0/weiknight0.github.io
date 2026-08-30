import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface CharacterProfile {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  displayOrder: number;
}

const root = document.querySelector<HTMLElement>('[data-character-admin]');
if (!root) throw new Error('Original-character administration root is missing.');

const element = <T extends Element>(selector: string) => {
  const matched = root.querySelector<T>(selector);
  if (!matched) throw new Error(`Required character editor element is missing: ${selector}`);
  return matched;
};
const field = <T extends HTMLInputElement | HTMLTextAreaElement>(
  form: HTMLFormElement,
  name: string,
) => form.elements.namedItem(name) as T;
const message = (reason: unknown) => reason instanceof SiteApiError
  ? reason.message
  : 'The request failed.';

const form = element<HTMLFormElement>('#character-form');
const list = element<HTMLElement>('#character-list');
const moveButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-character-move]'));
let characters: CharacterProfile[] = [];
let selectedId: number | null = null;

const showNotice = (text: string, error = false) => {
  const notice = element<HTMLElement>('#character-notice');
  notice.className = `mb-5 border px-4 py-3 text-sm ${error
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  notice.textContent = text;
};

const syncMoveButtons = () => {
  const index = characters.findIndex((character) => character.id === selectedId);
  moveButtons.forEach((button) => {
    button.hidden = index < 0;
    button.disabled = button.dataset.characterMove === 'up'
      ? index <= 0
      : index < 0 || index === characters.length - 1;
  });
};

const render = () => {
  const query = element<HTMLInputElement>('#character-search').value.trim().toLowerCase();
  const visible = characters.filter((character) => `${character.title} ${character.slug}`.toLowerCase().includes(query));
  element<HTMLElement>('#character-count').textContent = `${characters.length} ${characters.length === 1 ? 'OC' : 'OCs'}`;
  list.innerHTML = visible.length
    ? visible.map((character) => `<button type="button" data-character-id="${character.id}" class="mb-1 flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${character.id === selectedId ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:bg-white/5'}"><span class="text-xs text-white/30">${character.displayOrder}</span><span class="min-w-0 flex-1"><span class="block truncate font-bold text-white">${escapeHtml(character.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(character.slug)}</span></span></button>`).join('')
    : '<p class="p-6 text-center text-sm text-white/40">No matching OCs.</p>';
  syncMoveButtons();
};

const show = (character: CharacterProfile) => {
  selectedId = character.id;
  field<HTMLInputElement>(form, 'id').value = String(character.id);
  field<HTMLInputElement>(form, 'title').value = character.title;
  field<HTMLInputElement>(form, 'slug').value = character.slug;
  field<HTMLInputElement>(form, 'slug').disabled = false;
  field<HTMLTextAreaElement>(form, 'description').value = character.description;
  field<HTMLTextAreaElement>(form, 'content').value = character.content;
  element<HTMLElement>('#character-slug-field').hidden = false;
  element<HTMLElement>('#character-mode').textContent = 'Editing OC';
  form.classList.remove('hidden');
  element<HTMLElement>('#character-empty').classList.add('hidden');
  element<HTMLElement>('#character-delete').hidden = false;
  const preview = element<HTMLAnchorElement>('#character-preview');
  preview.hidden = false;
  preview.href = `/fiction/oc/${encodeURIComponent(character.slug)}/`;
  render();
};

const load = async (preferredId?: number) => {
  characters = await siteApi<CharacterProfile[]>('/admin/fiction/oc');
  render();
  if (preferredId) show(await siteApi<CharacterProfile>(`/admin/fiction/oc/${preferredId}`));
};

const create = () => {
  form.reset();
  selectedId = null;
  element<HTMLElement>('#character-mode').textContent = 'New OC';
  form.classList.remove('hidden');
  element<HTMLElement>('#character-empty').classList.add('hidden');
  element<HTMLElement>('#character-delete').hidden = true;
  element<HTMLElement>('#character-preview').hidden = true;
  element<HTMLElement>('#character-slug-field').hidden = true;
  field<HTMLInputElement>(form, 'slug').disabled = true;
  render();
  field<HTMLInputElement>(form, 'title').focus();
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = element<HTMLButtonElement>('#character-save');
  const id = field<HTMLInputElement>(form, 'id').value;
  button.disabled = true;
  try {
    const saved = await siteApi<CharacterProfile>(`/admin/fiction/oc${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({
        ...(id ? { slug: field<HTMLInputElement>(form, 'slug').value } : {}),
        title: field<HTMLInputElement>(form, 'title').value.trim(),
        description: field<HTMLTextAreaElement>(form, 'description').value.trim(),
        content: field<HTMLTextAreaElement>(form, 'content').value,
      }),
    });
    showNotice('OC saved.');
    await load(saved.id);
  } catch (reason) {
    showNotice(message(reason), true);
  } finally {
    button.disabled = false;
  }
});

list.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-character-id]');
  if (!button?.dataset.characterId) return;
  siteApi<CharacterProfile>(`/admin/fiction/oc/${button.dataset.characterId}`)
    .then(show)
    .catch((reason) => showNotice(message(reason), true));
});

element<HTMLButtonElement>('#character-new').addEventListener('click', create);
element<HTMLInputElement>('#character-search').addEventListener('input', render);

element<HTMLButtonElement>('#character-delete').addEventListener('click', async () => {
  if (!selectedId || !window.confirm('Delete this OC?')) return;
  try {
    await siteApi(`/admin/fiction/oc/${selectedId}`, { method: 'DELETE' });
    selectedId = null;
    form.classList.add('hidden');
    element<HTMLElement>('#character-empty').classList.remove('hidden');
    showNotice('OC deleted.');
    await load();
  } catch (reason) {
    showNotice(message(reason), true);
  }
});

moveButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (!selectedId) return;
    try {
      await siteApi(`/admin/fiction/oc/${selectedId}/position`, {
        method: 'PUT',
        body: JSON.stringify({ direction: button.dataset.characterMove }),
      });
      showNotice(`OC moved ${button.dataset.characterMove}.`);
      await load(selectedId);
    } catch (reason) {
      showNotice(message(reason), true);
    }
  });
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return load();
}).catch((reason: SiteApiError) => {
  if (reason.status === 403) location.replace('/login/');
  else showNotice(reason.message, true);
});
