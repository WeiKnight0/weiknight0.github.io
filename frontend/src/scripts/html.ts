/**
 * @description Escapes plain text before inserting it into a generated HTML fragment.
 * @param value Untrusted API or user-provided value.
 */
export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] as string);
}
