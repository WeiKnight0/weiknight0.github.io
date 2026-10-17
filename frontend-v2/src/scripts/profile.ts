import { siteApi, type SiteApiError } from '@/utils/site-api';

interface Account {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

const element = <T extends Element>(selector: string) => {
  const matched = document.querySelector<T>(selector);
  if (!matched) throw new Error(`Required profile element is missing: ${selector}`);
  return matched;
};
const control = <T extends HTMLInputElement | HTMLTextAreaElement>(form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as T;
const content = element<HTMLElement>('#profile-content');
const loading = element<HTMLElement>('#profile-loading');
const profileForm = element<HTMLFormElement>('#profile-form');
const passwordForm = element<HTMLFormElement>('#profile-password-form');
const avatarFile = element<HTMLInputElement>('#profile-avatar-file');
const bio = control<HTMLTextAreaElement>(profileForm, 'bio');
let account: Account;

const chinese = document.documentElement.lang.toLowerCase().startsWith('zh');
const roleName = () => chinese
  ? account.role === 'admin' ? '管理员' : '成员'
  : account.role === 'admin' ? 'Administrator' : 'Member';
const formatDate = (value: string) => new Intl.DateTimeFormat(chinese ? 'zh-CN' : 'en', {
  year: 'numeric', month: 'short', day: 'numeric',
}).format(new Date(value));

const showMessage = (text: string, error = false) => {
  const target = element<HTMLElement>('#profile-message');
  target.hidden = false;
  target.textContent = text;
  target.className = `mb-6 border px-4 py-3 text-sm ${error
    ? 'border-red-300/30 bg-red-300/10 text-red-200'
    : 'border-real-accent/30 bg-real-accent/10 text-real-accent'}`;
};

const renderAccount = () => {
  const accountName = account.displayName || account.username;
  const avatar = element<HTMLImageElement>('#profile-avatar-image');
  const fallback = element<HTMLElement>('#profile-avatar-fallback');
  avatar.hidden = !account.avatarUrl;
  fallback.hidden = Boolean(account.avatarUrl);
  fallback.textContent = accountName.trim().charAt(0).toUpperCase();
  if (account.avatarUrl) {
    avatar.src = account.avatarUrl;
    avatar.alt = `${accountName} avatar`;
  }
  element<HTMLElement>('#profile-name').textContent = accountName;
  element<HTMLElement>('#profile-username').textContent = `@${account.username}`;
  element<HTMLElement>('#profile-bio').textContent = account.bio || (chinese
    ? '为账户添加一段简介，让个人资料更完整。'
    : 'Add a short introduction so this account feels like your own.');
  element<HTMLElement>('#profile-role').textContent = roleName();
  element<HTMLElement>('#profile-detail-role').textContent = roleName();
  element<HTMLElement>('#profile-created').textContent = formatDate(account.createdAt);
  element<HTMLElement>('#profile-updated').textContent = formatDate(account.updatedAt);
  element<HTMLElement>('#profile-admin-link').hidden = account.role !== 'admin';
  element<HTMLElement>('#profile-avatar-remove').hidden = !account.avatarUrl;
  control<HTMLInputElement>(profileForm, 'displayName').value = account.displayName;
  bio.value = account.bio || '';
  element<HTMLElement>('#profile-bio-count').textContent = String(bio.value.length);
};

const refreshAccount = async () => {
  account = await siteApi<Account>('/auth/me');
  renderAccount();
  window.dispatchEvent(new CustomEvent('account-profile-change'));
};

bio.addEventListener('input', () => {
  element<HTMLElement>('#profile-bio-count').textContent = String(bio.value.length);
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!profileForm.reportValidity()) return;
  try {
    account = await siteApi<Account>('/account/profile', {
      method: 'PUT',
      body: JSON.stringify({
        displayName: control<HTMLInputElement>(profileForm, 'displayName').value,
        bio: bio.value,
      }),
    });
    renderAccount();
    showMessage(chinese ? '个人资料已更新。' : 'Profile updated.');
    window.dispatchEvent(new CustomEvent('account-profile-change'));
  } catch (reason) {
    showMessage((reason as SiteApiError).message, true);
  }
});

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const confirmation = control<HTMLInputElement>(passwordForm, 'passwordConfirmation');
  confirmation.setCustomValidity(
    control<HTMLInputElement>(passwordForm, 'password').value === confirmation.value
      ? ''
      : chinese ? '两次输入的密码不一致。' : 'Passwords do not match.',
  );
  if (!passwordForm.reportValidity()) return;
  try {
    await siteApi<void>('/account/password', {
      method: 'PUT',
      body: JSON.stringify(Object.fromEntries(new FormData(passwordForm))),
    });
    passwordForm.reset();
    showMessage(chinese ? '密码已修改。' : 'Password changed.');
  } catch (reason) {
    showMessage((reason as SiteApiError).message, true);
  }
});

element<HTMLButtonElement>('#profile-avatar-upload').addEventListener('click', () => avatarFile.click());
avatarFile.addEventListener('change', async () => {
  if (!avatarFile.files?.[0]) return;
  const body = new FormData();
  body.append('file', avatarFile.files[0]);
  try {
    await siteApi('/account/avatar', { method: 'POST', body });
    await refreshAccount();
    showMessage(chinese ? '头像已更新。' : 'Avatar updated.');
  } catch (reason) {
    showMessage((reason as SiteApiError).message, true);
  } finally {
    avatarFile.value = '';
  }
});

element<HTMLButtonElement>('#profile-avatar-remove').addEventListener('click', async () => {
  try {
    await siteApi('/account/avatar', { method: 'DELETE' });
    await refreshAccount();
    showMessage(chinese ? '头像已移除。' : 'Avatar removed.');
  } catch (reason) {
    showMessage((reason as SiteApiError).message, true);
  }
});

element<HTMLButtonElement>('#profile-logout').addEventListener('click', async () => {
  try {
    await siteApi('/auth/logout', { method: 'POST' });
    location.replace('/');
  } catch (reason) {
    showMessage((reason as SiteApiError).message, true);
  }
});

siteApi<Account>('/auth/me').then((loaded) => {
  account = loaded;
  renderAccount();
  loading.hidden = true;
  content.hidden = false;
}).catch(() => location.replace('/login/'));
