import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkCjkFriendly from 'remark-cjk-friendly/parseOnly';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import remarkCodeLanguageMarker from './remark-code-language-marker.mjs';
import remarkEnv from './remark-env.mjs';
import remarkNoteLinks from './remark-note-links.mjs';
import rehypeNoteLinks from './rehype-note-links.mjs';

/** Shared with static verification; markdown is the body after front matter. */
export async function renderMarkdown(sourcePath, markdown, siteBasePath = '/') {
  const options = { sourcePath, siteBasePath };
  return String(await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCjkFriendly)
    .use(remarkEnv)
    .use(remarkMath)
    .use(remarkNoteLinks, options)
    .use(remarkCodeLanguageMarker)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeNoteLinks, options)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process({ path: `/notes/content/${sourcePath}`, value: markdown }));
}
