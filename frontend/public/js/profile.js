(() => {
  const api = window.siteApi;
  const content = document.querySelector('#profile-content');
  let account;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);

  const initial = () => (account.displayName || account.username).trim().charAt(0).toUpperCase();
  const roleName = () => account.role === 'admin' ? 'Administrator' : 'Member';
  const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(value));

  const avatar = () => account.avatarUrl
    ? `<img src="${escapeHtml(account.avatarUrl)}" alt="${escapeHtml(account.displayName)} avatar" class="shrink-0 border border-real-accent/40 object-cover" style="width:7rem;height:7rem;min-width:7rem;min-height:7rem;aspect-ratio:1/1;border-radius:9999px" />`
    : `<span class="grid shrink-0 place-items-center overflow-hidden border border-real-accent/40 bg-real-accent/10 text-3xl font-black leading-none text-real-accent" style="width:7rem;height:7rem;min-width:7rem;min-height:7rem;aspect-ratio:1/1;border-radius:9999px">${escapeHtml(initial())}</span>`;

  const message = (text, error = false) => {
    const target = document.querySelector('#profile-message');
    target.hidden = false;
    target.textContent = text;
    target.className = `mb-6 border px-4 py-3 text-sm ${error
      ? 'border-red-300/30 bg-red-300/10 text-red-200'
      : 'border-real-accent/30 bg-real-accent/10 text-real-accent'}`;
  };

  const render = () => {
    content.innerHTML = `<div id="profile-message" hidden></div>
      <section class="border border-white/10 bg-real-surface p-6 md:p-8">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div id="profile-avatar">${avatar()}</div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <p class="truncate text-2xl font-black text-white md:text-3xl">${escapeHtml(account.displayName)}</p>
              <span class="border border-real-accent/30 bg-real-accent/10 px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.16em] text-real-accent">${roleName()}</span>
            </div>
            <p class="mt-2 text-sm text-white/45">@${escapeHtml(account.username)}</p>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-white/60">${account.bio ? escapeHtml(account.bio) : 'Add a short introduction so this account feels like your own.'}</p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <button id="profile-avatar-upload" type="button" class="border border-white/20 px-3 py-2 text-sm text-white/70 transition hover:border-real-accent/50 hover:text-real-accent">Upload avatar</button>
            <button id="profile-avatar-remove" type="button" class="border border-white/20 px-3 py-2 text-sm text-white/55 transition hover:border-red-300/40 hover:text-red-200" ${account.avatarUrl ? '' : 'hidden'}>Remove</button>
          </div>
          <input id="profile-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" hidden />
        </div>
      </section>

      <div class="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,.65fr)]">
        <div class="grid gap-6">
          <form id="profile-form" class="grid gap-5 border border-white/10 bg-real-surface p-6">
            <div><h2 class="text-lg font-black text-white">Public profile</h2><p class="mt-1 text-sm text-white/45">Your username is fixed, but the visible profile is yours to maintain.</p></div>
            <label class="field-label grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/60">Display name<input name="displayName" required maxlength="100" value="${escapeHtml(account.displayName)}" class="input border border-white/20 bg-black/30 p-3 text-base font-normal normal-case tracking-normal text-white outline-none focus:border-real-accent" /></label>
            <label class="field-label grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/60">About you<textarea name="bio" maxlength="500" rows="5" placeholder="A short introduction" class="input resize-y border border-white/20 bg-black/30 p-3 text-base font-normal leading-6 normal-case tracking-normal text-white outline-none focus:border-real-accent">${escapeHtml(account.bio || '')}</textarea><span class="text-right text-[.7rem] font-normal normal-case tracking-normal text-white/35"><span id="profile-bio-count">${(account.bio || '').length}</span>/500</span></label>
            <button type="submit" class="bg-real-accent px-4 py-3 font-black text-black transition hover:brightness-110">Save profile</button>
          </form>

          <form id="profile-password-form" class="grid gap-5 border border-white/10 bg-real-surface p-6">
            <div><h2 class="text-lg font-black text-white">Security</h2><p class="mt-1 text-sm text-white/45">Use at least eight characters and confirm the replacement password.</p></div>
            <label class="field-label grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/60">Current password<input name="currentPassword" required type="password" autocomplete="current-password" class="input border border-white/20 bg-black/30 p-3 text-base font-normal normal-case tracking-normal text-white outline-none focus:border-real-accent" /></label>
            <div class="grid gap-4 md:grid-cols-2"><label class="field-label grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/60">New password<input name="password" required minlength="8" maxlength="200" type="password" autocomplete="new-password" class="input border border-white/20 bg-black/30 p-3 text-base font-normal normal-case tracking-normal text-white outline-none focus:border-real-accent" /></label><label class="field-label grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/60">Confirm password<input name="passwordConfirmation" required minlength="8" maxlength="200" type="password" autocomplete="new-password" class="input border border-white/20 bg-black/30 p-3 text-base font-normal normal-case tracking-normal text-white outline-none focus:border-real-accent" /></label></div>
            <button type="submit" class="border border-real-accent/40 px-4 py-3 font-bold text-real-accent transition hover:bg-real-accent/10">Change password</button>
          </form>
        </div>

        <aside class="grid gap-6">
          <section class="border border-white/10 bg-real-surface p-6"><h2 class="font-black text-white">Account details</h2><dl class="mt-5 grid gap-4 text-sm"><div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3"><dt class="text-white/45">Account type</dt><dd class="font-bold text-white/80">${roleName()}</dd></div><div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3"><dt class="text-white/45">Joined</dt><dd class="text-right text-white/70">${formatDate(account.createdAt)}</dd></div><div class="flex items-center justify-between gap-4"><dt class="text-white/45">Last updated</dt><dd class="text-right text-white/70">${formatDate(account.updatedAt)}</dd></div></dl></section>
          <section class="border border-white/10 bg-real-surface p-6"><h2 class="font-black text-white">Quick access</h2><nav class="mt-4 grid gap-2">${account.role === 'admin' ? '<a href="/admin/blogs/" class="border border-real-accent/30 px-4 py-3 text-sm font-bold text-real-accent transition hover:bg-real-accent/10">Administration panel <span class="float-right">↗</span></a>' : ''}<a href="/real/notes/" class="border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:border-real-accent/30 hover:text-real-accent">Browse notes <span class="float-right">→</span></a><a href="/real/blog/" class="border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:border-real-accent/30 hover:text-real-accent">Read blogs <span class="float-right">→</span></a></nav></section>
          <button id="profile-logout" class="border border-white/20 px-4 py-3 text-sm font-bold text-white/65 transition hover:border-red-300/40 hover:text-red-200">Sign out</button>
        </aside>
      </div>`;
    bindActions();
  };

  const refreshAccount = async () => {
    account = await api('/auth/me');
    render();
    window.dispatchEvent(new CustomEvent('account-profile-change'));
  };

  const bindActions = () => {
    const profileForm = document.querySelector('#profile-form');
    const passwordForm = document.querySelector('#profile-password-form');
    const avatarFile = document.querySelector('#profile-avatar-file');
    const bio = profileForm.elements.bio;

    bio.addEventListener('input', () => {
      document.querySelector('#profile-bio-count').textContent = bio.value.length;
    });

    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!profileForm.reportValidity()) return;
      try {
        account = await api('/account/profile', {
          method: 'PUT',
          body: JSON.stringify({
            displayName: profileForm.elements.displayName.value,
            bio: profileForm.elements.bio.value,
          }),
        });
        render();
        message('Profile updated.');
        window.dispatchEvent(new CustomEvent('account-profile-change'));
      } catch (error) {
        message(error.message, true);
      }
    });

    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const confirmation = passwordForm.elements.passwordConfirmation;
      confirmation.setCustomValidity(passwordForm.elements.password.value === confirmation.value ? '' : 'Passwords do not match.');
      if (!passwordForm.reportValidity()) return;
      try {
        await api('/account/password', {
          method: 'PUT',
          body: JSON.stringify(Object.fromEntries(new FormData(passwordForm))),
        });
        passwordForm.reset();
        message('Password changed.');
      } catch (error) {
        message(error.message, true);
      }
    });

    document.querySelector('#profile-avatar-upload').addEventListener('click', () => avatarFile.click());
    avatarFile.addEventListener('change', async () => {
      if (!avatarFile.files[0]) return;
      const body = new FormData();
      body.append('file', avatarFile.files[0]);
      try {
        await api('/account/avatar', { method: 'POST', body });
        await refreshAccount();
        message('Avatar updated.');
      } catch (error) {
        message(error.message, true);
      }
    });

    document.querySelector('#profile-avatar-remove').addEventListener('click', async () => {
      try {
        await api('/account/avatar', { method: 'DELETE' });
        await refreshAccount();
        message('Avatar removed.');
      } catch (error) {
        message(error.message, true);
      }
    });

    document.querySelector('#profile-logout').addEventListener('click', async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
        location.replace('/');
      } catch (error) {
        message(error.message, true);
      }
    });
  };

  api('/auth/me')
    .then((loaded) => {
      account = loaded;
      render();
    })
    .catch(() => location.replace('/login/'));
})();
