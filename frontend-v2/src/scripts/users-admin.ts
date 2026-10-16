import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface UserAccount {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  enabled: boolean;
  createdAt: string;
}

const element = <T extends Element>(selector: string) => {
  const matched = document.querySelector<T>(selector);
  if (!matched) throw new Error(`Required user editor element is missing: ${selector}`);
  return matched;
};
const control = <T extends HTMLInputElement>(form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as T;
const list = element<HTMLElement>('#users-list');
const notice = element<HTMLElement>('#notice');
const editor = element<HTMLElement>('#user-editor');
const empty = element<HTMLElement>('#editor-empty');
const accountForm = element<HTMLFormElement>('#account-form');
const passwordForm = element<HTMLFormElement>('#password-form');
const avatarFile = element<HTMLInputElement>('#avatar-file');
const createDialog = element<HTMLDialogElement>('#create-user-dialog');
const createForm = element<HTMLFormElement>('#create-user-form');
let users: UserAccount[] = [];
let selectedId: number | null = null;

const initial = (user: UserAccount) => (user.displayName || user.username || '?').trim().charAt(0).toUpperCase();
const avatar = (user: UserAccount, classes: string) => user.avatarUrl
  ? `<img src="${escapeHtml(user.avatarUrl)}" alt="" class="${classes} object-cover" />`
  : `<span class="${classes} grid place-items-center bg-real-accent/10 font-black text-real-accent">${escapeHtml(initial(user))}</span>`;

const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
  notice.textContent = message;
  notice.className = `mb-5 border px-4 py-3 text-sm ${type === 'error'
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
};

const showError = (error: SiteApiError) => {
  if (error.status === 403) {
    location.replace('/login/');
    return;
  }
  showNotice(error.message, 'error');
};

const selectedUser = () => {
  const user = users.find((item) => item.id === selectedId);
  if (!user) throw new Error('The selected account no longer exists.');
  return user;
};

const renderList = () => {
  const query = element<HTMLInputElement>('#user-search').value.trim().toLowerCase();
  const visible = users.filter((user) => `${user.username} ${user.displayName}`.toLowerCase().includes(query));
  element<HTMLElement>('#user-count').textContent = `${users.length} user${users.length === 1 ? '' : 's'}`;
  if (!visible.length) {
    list.innerHTML = '<p class="p-8 text-center text-sm text-white/40">No matching member accounts.</p>';
    return;
  }
  list.innerHTML = visible.map((user) => `<button type="button" data-user-id="${user.id}" class="flex w-full items-center gap-3 p-4 text-left transition ${user.id === selectedId ? 'bg-real-accent/10' : 'hover:bg-white/5'}">
    ${avatar(user, 'h-11 w-11 shrink-0 rounded-full border border-real-accent/30')}
    <span class="min-w-0 flex-1"><span class="block truncate font-bold text-white">${escapeHtml(user.displayName)}</span><span class="mt-0.5 block truncate text-xs text-white/40">@${escapeHtml(user.username)}</span></span>
    <span class="h-2.5 w-2.5 shrink-0 rounded-full ${user.enabled ? 'bg-emerald-400' : 'bg-white/20'}" title="${user.enabled ? 'Enabled' : 'Disabled'}"></span>
  </button>`).join('');
};

const renderAvatar = (user: UserAccount) => {
  element<HTMLElement>('#editor-avatar').innerHTML = avatar(user, 'h-full w-full');
  element<HTMLElement>('#remove-avatar').hidden = !user.avatarUrl;
};

const openCreate = () => {
  createForm.reset();
  control<HTMLInputElement>(createForm, 'passwordConfirmation').setCustomValidity('');
  element<HTMLElement>('#create-user-error').hidden = true;
  createDialog.showModal();
  control<HTMLInputElement>(createForm, 'username').focus();
};

const openUser = (id: number) => {
  selectedId = id;
  const user = selectedUser();
  empty.hidden = true;
  editor.hidden = false;
  element<HTMLElement>('#editor-mode').textContent = user.enabled ? 'Active member' : 'Access disabled';
  element<HTMLElement>('#editor-title').textContent = user.displayName;
  element<HTMLElement>('#editor-meta').textContent = `@${user.username} · Created ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(user.createdAt))}`;
  element<HTMLElement>('#avatar-actions').hidden = false;
  element<HTMLElement>('#enabled-field').hidden = false;
  element<HTMLElement>('#existing-user-actions').hidden = false;
  control<HTMLInputElement>(accountForm, 'username').value = user.username;
  control<HTMLInputElement>(accountForm, 'displayName').value = user.displayName;
  control<HTMLInputElement>(accountForm, 'enabled').checked = user.enabled;
  passwordForm.reset();
  renderAvatar(user);
  renderList();
};

const loadUsers = async (preferredId = selectedId) => {
  users = await siteApi<UserAccount[]>('/admin/users');
  renderList();
  if (preferredId && users.some((user) => user.id === preferredId)) openUser(preferredId);
};

const matchingPasswords = (form: HTMLFormElement) => {
  const confirmation = control<HTMLInputElement>(form, 'passwordConfirmation');
  if (control<HTMLInputElement>(form, 'password').value === confirmation.value) {
    confirmation.setCustomValidity('');
    return true;
  }
  confirmation.setCustomValidity('Passwords do not match.');
  confirmation.reportValidity();
  return false;
};

accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!accountForm.reportValidity()) return;
  const button = element<HTMLButtonElement>('#save-user');
  button.disabled = true;
  try {
    const saved = await siteApi<UserAccount>(`/admin/users/${selectedId}`, {
      method: 'PUT',
      body: JSON.stringify({
        username: control<HTMLInputElement>(accountForm, 'username').value,
        displayName: control<HTMLInputElement>(accountForm, 'displayName').value,
        enabled: control<HTMLInputElement>(accountForm, 'enabled').checked,
      }),
    });
    showNotice('Account updated.');
    await loadUsers(saved.id);
  } catch (reason) {
    showError(reason as SiteApiError);
  } finally {
    button.disabled = false;
  }
});

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!createForm.reportValidity() || !matchingPasswords(createForm)) return;
  const button = element<HTMLButtonElement>('#create-user-submit');
  button.disabled = true;
  try {
    const saved = await siteApi<UserAccount>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(createForm))),
    });
    createDialog.close();
    showNotice('User created.');
    await loadUsers(saved.id);
  } catch (reason) {
    const error = reason as SiteApiError;
    if (error.status === 403) {
      location.replace('/login/');
      return;
    }
    const target = element<HTMLElement>('#create-user-error');
    target.textContent = error.message;
    target.hidden = false;
  } finally {
    button.disabled = false;
  }
});

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!passwordForm.reportValidity() || !matchingPasswords(passwordForm)) return;
  const button = passwordForm.querySelector('button[type="submit"]') as HTMLButtonElement;
  button.disabled = true;
  try {
    await siteApi(`/admin/users/${selectedId}/password`, {
      method: 'PUT',
      body: JSON.stringify(Object.fromEntries(new FormData(passwordForm))),
    });
    passwordForm.reset();
    showNotice('Password reset.');
  } catch (reason) {
    showError(reason as SiteApiError);
  } finally {
    button.disabled = false;
  }
});

list.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-user-id]');
  if (button?.dataset.userId) openUser(Number(button.dataset.userId));
});

element<HTMLButtonElement>('#new-user').addEventListener('click', openCreate);
element<HTMLButtonElement>('#close-create-user').addEventListener('click', () => createDialog.close());
element<HTMLButtonElement>('#cancel-create-user').addEventListener('click', () => createDialog.close());
element<HTMLInputElement>('#user-search').addEventListener('input', renderList);
element<HTMLButtonElement>('#upload-avatar').addEventListener('click', () => avatarFile.click());
avatarFile.addEventListener('change', async () => {
  const file = avatarFile.files?.[0];
  if (!file) return;
  const body = new FormData();
  body.append('file', file);
  try {
    await siteApi(`/admin/users/${selectedId}/avatar`, { method: 'POST', body });
    showNotice('Avatar updated.');
    await loadUsers(selectedId);
  } catch (reason) {
    showError(reason as SiteApiError);
  } finally {
    avatarFile.value = '';
  }
});

element<HTMLButtonElement>('#remove-avatar').addEventListener('click', async () => {
  try {
    await siteApi(`/admin/users/${selectedId}/avatar`, { method: 'DELETE' });
    showNotice('Avatar removed.');
    await loadUsers(selectedId);
  } catch (reason) {
    showError(reason as SiteApiError);
  }
});

element<HTMLButtonElement>('#delete-user').addEventListener('click', async () => {
  const user = selectedUser();
  if (!window.confirm(`Delete “${user.displayName}” (@${user.username})? This immediately revokes the account.`)) return;
  try {
    await siteApi(`/admin/users/${selectedId}`, { method: 'DELETE' });
    selectedId = null;
    editor.hidden = true;
    empty.hidden = false;
    showNotice('User deleted.');
    await loadUsers();
  } catch (reason) {
    showError(reason as SiteApiError);
  }
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return loadUsers();
}).catch((reason: SiteApiError) => showError(reason));
