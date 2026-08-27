import { siteApi } from '@/utils/site-api';

interface EntrySummary {
  slug: string;
  title: string;
  description: string;
}

document.querySelectorAll<HTMLElement>('[data-fiction-entry-list]').forEach(async (root) => {
  const kind = root.dataset.kind;
  if (!kind) throw new Error('Fiction list configuration is incomplete.');
  const entries = await siteApi<EntrySummary[]>(`/fiction/${kind}`);
  if (!entries.length) {
    const empty = document.createElement('p');
    empty.dataset.pageI18n = `${kind}.empty`;
    empty.textContent = document.documentElement.lang === 'zh-CN'
      ? root.dataset.emptyMessageZh || '暂时没有已发布的内容。'
      : root.dataset.emptyMessage || 'No published entries yet.';
    root.replaceChildren(empty);
    return;
  }
  root.replaceChildren(...entries.map((entry) => {
    const link = document.createElement('a');
    link.href = `/fiction/${kind}/${encodeURIComponent(entry.slug)}/`;
    link.className = 'group border border-fiction-accent/25 bg-fiction-surface/80 p-7 shadow-md transition hover:border-fiction-accent/60 hover:bg-fiction-accent/10';
    const title = document.createElement('h2');
    title.className = 'font-fiction-serif text-3xl font-black text-fiction-text transition group-hover:text-fiction-accent';
    title.textContent = entry.title;
    const description = document.createElement('p');
    description.className = 'mt-4 font-fiction-serif text-base leading-7 text-fiction-text/75';
    description.textContent = entry.description;
    link.append(title, description);
    return link;
  }));
});
