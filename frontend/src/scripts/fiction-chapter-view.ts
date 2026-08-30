import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { siteApi } from '@/utils/site-api';

const path = location.pathname.split('/').filter(Boolean);
const novelPart = path[2];
const chapterPart = path[3];
if (path.length !== 4 || path[0] !== 'fiction' || path[1] !== 'novels' || !novelPart || !chapterPart) {
  throw new Error('Novel chapter URL is invalid.');
}
const novelSlug = decodeURIComponent(novelPart);
const chapterSlug = decodeURIComponent(chapterPart);
const element = <T extends Element>(selector: string) => { const matched = document.querySelector<T>(selector); if (!matched) throw new Error(`Missing ${selector}`); return matched; };
siteApi<{ novelTitle: string; title: string; content: string }>(`/fiction/novels/${encodeURIComponent(novelSlug)}/${encodeURIComponent(chapterSlug)}`).then((chapter) => {
  element<HTMLAnchorElement>('#chapter-back').href = `/fiction/novels/${encodeURIComponent(novelSlug)}/`;
  element<HTMLElement>('#chapter-novel').textContent = chapter.novelTitle;
  element<HTMLElement>('#chapter-title').textContent = chapter.title;
  element<HTMLElement>('#chapter-content').innerHTML = micromark(chapter.content, { allowDangerousHtml: false, extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  document.title = `${chapter.title} | WeiKnight`;
});
