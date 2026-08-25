(() => {
  const api = window.siteApi;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
  const $ = (selector) => document.querySelector(selector);
  const form = $('#post-form');
  const emptyEditor = $('#empty-editor');
  const list = $('#posts-list');
  const saveState = $('#save-state');
  const notice = $('#notice');
  const contentField = form.elements.namedItem('content');
  const titleField = form.elements.namedItem('title');
  const slugField = form.elements.namedItem('slug');
  let posts = [];
  let selectedId = null;
  let dirty = false;
  let loadingEditor = false;
  let creating = false;
  let slugWasEdited = false;
  let legacySources;

  const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
  const toLocalDateTime = (value) => {
    const date = value ? new Date(value) : new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };
  const slugify = (value) => value.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

  const showNotice = (message, type = 'success') => {
    notice.textContent = message;
    notice.className = `mb-5 border px-4 py-3 text-sm ${type === 'error'
      ? 'border-red-300/40 bg-red-300/10 text-red-100'
      : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => notice.classList.add('hidden'), 4500);
  };

  const updateSaveState = () => {
    saveState.textContent = loadingEditor ? 'Loading blog…' : dirty ? 'Unsaved changes' : 'No unsaved changes';
    saveState.classList.toggle('text-amber-200', dirty);
    saveState.classList.toggle('text-white/45', !dirty);
    $('#content-count').textContent = `${contentField.value.length.toLocaleString()} characters`;
  };

  const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved changes?');

  const renderList = () => {
    const query = $('#post-search').value.trim().toLowerCase();
    const filtered = posts.filter((post) => `${post.title} ${post.slug}`.toLowerCase().includes(query));
    $('#post-count').textContent = `${posts.length} blog${posts.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      list.innerHTML = `<p class="px-3 py-8 text-center text-sm text-white/40">${posts.length ? 'No matching blogs.' : 'No blogs yet. Create your first one.'}</p>`;
      return;
    }
    list.innerHTML = filtered.map((post) => {
      const active = post.id === selectedId;
      return `<button type="button" data-post-id="${post.id}" class="mb-1 w-full border-l-2 p-3 text-left transition ${active ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:border-white/30 hover:bg-white/5'}"><span class="block truncate font-bold ${active ? 'text-real-accent' : 'text-white/85'}">${escapeHtml(post.title)}</span><span class="mt-1 block truncate text-xs text-white/40">${escapeHtml(post.slug)}</span><span class="mt-2 block text-xs text-white/30">${formatDate(post.publishedAt)}</span></button>`;
    }).join('');
  };

  const loadLegacyContent = async (slug) => {
    if (!legacySources) {
      const response = await fetch('/blog-sources.json', { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`Legacy blog source loading failed (${response.status}).`);
      }
      legacySources = await response.json();
    }
    const source = legacySources.find((item) => item.slug.toLowerCase() === slug.toLowerCase());
    return source?.content || '';
  };

  const showForm = () => {
    emptyEditor.classList.add('hidden');
    form.classList.remove('hidden');
  };

  const fillForm = async (post) => {
    loadingEditor = true;
    showForm();
    form.elements.namedItem('id').value = post.id;
    titleField.value = post.title;
    slugField.value = post.slug;
    form.elements.namedItem('description').value = post.description;
    form.elements.namedItem('publishedAt').value = toLocalDateTime(post.publishedAt);
    form.elements.namedItem('tags').value = post.tags || '';
    contentField.value = post.content || await loadLegacyContent(post.slug);
    selectedId = post.id;
    creating = false;
    slugWasEdited = true;
    dirty = false;
    loadingEditor = false;
    $('#editor-mode').textContent = 'Editing blog';
    $('#delete-post').classList.remove('hidden');
    $('#preview-post').classList.remove('hidden');
    $('#preview-post').href = `/real/blog/${encodeURIComponent(post.slug)}/`;
    updateSaveState();
    renderList();
    titleField.focus();
  };

  const selectPost = async (id, { skipConfirm = false } = {}) => {
    if (id === selectedId && !creating) return;
    if (!skipConfirm && !confirmDiscard()) return;
    selectedId = id;
    renderList();
    loadingEditor = true;
    updateSaveState();
    try {
      await fillForm(await api(`/admin/posts/${id}`));
    } catch (error) {
      selectedId = null;
      renderList();
      showNotice(error.message, 'error');
      if (error.status === 403) location.replace('/login/');
    } finally {
      loadingEditor = false;
      updateSaveState();
    }
  };

  const newPost = () => {
    if (!confirmDiscard()) return;
    form.reset();
    showForm();
    selectedId = null;
    creating = true;
    slugWasEdited = false;
    dirty = false;
    form.elements.namedItem('publishedAt').value = toLocalDateTime();
    $('#editor-mode').textContent = 'New blog';
    $('#delete-post').classList.add('hidden');
    $('#preview-post').classList.add('hidden');
    updateSaveState();
    renderList();
    titleField.focus();
  };

  const loadPosts = async ({ select = true, preferredId = null } = {}) => {
    posts = await api('/admin/posts');
    renderList();
    if (!select || !posts.length) return;
    const target = posts.find((post) => post.id === preferredId) || posts[0];
    if (preferredId) selectedId = null;
    await selectPost(target.id, { skipConfirm: true });
  };

  form.addEventListener('input', (event) => {
    if (loadingEditor) return;
    if (event.target === slugField) slugWasEdited = true;
    if (event.target === titleField && creating && !slugWasEdited) slugField.value = slugify(titleField.value);
    dirty = true;
    updateSaveState();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const id = data.id;
    delete data.id;
    data.slug = data.slug.trim();
    data.title = data.title.trim();
    data.description = data.description.trim();
    data.tags = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean).join(',');
    data.publishedAt = new Date(data.publishedAt).toISOString();
    if (!data.content.trim()) {
      showNotice('Blog content cannot be empty.', 'error');
      contentField.focus();
      return;
    }
    const button = $('#save-post');
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      const saved = await api(`/admin/posts${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      dirty = false;
      showNotice(id ? 'Blog saved.' : 'Blog created.');
      await loadPosts({ preferredId: saved.id });
    } catch (error) {
      showNotice(error.message, 'error');
      if (error.status === 403) location.replace('/login/');
    } finally {
      button.disabled = false;
      button.textContent = 'Save blog';
      updateSaveState();
    }
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-post-id]');
    if (button) selectPost(Number(button.dataset.postId));
  });
  $('#post-search').addEventListener('input', renderList);
  $('#new-post').addEventListener('click', newPost);
  $('#delete-post').addEventListener('click', async () => {
    if (!selectedId || !window.confirm(`Delete “${titleField.value}”? This cannot be undone.`)) return;
    try {
      await api(`/admin/posts/${selectedId}`, { method: 'DELETE' });
      dirty = false;
      selectedId = null;
      form.classList.add('hidden');
      emptyEditor.classList.remove('hidden');
      showNotice('Blog deleted.');
      await loadPosts();
    } catch (error) {
      showNotice(error.message, 'error');
    }
  });
  $('#logout').addEventListener('click', async () => {
    if (!confirmDiscard()) return;
    await api('/auth/logout', { method: 'POST' });
    location.replace('/login/');
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !form.classList.contains('hidden')) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  api('/auth/me').then((account) => {
    if (account.role !== 'admin') throw Object.assign(new Error('Administrator access is required.'), { status: 403 });
    return loadPosts();
  }).catch((error) => {
    if (error.status === 403) location.replace('/login/');
    else showNotice(error.message, 'error');
  });
})();
