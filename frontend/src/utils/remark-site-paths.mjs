import { sitePath } from './paths.mjs';

/** Apply the deployment prefix to Markdown links, images and raw HTML URLs. */
export default function remarkSitePaths({ base = '/' } = {}) {
  return (tree) => {
    const visit = (node) => {
      if (['link', 'image', 'definition'].includes(node.type) && node.url?.startsWith('/')) {
        node.url = sitePath(node.url, base);
      }
      if (node.type === 'html' && typeof node.value === 'string') {
        node.value = node.value.replace(
          /\b(href|src|poster)=(['"])(\/(?!\/)[^'"]*)\2/gi,
          (_match, attribute, quote, url) => `${attribute}=${quote}${sitePath(url, base)}${quote}`
        );
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
