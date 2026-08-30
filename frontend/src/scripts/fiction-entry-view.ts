import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { siteApi } from '@/utils/site-api';
import { escapeHtml } from './html';

interface FictionEntry {
  title: string;
  description: string;
  content?: string;
  chapters?: { slug: string; title: string; displayOrder: number }[];
}

const root = document.querySelector<HTMLElement>('[data-fiction-entry-view]');
if (!root) throw new Error('Fiction entry shell is missing.');
const kind = root.dataset.kind;
const path = location.pathname.split('/').filter(Boolean);
const encodedSlug = path[2];
if (!kind || !encodedSlug || path.length !== 3 || path[0] !== 'fiction' || path[1] !== kind) {
  throw new Error('Fiction entry URL is invalid.');
}
const slug = decodeURIComponent(encodedSlug);
const element = <T extends Element>(selector: string) => {
  const matched = root.querySelector<T>(selector);
  if (!matched) throw new Error(`Required fiction entry element is missing: ${selector}`);
  return matched;
};

siteApi<FictionEntry>(`/fiction/${kind}/${encodeURIComponent(slug)}`).then((entry) => {
  element<HTMLElement>('#fiction-entry-title').textContent = entry.title;
  element<HTMLElement>('#fiction-entry-description').textContent = entry.description;
  const content = element<HTMLElement>('#fiction-entry-content');
  if (kind === 'novels') {
    content.innerHTML = entry.chapters?.length
      ? `<ol class="grid gap-3">${entry.chapters.map((chapter) => `<li><a class="text-fiction-accent hover:text-fiction-text" href="/fiction/novels/${encodeURIComponent(slug)}/${encodeURIComponent(chapter.slug)}/">${chapter.displayOrder}. ${escapeHtml(chapter.title)}</a></li>`).join('')}</ol>`
      : '<p>No chapters yet.</p>';
  } else {
    if (entry.content === undefined) throw new Error('Original-character content is missing.');
    content.innerHTML = micromark(entry.content, {
      allowDangerousHtml: false,
      extensions: [gfm()],
      htmlExtensions: [gfmHtml()],
    });
  }
  document.title = `${entry.title} | WeiKnight`;
});
