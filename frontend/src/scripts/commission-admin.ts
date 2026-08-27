import { siteApi, SiteApiError } from '@/utils/site-api';
import { escapeHtml } from './html';

interface CommissionAsset {
  id: string;
  url: string;
  originalName: string;
  title: string;
  size: number;
  displayOrder: number;
}

const element = <T extends Element>(selector: string) => {
  const matched = document.querySelector<T>(selector);
  if (!matched) throw new Error(`Required commission editor element is missing: ${selector}`);
  return matched;
};
const form = element<HTMLFormElement>('#commission-upload');
const list = element<HTMLElement>('#commission-list');
const showNotice = (message: string, error = false) => {
  const notice = element<HTMLElement>('#commission-notice');
  notice.className = `mb-5 border px-4 py-3 text-sm ${error
    ? 'border-red-300/40 bg-red-300/10 text-red-100'
    : 'border-real-accent/40 bg-real-accent/10 text-real-accent'}`;
  notice.textContent = message;
};
const render = (assets: CommissionAsset[]) => {
  element<HTMLElement>('#commission-count').textContent = `${assets.length} work${assets.length === 1 ? '' : 's'}`;
  if (!assets.length) {
    list.innerHTML = '<p class="col-span-full border border-dashed border-white/15 p-8 text-center text-white/40">No uploaded works yet.</p>';
    return;
  }
  list.innerHTML = assets.map((asset) => `<article data-asset-id="${asset.id}" class="overflow-hidden border border-white/10 bg-real-surface"><a href="${asset.url}" target="_blank"><img src="${asset.url}" alt="${escapeHtml(asset.title)}" class="aspect-[4/3] w-full object-cover" /></a><div class="grid gap-3 p-4"><label class="grid gap-1"><span class="commission-label">Title</span><input data-asset-title maxlength="240" value="${escapeHtml(asset.title)}" class="commission-input" /></label><label class="grid gap-1"><span class="commission-label">Order</span><input data-asset-order type="number" min="0" value="${asset.displayOrder}" class="commission-input" /></label><p class="truncate text-xs text-white/35">${escapeHtml(asset.originalName)} · ${Math.ceil(asset.size / 1024)} KB</p><div class="flex gap-2"><button data-asset-save type="button" class="flex-1 border border-real-accent/40 px-3 py-2 text-sm font-bold text-real-accent">Save</button><button data-asset-delete type="button" class="border border-red-300/30 px-3 py-2 text-sm text-red-200">Delete</button></div></div></article>`).join('');
};
const load = async () => render(await siteApi<CommissionAsset[]>('/admin/fiction/commissions'));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  button.disabled = true;
  try {
    await siteApi('/admin/fiction/commissions', { method: 'POST', body: new FormData(form) });
    form.reset();
    (form.elements.namedItem('displayOrder') as HTMLInputElement).value = '1000';
    showNotice('Work uploaded.');
    await load();
  } catch (reason) {
    showNotice((reason as SiteApiError).message, true);
  } finally {
    button.disabled = false;
  }
});

list.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button');
  const card = button?.closest<HTMLElement>('[data-asset-id]');
  if (!button || !card?.dataset.assetId) return;
  try {
    if (button.hasAttribute('data-asset-save')) {
      await siteApi(`/admin/fiction/commissions/${card.dataset.assetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: (card.querySelector('[data-asset-title]') as HTMLInputElement).value.trim(),
          displayOrder: Number((card.querySelector('[data-asset-order]') as HTMLInputElement).value),
        }),
      });
      showNotice('Work updated.');
      await load();
      return;
    }
    if (!button.hasAttribute('data-asset-delete') || !window.confirm('Delete this uploaded work?')) return;
    await siteApi(`/admin/fiction/commissions/${card.dataset.assetId}`, { method: 'DELETE' });
    showNotice('Work deleted.');
    await load();
  } catch (reason) {
    showNotice((reason as SiteApiError).message, true);
  }
});

siteApi<{ role: string }>('/auth/me').then((account) => {
  if (account.role !== 'admin') throw new SiteApiError(403, 'Administrator access is required.');
  return load();
}).catch((reason: SiteApiError) => {
  if (reason.status === 403) location.replace('/login/');
  else showNotice(reason.message, true);
});
