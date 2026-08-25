import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { useEffect, useMemo, useState } from 'react';

import { createNoteExtensions } from './editorExtensions';
import { noteApi } from './noteApi';
import './note-editor.css';

interface Article {
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  tags: string[];
  series: string | null;
  seriesOrder: number | null;
  publishedAt: string | null;
  updatedAt: string;
  contentFormat: 'MARKDOWN' | 'JSON';
  content: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}

/**
 * @description Loads and renders the published note addressed by the current URL.
 */
export default function NoteReader() {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const extensions = useMemo(createNoteExtensions, []);
  const editor = useEditor({
    extensions,
    editable: false,
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: { attributes: { class: 'px-0 py-2' } },
  });

  useEffect(() => {
    const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
    if (!slug) {
      setError('The article URL is invalid.');
      return;
    }
    const preview = new URLSearchParams(window.location.search).get('preview');
    noteApi<Omit<Article, 'tags'> & { tags: string[] | string }>(preview
      ? `/api/v1/admin/notes/${encodeURIComponent(preview)}`
      : `/api/v1/notes/${encodeURIComponent(slug)}`)
      .then((loaded) => setArticle({
        ...loaded,
        tags: Array.isArray(loaded.tags)
          ? loaded.tags
          : loaded.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      }))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!editor || !article) return;
    editor.commands.setContent(
      article.contentFormat === 'JSON' ? JSON.parse(article.content) as JSONContent : article.content,
      {
        contentType: article.contentFormat === 'MARKDOWN' ? 'markdown' : 'json',
        emitUpdate: false,
        errorOnInvalidContent: true,
      },
    );
  }, [article, editor]);

  if (error) return <p className="border border-red-300/30 bg-red-300/10 p-5 text-red-100">{error}</p>;
  if (!article || !editor) return <p className="py-24 text-center text-white/35">Loading article…</p>;

  return (
    <article>
      <a href="/real/notes/" className="text-sm text-real-accent hover:underline">← All notes</a>
      <header className="mt-8 border-b border-white/10 pb-8">
        {article.series && <p className="text-xs font-bold uppercase tracking-[.2em] text-real-accent">{article.series}{article.seriesOrder ? ` · Part ${article.seriesOrder}` : ''}</p>}
        <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">{article.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/55">{article.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/35">{article.publishedAt && <><time>Published {formatDate(article.publishedAt)}</time><span>·</span></>}<span>Updated {formatDate(article.updatedAt)}</span></div>
        <div className="mt-4 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="border border-white/10 px-2 py-1 text-xs text-white/45">#{tag}</span>)}</div>
      </header>
      {article.coverUrl && <img src={article.coverUrl} alt="" className="mt-8 aspect-[2.2/1] w-full object-cover" />}
      <div className="note-editor note-reader mx-auto mt-8 max-w-3xl"><EditorContent editor={editor} /></div>
      <nav className="mt-14 flex flex-wrap gap-5 border-t border-white/10 pt-7 text-sm text-white/40" aria-label="Notes information">
        <a href="/real/notes/about/" className="hover:text-real-accent">About</a>
        <a href="/real/notes/privacy/" className="hover:text-real-accent">Privacy</a>
        <a href="/real/notes/terms/" className="hover:text-real-accent">Terms</a>
      </nav>
    </article>
  );
}
