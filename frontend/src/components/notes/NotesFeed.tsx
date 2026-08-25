import { useEffect, useMemo, useState } from 'react';

import {
  buildNoteTree,
  directoryLabel,
  directoryNoteCount,
  noteDirectoryHref,
  type DirectoryNode,
} from './NoteTree';
import { noteApi, type NoteListItem } from './noteApi';

function resolveDirectory(root: DirectoryNode, path: string) {
  return path.split('/').filter(Boolean).reduce<DirectoryNode | undefined>(
    (node, segment) => node?.directories.find((directory) => directory.name === segment),
    root,
  );
}

/**
 * @description Renders the member-only note library as one browsable directory level at a time.
 */
export default function NotesFeed() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentPath(new URLSearchParams(window.location.search).get('directory') ?? '');
    noteApi<NoteListItem[]>('/api/v1/notes').then(setNotes).catch((reason: Error) => setError(reason.message));
  }, []);

  const visible = notes.filter((note) => `${note.title} ${note.directory ?? ''} ${(note.tags ?? []).join(' ')}`
    .toLowerCase().includes(query.trim().toLowerCase()));
  const tree = useMemo(() => buildNoteTree(notes), [notes]);
  const currentDirectory = useMemo(
    () => currentPath === null ? undefined : resolveDirectory(tree, currentPath),
    [currentPath, tree],
  );
  const segments = currentPath?.split('/').filter(Boolean) ?? [];

  return <div>
    <header className="border-b border-real-accent/25 pb-8">
      <a href="/real/" className="text-sm text-real-accent hover:underline">← Back to Real</a>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.25em] text-real-accent">Knowledge archive</p>
      <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Notes</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Study notes arranged by subject and topic. Choose a directory, then open a note.</p>
    </header>

    {error && <p className="mt-8 border border-red-300/30 bg-red-300/10 p-4 text-red-100">{error}</p>}
    {!error && (!notes.length || currentPath === null) && <p className="py-20 text-center text-white/35">Loading note directory…</p>}

    {notes.length > 0 && currentPath !== null && <main className="mt-8 min-w-0">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <nav aria-label="Note directory path" className="flex flex-wrap items-center gap-2 text-sm text-white/45">
          <a href={noteDirectoryHref('')} className="hover:text-real-accent">Notes</a>
          {segments.map((segment, index) => <span key={segments.slice(0, index + 1).join('/')} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {index === segments.length - 1
              ? <span className="text-white/75">{directoryLabel(segment)}</span>
              : <a href={noteDirectoryHref(segments.slice(0, index + 1).join('/'))} className="hover:text-real-accent">{directoryLabel(segment)}</a>}
          </span>)}
        </nav>
        <label className="w-full sm:max-w-xs" htmlFor="note-search">
          <span className="sr-only">Search all notes</span>
          <input id="note-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all notes…" className="w-full border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-real-accent" />
        </label>
      </div>

        {query.trim() ? <section>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-real-accent">Search results</p>
          <h2 className="mt-2 text-3xl font-black text-white">{visible.length} notes found</h2>
          <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {visible.map((note) => <a key={note.slug} href={`/real/notes/${note.slug}/`} className="block px-2 py-5 transition hover:bg-white/5 sm:px-4">
              <p className="text-xs text-real-accent">{note.directory?.split('/').map(directoryLabel).join(' / ') || 'Root'}</p>
              <h3 className="mt-1 text-lg font-bold text-white">{note.title}</h3>
            </a>)}
          </div>
        </section> : currentDirectory ? <section className="pt-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-real-accent">{currentPath ? 'Directory' : 'Index'}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{segments.length ? directoryLabel(segments.at(-1)!) : 'Browse the archive'}</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {currentDirectory.directories.map((directory) => <a key={directory.path} href={noteDirectoryHref(directory.path)} className="group border border-white/10 bg-black/20 p-5 transition hover:border-real-accent/45 hover:bg-real-accent/5">
              <p className="text-xs text-real-accent">Directory</p>
              <h3 className="mt-2 flex items-center justify-between gap-4 text-xl font-black text-white"><span>{directoryLabel(directory.name)}</span><span className="text-real-accent transition group-hover:translate-x-1">→</span></h3>
              <p className="mt-3 text-sm leading-6 text-white/40">{directoryNoteCount(directory)} notes · {directory.directories.length} subdirectories</p>
            </a>)}
          </div>
          {currentDirectory.notes.length > 0 && <div className="mt-8 border-t border-white/10 pt-7">
            <h3 className="text-sm font-bold uppercase tracking-[.16em] text-white/45">Notes in this directory</h3>
            <div className="mt-3 divide-y divide-white/10 border-y border-white/10">{currentDirectory.notes.map((note) => <a key={note.slug} href={`/real/notes/${note.slug}/`} className="block px-2 py-5 transition hover:bg-white/5 sm:px-4">
              <h4 className="text-lg font-bold text-white">{note.title}</h4>
            </a>)}</div>
          </div>}
        </section> : <section className="mt-8 border border-red-300/30 bg-red-300/10 p-5 text-red-100">
          <h2 className="font-bold">Directory not found</h2>
          <a href={noteDirectoryHref('')} className="mt-2 inline-block text-sm underline">Return to Notes home</a>
        </section>}
    </main>}

    <nav className="mt-14 flex flex-wrap gap-5 border-t border-white/10 pt-7 text-sm text-white/40" aria-label="Site information">
      <a href="/about/" className="hover:text-real-accent">About</a>
      <a href="/privacy/" className="hover:text-real-accent">Privacy</a>
      <a href="/real/notes/terms/" className="hover:text-real-accent">Terms</a>
    </nav>
  </div>;
}
