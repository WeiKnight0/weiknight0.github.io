(() => {
  const savedTheme = localStorage.getItem('wkn-color-theme');
  const theme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  document.documentElement.dataset.colorTheme = theme;
  document.documentElement.style.colorScheme = theme;
})();
