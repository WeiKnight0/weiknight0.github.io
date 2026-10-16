import { siteApi } from '@/utils/site-api';
import { escapeHtml } from './html';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

const renderTags = (tags: string[]) => tags.map((tag) =>
  `<span class="project-tag">${escapeHtml(tag)}</span>`).join('');

const renderProject = (project: Project) =>
  `<a href="/projects/${encodeURIComponent(project.slug)}/" class="project-card"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p><div class="project-tags">${renderTags(project.tags)}</div><span class="project-card-link">View project ↗</span></a>`;

const list = document.querySelector<HTMLElement>('[data-project-list]');
if (!list) throw new Error('Project list is required');

siteApi<Project[]>('/projects')
  .then((projects) => {
    const limit = Number(list.dataset.projectLimit);
    list.innerHTML = projects.slice(0, Number.isFinite(limit) && limit > 0 ? limit : undefined).map(renderProject).join('');
    if (projects.length === 0) list.innerHTML = '<p class="project-empty">No projects published yet.</p>';
  })
  .catch(() => { list.innerHTML = '<p class="project-empty">Projects are temporarily unavailable.</p>'; });
