const notesSite = new URL(process.env.NOTES_SITE_URL || 'https://weiknight0.github.io/notes/');

if (!['https:', 'http:'].includes(notesSite.protocol) || notesSite.search || notesSite.hash || !notesSite.pathname.endsWith('/')) {
  throw new Error('NOTES_SITE_URL must be an HTTP(S) URL ending in / with no query or fragment');
}

export const notesHref = (path = '') => new URL(path.replace(/^\/+/, ''), notesSite).href;
