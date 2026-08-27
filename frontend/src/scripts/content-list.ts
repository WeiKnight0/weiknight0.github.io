import { siteApi } from '@/utils/site-api';
import { escapeHtml } from './html';

interface ContentItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt?: string;
}

const renderTags = (items: string[]) => items.map((tag) =>
  `<span class="border border-real-accent/20 bg-black/30 px-3 py-1 text-xs font-real-mono font-bold uppercase tracking-wider text-real-accent/80">${escapeHtml(tag)}</span>`).join('');
const renderCard = (href: string, item: ContentItem, meta: string) =>
  `<a href="${href}" class="group relative overflow-hidden border border-white/10 bg-real-surface p-7 transition hover:border-real-accent/60 hover:bg-real-accent/5"><div class="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-real-accent transition-transform group-hover:scale-y-100"></div>${meta ? `<p class="font-real-mono text-sm font-bold text-real-accent">${meta}</p>` : ''}<h2 class="${meta ? 'mt-3 ' : ''}font-real-mono text-2xl font-black leading-tight text-real-text transition group-hover:text-real-accent">${escapeHtml(item.title)}</h2><p class="mt-4 text-base leading-7 text-real-text/75 font-real-sans">${escapeHtml(item.description)}</p><div class="mt-6 flex flex-wrap gap-2">${renderTags(item.tags)}</div></a>`;

document.querySelectorAll<HTMLElement>('[data-content-api]').forEach(async (element) => {
  const type = element.dataset.contentApi;
  if (type !== 'posts' && type !== 'projects') throw new Error(`Unsupported content type: ${type}`);
  try {
    element.innerHTML = (await siteApi<ContentItem[]>(`/${type}`)).map((item) => {
      const href = `/real/${type === 'posts' ? 'blog' : 'projects'}/${encodeURIComponent(item.slug)}/`;
      const meta = type === 'posts' && item.publishedAt
        ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.publishedAt))
        : '';
      return renderCard(href, item, meta);
    }).join('');
  } catch {
    element.innerHTML = '<p class="text-real-text/70 font-real-mono">Content is temporarily unavailable.</p>';
  }
});
