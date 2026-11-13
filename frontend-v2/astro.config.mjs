import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkOcNames from './src/utils/remark-oc-names.mjs';
import remarkEnv from './src/utils/remark-env.mjs';
import remarkSitePaths from './src/utils/remark-site-paths.mjs';
import { sitePath } from './src/utils/paths.mjs';

const base = sitePath('', process.env.SITE_BASE_PATH?.trim() || '/');

export default defineConfig({
  site: process.env.SITE_URL?.trim() || 'https://weiknight0.github.io',
  base,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkEnv, remarkMath, remarkOcNames, [remarkSitePaths, { base }]],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-light',
    },
  },
  integrations: [tailwind({})],
});
