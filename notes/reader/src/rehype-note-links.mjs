import { createNoteUrlRewriter, sourcePathFor, visit } from './remark-note-links.mjs';

/** Run after rehype-raw so links embedded in HTML use the same source-relative rules. */
export default function rehypeNoteLinks(options = {}) {
  return (tree, file) => {
    const rewrite = createNoteUrlRewriter({
      ...options,
      sourcePath: sourcePathFor(file, options.sourcePath),
    });
    visit(tree, (node) => {
      if (node.type !== 'element' || !node.properties) return;
      if (typeof node.properties.href === 'string') {
        node.properties.href = rewrite(node.properties.href, {
          asset: node.tagName !== 'a' && node.tagName !== 'area',
        });
      }
      for (const property of ['src', 'poster']) {
        if (typeof node.properties[property] === 'string') {
          node.properties[property] = rewrite(node.properties[property], { asset: true });
        }
      }
    });
  };
}
