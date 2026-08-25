import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor, JSONContent } from '@tiptap/core';
import type { EditorView } from '@tiptap/pm/view';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createNoteExtensions } from './editorExtensions';
import { noteApi, type NoteArticle, type NoteAsset, type NoteSummary, uploadNoteAsset } from './noteApi';
import './note-editor.css';

const EMPTY_DOCUMENT: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

async function insertUploadedImage(view: EditorView, file: File, position?: number) {
  try {
    const asset = await uploadNoteAsset(file);
    const image = view.state.schema.nodes.image?.create({ src: asset.url, alt: asset.originalName, title: asset.originalName });
    if (!image) throw new Error('The editor image extension is unavailable.');
    view.dispatch(position === undefined
      ? view.state.tr.replaceSelectionWith(image)
      : view.state.tr.insert(position, image));
    window.dispatchEvent(new CustomEvent('note-asset-change'));
  } catch (reason) {
    window.dispatchEvent(new CustomEvent('note-asset-change', { detail: (reason as Error).message }));
  }
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160);
}

function localDateTime(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function editorContent(article: NoteArticle) {
  return article.contentFormat === 'JSON' ? JSON.parse(article.content) as JSONContent : article.content;
}

function toolbarButton(active: boolean) {
  return `border px-3 py-1.5 text-xs font-bold transition ${active
    ? 'border-real-accent bg-real-accent text-black'
    : 'border-white/15 text-white/65 hover:border-real-accent/50 hover:text-real-accent'}`;
}

function EditorToolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const href = window.prompt('Link URL', editor.getAttributes('link').href ?? 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };
  const insertMath = () => {
    const latex = window.prompt('LaTeX formula, without $ delimiters');
    if (latex?.trim()) editor.chain().focus().insertInlineMath({ latex: latex.trim() }).run();
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap gap-1 border-b border-white/10 bg-slate-950/95 p-3 backdrop-blur">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarButton(editor.isActive('bold'))}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarButton(editor.isActive('italic'))}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButton(editor.isActive('heading', { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarButton(editor.isActive('heading', { level: 3 }))}>H3</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarButton(editor.isActive('bulletList'))}>List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarButton(editor.isActive('orderedList'))}>1. List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={toolbarButton(editor.isActive('taskList'))}>Tasks</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolbarButton(editor.isActive('blockquote'))}>Quote</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toolbarButton(editor.isActive('codeBlock'))}>Code</button>
      <button type="button" onClick={setLink} className={toolbarButton(editor.isActive('link'))}>Link</button>
      <button type="button" onClick={insertMath} className={toolbarButton(editor.isActive('inlineMath'))}>Math</button>
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={toolbarButton(editor.isActive('table'))}>Table</button>
      <button type="button" onClick={onImage} className={toolbarButton(false)}>Image</button>
      <span className="mx-1 w-px bg-white/10" />
      <button type="button" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} className={toolbarButton(false)}>Undo</button>
      <button type="button" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} className={toolbarButton(false)}>Redo</button>
    </div>
  );
}

/**
 * @description Renders the complete social-style note administration workspace.
 */
