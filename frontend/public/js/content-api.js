const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character]));

const tags = (items) => items.map((tag) => `<span class="border border-real-accent/20 bg-black/30 px-3 py-1 text-xs font-real-mono font-bold uppercase tracking-wider text-real-accent/80">${escapeHtml(tag)}</span>`).join('');
const card = (href, heading, description, meta, tagList) => `<a href="${href}" class="group relative overflow-hidden border border-white/10 bg-real-surface p-7 transition hover:border-real-accent/60 hover:bg-real-accent/5"><div class="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-real-accent transition-transform group-hover:scale-y-100"></div>${meta ? `<p class="font-real-mono text-sm font-bold text-real-accent">${meta}</p>` : ''}<h2 class="${meta ? 'mt-3 ' : ''}font-real-mono text-2xl font-black leading-tight text-real-text transition group-hover:text-real-accent">${escapeHtml(heading)}</h2><p class="mt-4 text-base leading-7 text-real-text/75 font-real-sans">${escapeHtml(description)}</p><div class="mt-6 flex flex-wrap gap-2">${tags(tagList)}</div></a>`;

document.querySelectorAll('[data-content-api]').forEach(async (element) => {
  const type = element.dataset.contentApi;
  try {
    const response = await fetch(`/api/v1/${type}`);
    if (!response.ok) throw new Error('Request failed');
    const items = await response.json();
    element.innerHTML = items.map((item) => type === 'projects'
      ? card(`/real/projects/${encodeURIComponent(item.slug)}/`, item.title, item.description, '', item.tags)
      : card(`/real/blog/${encodeURIComponent(item.slug)}/`, item.title, item.description, new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.publishedAt)), item.tags)
    ).join('');
  } catch {
    element.innerHTML = '<p class="text-real-text/70 font-real-mono">Content is temporarily unavailable.</p>';
  }
});
