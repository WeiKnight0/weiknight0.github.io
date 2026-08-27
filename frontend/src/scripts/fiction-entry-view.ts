import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { siteApi } from '@/utils/site-api';

interface FictionEntry {
  title: string;
  description: string;
  content: string;
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
  element<HTMLElement>('#fiction-entry-content').innerHTML = micromark(entry.content, {
    allowDangerousHtml: false,
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  document.title = `${entry.title} | WeiKnight`;
});
