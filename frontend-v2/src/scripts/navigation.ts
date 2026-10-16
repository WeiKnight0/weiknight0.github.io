interface AccountNavigation {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
}

const setupDropdowns = () => {
  document.querySelectorAll('[data-dropdown-scope]').forEach((scope) => {
    const dropdowns = Array.from(scope.querySelectorAll<HTMLDetailsElement>('details[data-dropdown]'));
    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector<HTMLElement>('summary');
      if (!trigger || dropdown.dataset.dropdownReady === 'true') return;
      dropdown.dataset.dropdownReady = 'true';
      const syncExpanded = () => trigger.setAttribute('aria-expanded', String(dropdown.open));
      dropdown.addEventListener('toggle', () => {
        syncExpanded();
        if (dropdown.open) dropdowns.filter((other) => other !== dropdown)
          .forEach((other) => { other.open = false; });
      });
      syncExpanded();
    });
  });

  if (document.documentElement.dataset.dropdownEventsReady === 'true') return;
  document.documentElement.dataset.dropdownEventsReady = 'true';
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    document.querySelectorAll<HTMLDetailsElement>('details[data-dropdown][open]')
      .forEach((dropdown) => { if (!dropdown.contains(target)) dropdown.open = false; });
  });
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('summary')) return;
    target.closest('details[data-dropdown]')?.removeAttribute('open');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dropdown = document.querySelector<HTMLDetailsElement>('details[data-dropdown][open]');
    if (!dropdown) return;
    dropdown.open = false;
    dropdown.querySelector<HTMLElement>('summary')?.focus();
  });
};

const setupAccountNavigation = async () => {
  try {
    const response = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
    if (!response.ok) return;
    const account = await response.json() as AccountNavigation;
    const accountName = account.displayName || account.username;
    document.querySelectorAll<HTMLElement>('[data-account-login]')
      .forEach((element) => { element.hidden = true; });
    document.querySelectorAll<HTMLElement>('[data-account-profile]').forEach((element) => {
      const image = element.querySelector('[data-account-avatar-image]') as HTMLImageElement;
      const fallback = element.querySelector('[data-account-avatar-fallback]') as HTMLElement;
      element.hidden = false;
      const trigger = element.querySelector<HTMLElement>('[data-account-trigger]') ?? element;
      trigger.title = `${accountName} — Open account menu`;
      trigger.setAttribute('aria-label', `${accountName} — Open account menu`);
      fallback.textContent = accountName.trim().charAt(0).toUpperCase();
      image.hidden = !account.avatarUrl;
      fallback.hidden = Boolean(account.avatarUrl);
      if (account.avatarUrl) image.src = account.avatarUrl;
    });
    document.querySelectorAll<HTMLElement>('[data-account-admin]')
      .forEach((element) => { element.hidden = account.role !== 'admin'; });
    document.querySelectorAll<HTMLElement>('[data-account-logout]')
      .forEach((element) => { element.hidden = false; });
  } catch {
    // Network failure leaves the navigation in its signed-out state.
  }
};

const setupLogout = () => {
  document.querySelectorAll<HTMLButtonElement>('[data-account-logout]').forEach((button) => {
    if (button.dataset.logoutReady === 'true') return;
    button.dataset.logoutReady = 'true';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await siteApi('/auth/logout', { method: 'POST' });
        location.replace('/');
      } catch {
        button.textContent = 'Sign out failed';
        button.disabled = false;
      }
    });
  });
};

const setupThemeControls = () => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll<HTMLElement>('[data-theme-toggle]');
  const syncButtons = () => {
    const dark = root.dataset.colorTheme === 'dark';
    buttons.forEach((button) => {
      const action = dark ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-label', action);
      button.title = action;
      const icon = button.querySelector('[data-theme-icon]');
      const label = button.querySelector('[data-theme-label]');
      if (icon) icon.textContent = dark ? '☀' : '☾';
      if (label) label.textContent = dark ? 'Light theme' : 'Dark theme';
    });
  };
  buttons.forEach((button) => {
    if (button.dataset.themeReady === 'true') return;
    button.dataset.themeReady = 'true';
    button.addEventListener('click', () => {
      const theme = root.dataset.colorTheme === 'dark' ? 'light' : 'dark';
      root.dataset.colorTheme = theme;
      root.style.colorScheme = theme;
      localStorage.setItem('wkn-color-theme', theme);
      syncButtons();
    });
  });
  syncButtons();
};

const setupNavigation = () => {
  setupDropdowns();
  void setupAccountNavigation();
  setupLogout();
  setupThemeControls();
};

setupNavigation();
document.addEventListener('astro:page-load', setupNavigation);
window.addEventListener('account-profile-change', setupAccountNavigation);
import { siteApi } from '@/utils/site-api';
