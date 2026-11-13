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
  setupThemeControls();
};

setupNavigation();
document.addEventListener('astro:page-load', setupNavigation);
