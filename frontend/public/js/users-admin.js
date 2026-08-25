(() => {
  const api = window.siteApi;
  const form = document.querySelector('#user-form');
  const list = document.querySelector('#users-list');
  const notice = document.querySelector('#notice');
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const showNotice = (message, type = 'success') => {
    notice.textContent = message;
    notice.className = `mb-5 border px-4 py-3 text-sm ${type === 'error'
      ? 'border-red-300/40 bg-red-300/10 text-red-100'
      : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  };

  const showError = (error) => {
    if (error.status === 403) {
      location.replace('/login/');
      return;
    }
    showNotice(error.message, 'error');
  };

  const loadUsers = async () => {
    const users = await api('/admin/users');
    document.querySelector('#user-count').textContent = `${users.length} user${users.length === 1 ? '' : 's'}`;
    if (!users.length) {
      list.innerHTML = '<p class="p-8 text-center text-sm text-white/40">No member accounts have been created.</p>';
      return;
    }
    list.innerHTML = users.map((user) => `<div class="flex flex-wrap items-center justify-between gap-4 p-5"><div><p class="font-bold text-white">${escapeHtml(user.username)}</p><p class="mt-1 text-xs text-white/35">Created ${user.createdAt ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(user.createdAt)) : 'just now'}</p></div><button type="button" data-delete-user="${user.id}" data-username="${escapeHtml(user.username)}" class="border border-red-300/25 px-3 py-2 text-xs text-red-200 hover:bg-red-300/10">Delete</button></div>`).join('');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }
    const button = document.querySelector('#create-user');
    button.disabled = true;
    button.textContent = 'Creating…';
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      form.reset();
      showNotice('User created.');
      await loadUsers();
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
      button.textContent = 'Create user';
    }
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-user]');
    if (!button || !window.confirm(`Delete “${button.dataset.username}”? This immediately revokes the account.`)) {
      return;
    }
    button.disabled = true;
    try {
      await api(`/admin/users/${button.dataset.deleteUser}`, { method: 'DELETE' });
      showNotice('User deleted.');
      await loadUsers();
    } catch (error) {
      showError(error);
      button.disabled = false;
    }
  });

  document.querySelector('#logout').addEventListener('click', async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      location.replace('/login/');
    } catch (error) {
      showError(error);
    }
  });

  api('/auth/me')
    .then((account) => {
      if (account.role !== 'admin') {
        throw Object.assign(new Error('Administrator access is required.'), { status: 403 });
      }
      return loadUsers();
    })
    .catch(showError);
})();
