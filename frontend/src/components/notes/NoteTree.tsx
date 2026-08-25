import type { NoteListItem } from './noteApi';

/**
 * @description One immutable directory in the note hierarchy.
 */
export interface DirectoryNode {
  name: string;
  path: string;
  directories: DirectoryNode[];
  notes: NoteListItem[];
}

interface MutableDirectoryNode extends Omit<DirectoryNode, 'directories'> {
  children: Map<string, MutableDirectoryNode>;
}

interface Props {
  notes: NoteListItem[];
  currentId?: number;
  currentSlug?: string;
  admin?: boolean;
  onSelect?: (id: number) => void;
}

function compareNotes(left: NoteListItem, right: NoteListItem) {
  return (left.sortOrder ?? 1000) - (right.sortOrder ?? 1000)
    || left.title.localeCompare(right.title);
}

function freeze(node: MutableDirectoryNode): DirectoryNode {
  return {
    name: node.name,
    path: node.path,
    directories: Array.from(node.children.values())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(freeze),
    notes: node.notes.sort(compareNotes),
  };
}

/**
 * @description Builds a stable nested directory tree from flat note API records.
 * @param notes Published or administrative note list entries carrying directory paths.
 */
export function buildNoteTree(notes: NoteListItem[]): DirectoryNode {
  const root: MutableDirectoryNode = { name: '', path: '', children: new Map(), notes: [] };
  notes.forEach((note) => {
    const parent = (note.directory ?? '').split('/').filter(Boolean).reduce((node, segment) => {
      const path = node.path ? `${node.path}/${segment}` : segment;
      if (!node.children.has(segment)) {
        node.children.set(segment, { name: segment, path, children: new Map(), notes: [] });
      }
      return node.children.get(segment)!;
    }, root);
    parent.notes.push(note);
  });
  return freeze(root);
}

/**
 * @description Converts a directory identifier into a readable navigation label.
 * @param value One normalized directory path segment.
 */
export function directoryLabel(value: string) {
  return value.split('-').filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * @description Counts every note below one directory for public browsing.
 * @param node Directory whose complete subtree should be counted.
 */
export function directoryNoteCount(node: DirectoryNode): number {
  return node.notes.length + node.directories.reduce((total, child) => total + directoryNoteCount(child), 0);
}

/**
 * @description Builds a shareable URL for one level of the public note directory.
 * @param path Slash-separated directory path, or an empty string for Notes home.
 */
export function noteDirectoryHref(path: string) {
  return path ? `/real/notes/?directory=${encodeURIComponent(path)}` : '/real/notes/';
}

function containsSelection(node: DirectoryNode, currentId?: number, currentSlug?: string): boolean {
  return node.notes.some((note) => note.id === currentId || note.slug === currentSlug)
    || node.directories.some((child) => containsSelection(child, currentId, currentSlug));
}

function NoteLink({ note, currentId, currentSlug, admin, onSelect }: Omit<Props, 'notes'> & { note: NoteListItem }) {
  const active = note.id === currentId || note.slug === currentSlug;
  const className = `flex w-full items-start gap-2 border-l-2 px-3 py-2 text-left text-sm transition ${active
    ? 'border-real-accent bg-real-accent/10 text-real-accent'
    : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'}`;
  if (admin && note.id) {
    return <button type="button" onClick={() => onSelect?.(note.id!)} className={className}>
      <span className="min-w-0 flex-1 truncate">{note.title}</span>
      <span className="shrink-0 text-[9px] text-white/30">{note.status?.slice(0, 1)}</span>
    </button>;
  }
  return <a href={`/real/notes/${note.slug}/`} className={className}><span className="truncate">{note.title}</span></a>;
}

function DirectoryBranch({ node, ...props }: Omit<Props, 'notes'> & { node: DirectoryNode }) {
  return <details open={containsSelection(node, props.currentId, props.currentSlug)} className="group/directory">
    <summary className="flex cursor-pointer list-none items-center gap-2 px-2 py-2 text-sm font-bold text-white/75 hover:text-real-accent">
      <span className="text-[10px] text-real-accent transition group-open/directory:rotate-90">▶</span>
      <span className="min-w-0 flex-1 truncate">{directoryLabel(node.name)}</span>
      <span className="text-[10px] font-normal text-white/25">{directoryNoteCount(node)}</span>
    </summary>
    <div className="ml-3 border-l border-white/10 pl-1">
      {node.directories.map((child) => <DirectoryBranch key={child.path} node={child} {...props} />)}
      {node.notes.map((note) => <NoteLink key={note.id ?? note.slug} note={note} {...props} />)}
    </div>
  </details>;
}

/**
 * @description Renders the collapsible note hierarchy used by the administration panel.
 * @param props Flat note records, current selection, and optional administration callback.
 */
export default function NoteTree({ notes, ...props }: Props) {
  const root = buildNoteTree(notes);
  return <nav aria-label="Notes directory" className="space-y-1">
    {root.directories.map((directory) => <DirectoryBranch key={directory.path} node={directory} {...props} />)}
    {root.notes.map((note) => <NoteLink key={note.id ?? note.slug} note={note} {...props} />)}
  </nav>;
}
