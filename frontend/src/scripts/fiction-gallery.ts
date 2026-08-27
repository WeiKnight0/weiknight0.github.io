import { siteApi } from '@/utils/site-api';

interface CommissionAsset {
  url: string;
  title: string;
}

const gallery = document.querySelector<HTMLElement>('[data-fiction-gallery]');
if (!gallery) throw new Error('Commission gallery root is missing.');

siteApi<CommissionAsset[]>('/fiction/commissions').then((assets) => {
  if (!assets.length) {
    gallery.textContent = 'No commission images have been published yet.';
    return;
  }
  gallery.className = 'mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3';
  gallery.replaceChildren(...assets.map((asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.target = '_blank';
    link.className = 'mb-5 block break-inside-avoid overflow-hidden border border-fiction-accent/30 bg-fiction-surface/80 transition hover:border-fiction-accent/70';
    const image = document.createElement('img');
    image.src = asset.url;
    image.alt = asset.title;
    image.loading = 'lazy';
    image.className = 'w-full object-cover transition duration-500 hover:scale-[1.02]';
    const title = document.createElement('div');
    title.className = 'px-5 py-4 font-real-mono text-sm font-bold text-fiction-text/75';
    title.textContent = asset.title;
    link.append(image, title);
    return link;
  }));
}).catch(() => {
  gallery.textContent = 'Commission gallery is temporarily unavailable.';
});
