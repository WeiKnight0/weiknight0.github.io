export function normalizeSiteBasePath(value = '/') {
  const base = String(value).trim();
  if (!base || base === '/') return '/';
  if (!base.startsWith('/') || base.startsWith('//') || /[?#\\]/.test(base)
      || base.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('SITE_BASE_PATH must be / or a root-relative path such as /repo/');
  }
  return `/${normalizePath(base)}/`;
}

function normalizePath(path) {
  const segments = [];
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  return segments.join('/');
}

function encodePath(path) {
  return path.split('/').map((segment) => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  }).join('/');
}

function noteRoute(path) {
  const route = path.replace(/\.(md|mdx)$/i, '').replace(/(^|\/)index$/i, '');
  return route ? `${route}/` : '';
}

export function visit(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) node.children.forEach((child) => visit(child, visitor));
}

/** note-path is relative to notes/docs; the history fallback also supports older callers. */
export function sourcePathFor(file, sourcePath) {
  if (typeof sourcePath === 'string') return sourcePath.replace(/\\/g, '/');
  const filename = (file?.history?.[0] ?? file?.path ?? '').replace(/\\/g, '/');
  for (const marker of ['/notes/content/', '/notes/docs/']) {
    const index = filename.indexOf(marker);
    if (index !== -1) return filename.slice(index + marker.length);
  }
  return '';
}

/** Shared by Markdown and raw HTML, preserving the entire query/hash suffix verbatim. */
export function createNoteUrlRewriter({ siteBasePath = '/', sourcePath = '' } = {}) {
  const base = normalizeSiteBasePath(siteBasePath);
  const source = sourcePath.replace(/\\/g, '/');
  const sourceDirectory = source.includes('/') ? source.slice(0, source.lastIndexOf('/')) : '';

  return (value, { asset = false } = {}) => {
    if (typeof value !== 'string' || !value || /^[a-z][a-z0-9+.-]*:/i.test(value)
        || /^(?:#|\?|\/\/)/.test(value)) return value;

    const suffixIndex = value.search(/[?#]/);
    const rawPath = suffixIndex === -1 ? value : value.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? '' : value.slice(suffixIndex);

    if (rawPath.startsWith('/')) {
      // Root-absolute paths refer to the site; already-prefixed paths stay prefixed once.
      const sitePath = base !== '/' && rawPath.startsWith(base)
        ? rawPath.slice(base.length) : rawPath.slice(1);
      const resolved = normalizePath(sitePath);
      if (!asset && /^notes\//.test(resolved) && /\.(md|mdx)$/i.test(resolved)) {
        return `${base}notes/${encodePath(noteRoute(resolved.slice(6)))}${suffix}`;
      }
      const trailingSlash = rawPath.endsWith('/') && resolved ? '/' : '';
      return `${base}${encodePath(resolved)}${trailingSlash}${suffix}`;
    }

    const resolved = normalizePath(`${sourceDirectory}/${rawPath}`);
    const markdown = /\.(md|mdx)$/i.test(rawPath);
    const fileExtension = /\.[^/.]+$/.test(rawPath);
    const destination = !asset && (markdown || !fileExtension) ? noteRoute(resolved) : resolved;
    return `${base}notes/${encodePath(destination)}${suffix}`;
  };
}

/** Rewrite Markdown links, images and reference definitions without fetching a route index. */
export default function remarkNoteLinks(options = {}) {
  return (tree, file) => {
    const rewrite = createNoteUrlRewriter({
      ...options,
      sourcePath: sourcePathFor(file, options.sourcePath),
    });
    const imageReferences = new Set();
    const linkReferences = new Set();
    visit(tree, (node) => {
      if (node.type === 'imageReference') imageReferences.add(node.identifier);
      if (node.type === 'linkReference') linkReferences.add(node.identifier);
    });
    visit(tree, (node) => {
      if (node.type === 'link' || node.type === 'definition' || node.type === 'image') {
        const imageDefinition = node.type === 'definition' && imageReferences.has(node.identifier)
          && !linkReferences.has(node.identifier);
        node.url = rewrite(node.url, { asset: node.type === 'image' || imageDefinition });
      }
    });
  };
}