export default function NotesAdmin() {
  const [summaries, setSummaries] = useState<NoteSummary[]>([]);
  const [article, setArticle] = useState<NoteArticle | null>(null);
  const [assets, setAssets] = useState<NoteAsset[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const loadingContent = useRef(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const extensions = useMemo(createNoteExtensions, []);
  const editor = useEditor({
    extensions,
    content: EMPTY_DOCUMENT,
    editorProps: {
      attributes: { class: 'px-6 py-7 sm:px-10 sm:py-9' },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        void insertUploadedImage(view, file);
        return true;
      },
      handleDrop: (view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((item) => item.type.startsWith('image/'));
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (!file || position === undefined) return false;
        event.preventDefault();
        void insertUploadedImage(view, file, position);
        return true;
      },
    },
    onUpdate: () => {
      if (!loadingContent.current) setDirty(true);
    },
  });

  const loadSummaries = useCallback(async () => {
    const loaded = await noteApi<NoteSummary[]>('/api/v1/admin/notes');
    setSummaries(loaded);
    return loaded;
  }, []);

  const loadAssets = useCallback(async () => {
    setAssets(await noteApi<NoteAsset[]>('/api/v1/admin/note-assets'));
  }, []);

  const selectArticle = useCallback(async (id: number) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    const selected = await noteApi<NoteArticle>(`/api/v1/admin/notes/${id}`);
    setArticle(selected);
    setDirty(false);
  }, [dirty]);

  useEffect(() => {
    Promise.all([loadSummaries(), loadAssets()])
      .then(([loaded]) => {
        if (loaded[0]?.id) selectArticle(loaded[0].id);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    const refreshAssets = (event: Event) => {
      const uploadError = (event as CustomEvent<string>).detail;
      if (uploadError) {
        setError(uploadError);
        return;
      }
      loadAssets().catch((reason: Error) => setError(reason.message));
    };
    window.addEventListener('note-asset-change', refreshAssets);
    return () => window.removeEventListener('note-asset-change', refreshAssets);
  }, [loadAssets]);

  useEffect(() => {
    if (!editor || !article) return;
    loadingContent.current = true;
    editor.commands.setContent(editorContent(article), {
      contentType: article.contentFormat === 'MARKDOWN' ? 'markdown' : 'json',
      emitUpdate: false,
      errorOnInvalidContent: true,
    });
    loadingContent.current = false;
  }, [article?.id, editor]);

  const update = <K extends keyof NoteArticle>(key: K, value: NoteArticle[K]) => {
    setArticle((current) => current ? { ...current, [key]: value } : current);
    setDirty(true);
  };

  const save = useCallback(async (statusOverride?: NoteArticle['status'], silent = false) => {
    if (!article || !editor || saving) return;
    const status = statusOverride ?? article.status;
    if (!article.title.trim() || !article.slug.trim() || !article.summary.trim() || editor.isEmpty) {
      if (!silent) setError('Title, slug, summary, and article body are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...article,
      id: undefined,
      title: article.title.trim(),
      slug: article.slug.trim(),
      summary: article.summary.trim(),
      tags: article.tags.split(',').map((tag) => tag.trim()).filter(Boolean).join(','),
      series: article.series?.trim() || null,
      status,
      contentFormat: 'JSON',
      content: JSON.stringify(editor.getJSON()),
      publishedAt: status === 'PUBLISHED' ? article.publishedAt ?? new Date().toISOString() : article.publishedAt,
      updatedAt: undefined,
    };
    try {
      const saved = await noteApi<NoteArticle>(`/api/v1/admin/notes${article.id ? `/${article.id}` : ''}`, {
        method: article.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setArticle(saved);
      setDirty(false);
      setMessage(silent
        ? `Autosaved at ${new Date().toLocaleTimeString()}`
        : status === 'PUBLISHED'
          ? 'Article published.'
          : status === 'ARCHIVED' ? 'Article archived.' : 'Draft saved.');
      await loadSummaries();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }, [article, editor, saving, loadSummaries]);

  useEffect(() => {
    if (!dirty || !article?.id || saving) return;
    const timeout = window.setTimeout(() => save(undefined, true), 1800);
    return () => window.clearTimeout(timeout);
  }, [dirty, article, saving, save]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const newArticle = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    setArticle({
      id: 0,
      slug: '',
      title: '',
      summary: '',
      coverUrl: null,
      tags: '',
      series: null,
      seriesOrder: null,
      status: 'DRAFT',
      contentFormat: 'JSON',
      content: JSON.stringify(EMPTY_DOCUMENT),
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    });
    if (editor) editor.commands.setContent(EMPTY_DOCUMENT, { emitUpdate: false });
    setDirty(false);
  };

  const uploadIntoEditor = async (file: File) => {
    if (!editor) return;
    try {
      const asset = await uploadNoteAsset(file);
      editor.chain().focus().setImage({ src: asset.url, alt: asset.originalName, title: asset.originalName }).run();
      await loadAssets();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  const uploadCover = async (file: File) => {
    try {
      const asset = await uploadNoteAsset(file);
      update('coverUrl', asset.url);
      await loadAssets();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  const deleteArticle = async () => {
    if (!article?.id || !window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    await noteApi<void>(`/api/v1/admin/notes/${article.id}`, { method: 'DELETE' });
    setArticle(null);
    setDirty(false);
    await loadSummaries();
  };

  const deleteAsset = async (asset: NoteAsset) => {
    if (!window.confirm(`Delete image “${asset.originalName}”?`)) return;
    try {
      await noteApi<void>(`/api/v1/admin/note-assets/${asset.id}`, { method: 'DELETE' });
      await loadAssets();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  const visible = summaries.filter((item) => {
    const matchesText = `${item.title} ${item.slug} ${item.series ?? ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (statusFilter === 'ALL' || item.status === statusFilter);
  });

  return (
    <div className="grid min-h-[48rem] overflow-hidden border border-white/10 bg-black/20 lg:grid-cols-[21rem_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b border-white/10 bg-black/25 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-bold text-white">Articles</h2><p className="mt-1 text-xs text-white/40">{summaries.length} total</p></div>
            <button type="button" onClick={newArticle} className="bg-real-accent px-3 py-2 text-sm font-black text-black">+ New</button>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles…" className="mt-4 w-full border border-white/20 bg-black/30 p-2 text-sm outline-none focus:border-real-accent" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 w-full border border-white/20 bg-slate-950 p-2 text-sm text-white">
            <option value="ALL">All statuses</option><option value="DRAFT">Drafts</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="max-h-[calc(100vh-15rem)] flex-1 overflow-y-auto p-2">
          {visible.map((item) => <button key={item.id} type="button" onClick={() => item.id && selectArticle(item.id)} className={`mb-1 w-full border-l-2 p-3 text-left ${item.id === article?.id ? 'border-real-accent bg-real-accent/10' : 'border-transparent hover:bg-white/5'}`}>
            <span className="block truncate font-bold text-white/85">{item.title}</span><span className="mt-1 block truncate text-xs text-white/35">{item.slug}</span><span className="mt-2 inline-block border border-white/10 px-2 py-0.5 text-[10px] text-white/45">{item.status}</span>
          </button>)}
        </div>
      </aside>

      {!article || !editor ? <div className="flex min-h-[36rem] items-center justify-center text-white/40">Select an article or create a new draft.</div> : <main className="min-w-0">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
          <div><p className="text-xs text-white/45"><span className="mr-2 border border-white/15 px-2 py-0.5 text-[10px]">{article.status}</span>{saving ? 'Saving…' : dirty ? 'Unsaved changes' : message || 'All changes saved'}</p>{error && <p className="mt-1 text-xs text-red-300">{error}</p>}</div>
          <div className="flex gap-2">
            {article.id > 0 && <a href={`/real/notes/${article.slug}/?preview=${article.id}`} target="_blank" rel="noreferrer" className="border border-white/20 px-4 py-2 text-sm text-white/65">Preview ↗</a>}
            {article.id > 0 && <button type="button" onClick={deleteArticle} className="border border-red-300/30 px-4 py-2 text-sm text-red-200">Delete</button>}
            {article.id > 0 && article.status !== 'ARCHIVED' && <button type="button" disabled={saving} onClick={() => save('ARCHIVED')} className="border border-white/20 px-4 py-2 text-sm text-white/55">Archive</button>}
            <button type="button" disabled={saving} onClick={() => save('DRAFT')} className="border border-white/20 px-4 py-2 text-sm text-white/75">Save draft</button>
            <button type="button" disabled={saving} onClick={() => save('PUBLISHED')} className="bg-real-accent px-5 py-2 text-sm font-black text-black">Publish</button>
          </div>
        </header>

        <section className="mx-auto max-w-5xl p-5 sm:p-8">
          {article.coverUrl && <div className="relative mb-7 aspect-[2.4/1] overflow-hidden bg-black/30"><img src={article.coverUrl} alt="Article cover" className="h-full w-full object-cover" /><button type="button" onClick={() => update('coverUrl', null)} className="absolute right-3 top-3 bg-black/75 px-3 py-1 text-xs">Remove cover</button></div>}
          <input value={article.title} onChange={(event) => { update('title', event.target.value); if (!article.id) update('slug', slugify(event.target.value)); }} placeholder="Article title" className="w-full bg-transparent text-4xl font-black leading-tight text-white outline-none placeholder:text-white/20 sm:text-5xl" />
          <textarea value={article.summary} onChange={(event) => update('summary', event.target.value)} placeholder="Write a short summary…" className="mt-4 min-h-20 w-full resize-none bg-transparent text-lg leading-7 text-white/55 outline-none placeholder:text-white/20" />

          <details className="mb-6 border-y border-white/10 py-4">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-[.18em] text-real-accent">Article settings</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs text-white/55">URL slug<input value={article.slug} onChange={(event) => update('slug', slugify(event.target.value))} className="border border-white/20 bg-black/30 p-2 text-white" /></label>
              <label className="grid gap-1 text-xs text-white/55">Tags<input value={article.tags} onChange={(event) => update('tags', event.target.value)} placeholder="algorithm, java" className="border border-white/20 bg-black/30 p-2 text-white" /></label>
              <label className="grid gap-1 text-xs text-white/55">Series<input value={article.series ?? ''} onChange={(event) => update('series', event.target.value)} className="border border-white/20 bg-black/30 p-2 text-white" /></label>
              <label className="grid gap-1 text-xs text-white/55">Series order<input type="number" min="1" value={article.seriesOrder ?? ''} onChange={(event) => update('seriesOrder', event.target.value ? Number(event.target.value) : null)} className="border border-white/20 bg-black/30 p-2 text-white" /></label>
              <label className="grid gap-1 text-xs text-white/55">Publish time<input type="datetime-local" value={localDateTime(article.publishedAt)} onChange={(event) => update('publishedAt', new Date(event.target.value).toISOString())} className="border border-white/20 bg-black/30 p-2 text-white" /></label>
              <div className="flex items-end"><button type="button" onClick={() => coverInput.current?.click()} className="border border-white/20 px-4 py-2 text-sm text-white/70">Upload cover</button></div>
            </div>
          </details>

          <div className="note-editor overflow-hidden border border-white/10 bg-black/20">
            <EditorToolbar editor={editor} onImage={() => imageInput.current?.click()} />
            <EditorContent editor={editor} />
          </div>

          <details className="mt-6 border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-bold text-white/70">Image library ({assets.length})</summary>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {assets.map((asset) => <div key={asset.id} className="group relative">
                <button type="button" onClick={() => editor.chain().focus().setImage({ src: asset.url, alt: asset.originalName }).run()} className="w-full text-left">
                  <span className="block aspect-square overflow-hidden bg-black/40"><img src={asset.url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /></span><span className="mt-1 block truncate pr-7 text-xs text-white/45">{asset.originalName}</span>
                </button>
                <button type="button" onClick={() => deleteAsset(asset)} aria-label={`Delete ${asset.originalName}`} className="absolute bottom-0 right-0 px-2 text-red-300 opacity-50 hover:opacity-100">×</button>
              </div>)}
            </div>
          </details>
        </section>
        <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadIntoEditor(file); event.target.value = ''; }} />
        <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCover(file); event.target.value = ''; }} />
      </main>}
    </div>
  );
}
