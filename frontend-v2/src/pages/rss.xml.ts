import rss from '@astrojs/rss';

import { AppConfig } from '@/utils/AppConfig';

/**
 * @description Generates the public RSS document from static Markdown pages.
 */
export const get = () =>
  rss({
    title: AppConfig.title,
    description: AppConfig.description,
    site: import.meta.env.SITE,
    items: import.meta.glob('./**/*.md'),
    customData: `<language>en-us</language>`,
  });
