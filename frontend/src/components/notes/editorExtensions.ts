import Image from '@tiptap/extension-image';
import Mathematics from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

/**
 * @description Creates the shared schema used by both the note editor and read-only article renderer.
 */
export function createNoteExtensions() {
  return [
    StarterKit.configure({
      link: {
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      },
      heading: { levels: [1, 2, 3, 4] },
    }),
    Image.configure({
      allowBase64: false,
      resize: {
        enabled: true,
        directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        minWidth: 120,
        minHeight: 80,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Placeholder.configure({ placeholder: 'Write your note…' }),
    TableKit.configure({ table: { resizable: true } }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Markdown,
  ];
}
