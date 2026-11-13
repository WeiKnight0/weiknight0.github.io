import { defineConfig } from 'vite';
import { normalizeSiteBasePath } from './src/remark-note-links.mjs';

const siteBasePath = normalizeSiteBasePath(process.env.SITE_BASE_PATH);

export default defineConfig({
  base: `${siteBasePath}notes-reader/`,
  define: {
    'import.meta.env.SITE_BASE_PATH': JSON.stringify(siteBasePath),
  },
  // Vite only rewrites asset URLs to BASE_URL; navigation uses the site base.
  plugins: [{
    name: 'notes-site-base',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_BASE_PATH%', siteBasePath),
    },
  }],
});
