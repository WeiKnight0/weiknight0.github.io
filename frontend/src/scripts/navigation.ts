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
      if (dropdown.dataset.dropdownReady === 'true') return;
      dropdown.dataset.dropdownReady = 'true';
      if (dropdown.hasAttribute('data-hover-dropdown') && matchMedia('(hover: hover)').matches) {
        dropdown.addEventListener('pointerenter', () => { dropdown.open = true; });
        dropdown.addEventListener('pointerleave', () => { dropdown.open = false; });
      }
      dropdown.addEventListener('toggle', () => {
        if (!dropdown.open) return;
        dropdowns.filter((other) => other !== dropdown)
          .forEach((other) => { other.open = false; });
      });
    });
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
      element.title = `${accountName} — Personal center`;
      element.setAttribute('aria-label', `${accountName} — Personal center`);
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
        const response = await fetch('/api/v1/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`Sign out failed (${response.status}).`);
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
