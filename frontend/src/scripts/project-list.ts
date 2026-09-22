import { siteApi } from '@/utils/site-api';
import { escapeHtml } from './html';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

const renderTags = (tags: string[]) => tags.map((tag) =>
  `<span class="border border-real-accent/20 bg-black/30 px-3 py-1 text-xs font-real-mono font-bold uppercase tracking-wider text-real-accent/80">${escapeHtml(tag)}</span>`).join('');

const renderProject = (project: Project) =>
  `<a href="/real/projects/${encodeURIComponent(project.slug)}/" class="group relative overflow-hidden border border-white/10 bg-real-surface p-7 transition hover:border-real-accent/60 hover:bg-real-accent/5"><div class="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-real-accent transition-transform group-hover:scale-y-100"></div><h2 class="font-real-mono text-2xl font-black leading-tight text-real-text transition group-hover:text-real-accent">${escapeHtml(project.title)}</h2><p class="mt-4 text-base leading-7 text-real-text/75 font-real-sans">${escapeHtml(project.description)}</p><div class="mt-6 flex flex-wrap gap-2">${renderTags(project.tags)}</div></a>`;

const list = document.querySelector<HTMLElement>('[data-project-list]');
if (!list) throw new Error('Project list is required');

siteApi<Project[]>('/projects')
  .then((projects) => { list.innerHTML = projects.map(renderProject).join(''); })
  .catch(() => { list.innerHTML = '<p class="text-real-text/70 font-real-mono">Projects are temporarily unavailable.</p>'; });
