const getBasePath = (base) => {
  const segments = base.split('/').filter(Boolean);
  return segments.length ? `/${segments.join('/')}/` : '/';
};
const configuredBase = () => import.meta.env ? import.meta.env.BASE_URL : '/';

/** Remove the deployment prefix before matching site routes. */
export const stripBasePath = (pathname, base = configuredBase()) => {
  const prefix = getBasePath(base);
  if (prefix === '/') return pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (pathname === prefix.slice(0, -1)) return '/';
  return pathname.startsWith(prefix) ? `/${pathname.slice(prefix.length)}` : pathname;
};

/** Prefix a site URL once, preserving files, queries, fragments and external URLs. */
export const sitePath = (pathname, base = configuredBase()) => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(pathname)) return pathname;
  const path = stripBasePath(pathname, base).replace(/^\/+/, '');
  return `${getBasePath(base)}${path}`;
};

/** Normalize a route for comparisons, independently of its deployment prefix. */
export const normalizePath = (pathname, base = configuredBase()) => {
  const path = stripBasePath(pathname.split(/[?#]/)[0] || '/', base);
  const leading = path.startsWith('/') ? path : `/${path}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
};
