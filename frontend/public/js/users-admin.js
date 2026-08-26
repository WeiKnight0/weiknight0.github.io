(() => {
  const api = window.siteApi;
  const list = document.querySelector('#users-list');
  const notice = document.querySelector('#notice');
  const editor = document.querySelector('#user-editor');
  const empty = document.querySelector('#editor-empty');
  const accountForm = document.querySelector('#account-form');
  const passwordForm = document.querySelector('#password-form');
  const avatarFile = document.querySelector('#avatar-file');
  const createDialog = document.querySelector('#create-user-dialog');
  const createForm = document.querySelector('#create-user-form');
  let users = [];
  let selectedId = null;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const initial = (user) => (user.displayName || user.username || '?').trim().charAt(0).toUpperCase();

  const avatar = (user, classes) => user.avatarUrl
    ? `<img src="${escapeHtml(user.avatarUrl)}" alt="" class="${classes} object-cover" />`
    : `<span class="${classes} grid place-items-center bg-real-accent/10 font-black text-real-accent">${escapeHtml(initial(user))}</span>`;

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

  const selectedUser = () => users.find((user) => user.id === selectedId);

  const renderList = () => {
    const query = document.querySelector('#user-search').value.trim().toLowerCase();
    const visible = users.filter((user) => `${user.username} ${user.displayName}`.toLowerCase().includes(query));
    document.querySelector('#user-count').textContent = `${users.length} user${users.length === 1 ? '' : 's'}`;
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

  const renderAvatar = (user) => {
    document.querySelector('#editor-avatar').innerHTML = avatar(user, 'h-full w-full');
    document.querySelector('#remove-avatar').hidden = !user.avatarUrl;
  };

  const openCreate = () => {
    createForm.reset();
    createForm.elements.passwordConfirmation.setCustomValidity('');
    document.querySelector('#create-user-error').hidden = true;
    createDialog.showModal();
    createForm.elements.username.focus();
  };

  const openUser = (id) => {
    selectedId = id;
    const user = selectedUser();
    empty.hidden = true;
    editor.hidden = false;
    document.querySelector('#editor-mode').textContent = user.enabled ? 'Active member' : 'Access disabled';
    document.querySelector('#editor-title').textContent = user.displayName;
    document.querySelector('#editor-meta').textContent = `@${user.username} · Created ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(user.createdAt))}`;
    document.querySelector('#avatar-actions').hidden = false;
    document.querySelector('#enabled-field').hidden = false;
    document.querySelector('#existing-user-actions').hidden = false;
    accountForm.elements.username.value = user.username;
    accountForm.elements.displayName.value = user.displayName;
    accountForm.elements.enabled.checked = user.enabled;
    passwordForm.reset();
    renderAvatar(user);
    renderList();
  };

  const loadUsers = async (preferredId = selectedId) => {
    users = await api('/admin/users');
    renderList();
    if (preferredId && users.some((user) => user.id === preferredId)) {
      openUser(preferredId);
    }
  };

  const matchingPasswords = (form) => {
    if (form.elements.password.value === form.elements.passwordConfirmation.value) {
      form.elements.passwordConfirmation.setCustomValidity('');
      return true;
    }
    form.elements.passwordConfirmation.setCustomValidity('Passwords do not match.');
    form.elements.passwordConfirmation.reportValidity();
    return false;
  };

  accountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!accountForm.reportValidity()) return;
    const button = document.querySelector('#save-user');
    button.disabled = true;
    try {
      const saved = await api(`/admin/users/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: accountForm.elements.username.value,
          displayName: accountForm.elements.displayName.value,
          enabled: accountForm.elements.enabled.checked,
        }),
      });
      showNotice('Account updated.');
      await loadUsers(saved.id);
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
    }
  });

  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!createForm.reportValidity() || !matchingPasswords(createForm)) return;
    const button = document.querySelector('#create-user-submit');
    button.disabled = true;
    try {
      const saved = await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(createForm))),
      });
      createDialog.close();
      showNotice('User created.');
      await loadUsers(saved.id);
    } catch (error) {
      if (error.status === 403) {
        location.replace('/login/');
        return;
      }
      const target = document.querySelector('#create-user-error');
      target.textContent = error.message;
      target.hidden = false;
    } finally {
      button.disabled = false;
    }
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!passwordForm.reportValidity() || !matchingPasswords(passwordForm)) return;
    const button = passwordForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await api(`/admin/users/${selectedId}/password`, {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(new FormData(passwordForm))),
      });
      passwordForm.reset();
      showNotice('Password reset.');
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
    }
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-user-id]');
    if (button) openUser(Number(button.dataset.userId));
  });

  document.querySelector('#new-user').addEventListener('click', openCreate);
  document.querySelector('#close-create-user').addEventListener('click', () => createDialog.close());
  document.querySelector('#cancel-create-user').addEventListener('click', () => createDialog.close());
  document.querySelector('#user-search').addEventListener('input', renderList);
  document.querySelector('#upload-avatar').addEventListener('click', () => avatarFile.click());
  avatarFile.addEventListener('change', async () => {
    const file = avatarFile.files[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    try {
      await api(`/admin/users/${selectedId}/avatar`, { method: 'POST', body });
      showNotice('Avatar updated.');
      await loadUsers(selectedId);
    } catch (error) {
      showError(error);
    } finally {
      avatarFile.value = '';
    }
  });

  document.querySelector('#remove-avatar').addEventListener('click', async () => {
    try {
      await api(`/admin/users/${selectedId}/avatar`, { method: 'DELETE' });
      showNotice('Avatar removed.');
      await loadUsers(selectedId);
    } catch (error) {
      showError(error);
    }
  });

  document.querySelector('#delete-user').addEventListener('click', async () => {
    const user = selectedUser();
    if (!window.confirm(`Delete “${user.displayName}” (@${user.username})? This immediately revokes the account.`)) return;
    try {
      await api(`/admin/users/${selectedId}`, { method: 'DELETE' });
      selectedId = null;
      editor.hidden = true;
      empty.hidden = false;
      showNotice('User deleted.');
      await loadUsers();
    } catch (error) {
      showError(error);
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
