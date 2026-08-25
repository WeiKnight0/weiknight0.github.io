(() => {
  const api = window.siteApi;
  const content = document.querySelector('#profile-content');
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const load = async () => {
    const account = await api('/auth/me');
    const adminLink = account.role === 'admin'
      ? '<a href="/admin/" class="border border-real-accent/50 px-4 py-2 text-real-accent">Open admin panel</a>'
      : '';
    content.innerHTML = `<dl class="grid gap-4"><div><dt class="text-xs uppercase tracking-widest text-white/40">Username</dt><dd class="mt-1 text-xl text-white">${escapeHtml(account.username)}</dd></div><div><dt class="text-xs uppercase tracking-widest text-white/40">Role</dt><dd class="mt-1 capitalize text-white">${escapeHtml(account.role)}</dd></div></dl><div class="mt-8 flex flex-wrap gap-3">${adminLink}<button id="profile-logout" class="border border-white/20 px-4 py-2">Sign out</button></div>`;
    document.querySelector('#profile-logout').addEventListener('click', async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
        location.replace('/');
      } catch (error) {
        content.insertAdjacentHTML('beforeend', `<p class="mt-4 text-red-300">${escapeHtml(error.message)}</p>`);
      }
    });
  };

  load().catch(() => location.replace('/login/'));
})();
