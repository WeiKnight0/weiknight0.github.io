import { useEffect, useMemo, useState } from 'react';

import { noteApi, type NoteSummary } from './noteApi';

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : '';
}

/**
 * @description Renders the searchable member-only article feed from the backend.
 */
export default function NotesFeed() {
  const [articles, setArticles] = useState<NoteSummary[]>([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    noteApi<NoteSummary[]>('/api/v1/notes').then(setArticles).catch((reason: Error) => setError(reason.message));
  }, []);

  const tags = useMemo(() => Array.from(new Set(articles.flatMap((article) => article.tags ?? []))).sort(), [articles]);
  const visible = articles.filter((article) => {
    const matchesText = `${article.title} ${article.summary ?? ''} ${article.series ?? ''} ${(article.tags ?? []).join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (!tag || article.tags?.includes(tag));
  });

  return (
    <div>
      <header className="border-b border-real-accent/25 pb-8">
        <a href="/real/" className="text-sm text-real-accent hover:underline">← Back to Real</a>
        <p className="text-xs font-bold uppercase tracking-[.25em] text-real-accent">Knowledge archive</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Notes</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Study notes, technical references, and ideas arranged as articles.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_14rem]">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes…" className="border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-real-accent" />
          <select value={tag} onChange={(event) => setTag(event.target.value)} className="border border-white/15 bg-slate-950 px-4 py-3 text-white outline-none focus:border-real-accent">
            <option value="">All tags</option>{tags.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </header>

      {error && <p className="mt-8 border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</p>}
      {!error && !articles.length && <p className="py-20 text-center text-white/35">Loading articles…</p>}
      {articles.length > 0 && !visible.length && <p className="py-20 text-center text-white/35">No matching articles.</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visible.map((article) => <article key={article.slug} className="group overflow-hidden border border-white/10 bg-black/20 transition hover:-translate-y-1 hover:border-real-accent/40">
          {article.coverUrl && <a href={`/real/notes/${article.slug}/`} className="block aspect-[2/1] overflow-hidden bg-black/30"><img src={article.coverUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></a>}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/35"><time>{formatDate(article.publishedAt)}</time>{article.series && <><span>·</span><span className="text-real-accent">{article.series}</span></>}</div>
            <h2 className="mt-3 text-2xl font-black leading-tight text-white transition group-hover:text-real-accent"><a href={`/real/notes/${article.slug}/`}>{article.title}</a></h2>
            <p className="mt-3 line-clamp-3 leading-7 text-white/50">{article.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">{article.tags?.map((value) => <button key={value} type="button" onClick={() => setTag(value)} className="border border-white/10 px-2 py-1 text-xs text-white/45 hover:border-real-accent/40 hover:text-real-accent">#{value}</button>)}</div>
          </div>
        </article>)}
      </div>
      <nav className="mt-14 flex flex-wrap gap-5 border-t border-white/10 pt-7 text-sm text-white/40" aria-label="Notes information">
        <a href="/real/notes/about/" className="hover:text-real-accent">About</a>
        <a href="/real/notes/privacy/" className="hover:text-real-accent">Privacy</a>
        <a href="/real/notes/terms/" className="hover:text-real-accent">Terms</a>
      </nav>
    </div>
  );
}
