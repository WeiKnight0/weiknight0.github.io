(() => {
  const api = window.siteApi;
  const tree = document.querySelector('#tree');
  const images = document.querySelector('#images');
  const pathLabel = document.querySelector('#path');
  const editor = document.querySelector('#editor');
  const status = document.querySelector('#status');
  const assetForm = document.querySelector('#asset-form');
  const preview = document.querySelector('#image-preview');
  const escapeHtml = (value) => String(value).replace(/[&<>'\"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;',
  })[character]);
  let notePaths = [];
  let imagePaths = [];
  let currentPath = '';
  let dirty = false;

  const showError = (error) => {
    if (error.status === 403) {
      location.replace('/login/');
      return;
    }
    status.textContent = error.message;
    status.className = 'mt-3 text-xs text-red-300';
  };

  const showStatus = (message) => {
    status.textContent = message;
    status.className = 'mt-3 text-xs text-white/50';
  };

  const confirmDiscard = () => !dirty || window.confirm('Discard your unsaved note changes?');

  const renderNotes = () => {
    const query = document.querySelector('#note-search').value.trim().toLowerCase();
    const matches = notePaths.filter((path) => path.toLowerCase().includes(query));
    document.querySelector('#note-count').textContent = `${notePaths.length} file${notePaths.length === 1 ? '' : 's'}`;
    if (!matches.length) {
      tree.innerHTML = `<p class="py-4 text-center text-xs text-white/35">${notePaths.length ? 'No matching notes.' : 'No Markdown files.'}</p>`;
      return;
    }
    tree.innerHTML = matches.map((path) => `<div class="flex items-center gap-2"><button type="button" data-note="${escapeHtml(path)}" class="min-w-0 flex-1 truncate text-left ${path === currentPath ? 'text-real-accent' : 'text-white/70 hover:text-real-accent'}">${escapeHtml(path)}</button><button type="button" data-move-note="${escapeHtml(path)}" aria-label="Move ${escapeHtml(path)}">↪</button><button type="button" data-delete-note="${escapeHtml(path)}" class="text-red-300" aria-label="Delete ${escapeHtml(path)}">×</button></div>`).join('');
  };

  const renderImages = () => {
    const query = document.querySelector('#image-search').value.trim().toLowerCase();
    const matches = imagePaths.filter((path) => path.toLowerCase().includes(query));
    document.querySelector('#image-count').textContent = `${imagePaths.length} image${imagePaths.length === 1 ? '' : 's'}`;
    if (!matches.length) {
      images.innerHTML = `<p class="py-4 text-center text-xs text-white/35">${imagePaths.length ? 'No matching images.' : 'No image resources.'}</p>`;
      return;
    }
    images.innerHTML = matches.map((path) => `<div class="flex items-center gap-2"><button type="button" data-image="${escapeHtml(path)}" class="min-w-0 flex-1 truncate text-left text-white/70 hover:text-real-accent">${escapeHtml(path)}</button><button type="button" data-delete-image="${escapeHtml(path)}" class="text-red-300" aria-label="Delete ${escapeHtml(path)}">×</button></div>`).join('');
  };

  const loadTree = async () => {
    const result = await api('/admin/notes/tree');
    if (!Array.isArray(result.notes) || !Array.isArray(result.images)) {
      throw new Error('The note tree response is invalid.');
    }
    notePaths = result.notes;
    imagePaths = result.images;
    renderNotes();
    renderImages();
  };

  const selectNote = async (path) => {
    if (!confirmDiscard()) {
      return;
    }
    editor.value = await api(`/admin/notes/file?path=${encodeURIComponent(path)}`);
    currentPath = path;
    pathLabel.textContent = path;
    dirty = false;
    showStatus('');
    renderNotes();
  };

  const deleteNote = async (path) => {
    if (!window.confirm(`Delete ${path}? This cannot be undone.`)) {
      return;
    }
    await api(`/admin/notes/file?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
    if (currentPath === path) {
      currentPath = '';
      editor.value = '';
      pathLabel.textContent = 'Select a note';
      dirty = false;
    }
    await loadTree();
    showStatus('Note deleted. MkDocs is publishing in the background.');
  };

  const moveNote = async (from) => {
    const to = window.prompt('New Markdown path', from);
    if (!to || to === from) {
      return;
    }
    await api('/admin/notes/move', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    });
    if (currentPath === from) {
      currentPath = to;
      pathLabel.textContent = to;
    }
    await loadTree();
    showStatus('Note moved. MkDocs is publishing in the background.');
  };

  const showImage = (path) => {
    document.querySelector('#image-path').textContent = path;
    document.querySelector('#image-content').src = `/api/v1/admin/notes/asset?path=${encodeURIComponent(path)}`;
    preview.showModal();
  };

  const deleteImage = async (path) => {
    if (!window.confirm(`Delete image ${path}? Existing Markdown links may break.`)) {
      return;
    }
    await api(`/admin/notes/asset?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
    preview.close();
    await loadTree();
    showStatus('Image deleted. MkDocs is publishing in the background.');
  };

  tree.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }
    if (button.dataset.note) {
      selectNote(button.dataset.note).catch(showError);
      return;
    }
    if (button.dataset.deleteNote) {
      deleteNote(button.dataset.deleteNote).catch(showError);
      return;
    }
    if (button.dataset.moveNote) {
      moveNote(button.dataset.moveNote).catch(showError);
    }
  });

  images.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }
    if (button.dataset.image) {
      showImage(button.dataset.image);
      return;
    }
    if (button.dataset.deleteImage) {
      deleteImage(button.dataset.deleteImage).catch(showError);
    }
  });

  editor.addEventListener('input', () => {
    dirty = true;
    showStatus('Unsaved changes');
  });

  document.querySelector('#save').addEventListener('click', () => {
    if (!currentPath) {
      showStatus('Select or create a note before saving.');
      return;
    }
    api('/admin/notes/file', {
      method: 'PUT',
      body: JSON.stringify({ path: currentPath, content: editor.value }),
    }).then(() => {
      dirty = false;
      showStatus('Saved. MkDocs is publishing in the background.');
      return loadTree();
    }).catch(showError);
  });

  document.querySelector('#new-note').addEventListener('click', () => {
    if (!confirmDiscard()) {
      return;
    }
    const path = window.prompt('Markdown path, for example algorithms/new-note.md');
    if (!path) {
      return;
    }
    currentPath = path;
    pathLabel.textContent = path;
    editor.value = '# New note\n';
    dirty = true;
    showStatus('New note has not been saved.');
    renderNotes();
    editor.focus();
  });

  document.querySelector('#show-upload').addEventListener('click', () => {
    assetForm.classList.remove('hidden');
    assetForm.elements.namedItem('path').focus();
  });

  document.querySelector('#cancel-upload').addEventListener('click', () => {
    assetForm.reset();
    assetForm.classList.add('hidden');
  });

  assetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!assetForm.reportValidity()) {
      return;
    }
    const path = assetForm.elements.namedItem('path').value.trim();
    const body = new FormData();
    body.append('file', assetForm.elements.namedItem('file').files[0]);
    const button = document.querySelector('#upload-asset');
    button.disabled = true;
    button.textContent = 'Uploading…';
    try {
      await api(`/admin/notes/asset?path=${encodeURIComponent(path)}`, { method: 'POST', body });
      assetForm.reset();
      assetForm.classList.add('hidden');
      await loadTree();
      showStatus('Image uploaded. MkDocs is publishing in the background.');
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
      button.textContent = 'Upload image';
    }
  });

  document.querySelector('#note-search').addEventListener('input', renderNotes);
  document.querySelector('#image-search').addEventListener('input', renderImages);
  document.querySelector('#close-preview').addEventListener('click', () => preview.close());
  preview.addEventListener('close', () => {
    document.querySelector('#image-content').removeAttribute('src');
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  });

  loadTree().catch(showError);
})();
