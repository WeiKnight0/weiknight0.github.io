import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkCodeLanguageMarker from './src/utils/remark-code-language-marker.mjs';
import remarkOcNames from './src/utils/remark-oc-names.mjs';
import remarkEnv from './src/utils/remark-env.mjs';

// https://astro.build/config
export default defineConfig({
  // base: '.', // Set a path prefix.
  // Set SITE_URL to the public domain when building for production.
  site: process.env.SITE_URL ?? 'http://localhost:4321/',
  trailingSlash: 'ignore', // Allow both slash and non-slash URLs
  server: {
    // In local development Astro serves the static site and forwards API calls
    // to Spring Boot, so the browser always uses the same /api origin.
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkEnv, remarkMath, remarkOcNames, remarkCodeLanguageMarker],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'github-light',
    },
  },
  integrations: [react(), tailwind({}), sitemap(), robotsTxt()],
});
