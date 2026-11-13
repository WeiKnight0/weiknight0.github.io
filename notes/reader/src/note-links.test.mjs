import assert from 'node:assert/strict';
import test from 'node:test';
import remarkNoteLinks, { createNoteUrlRewriter, normalizeSiteBasePath } from './remark-note-links.mjs';
import rehypeNoteLinks from './rehype-note-links.mjs';

for (const base of ['/', '/repo/']) {
  test(`source-relative notes, indexes and suffixes (${base})`, () => {
    const rewrite = createNoteUrlRewriter({ siteBasePath: base, sourcePath: 'AI/models/transformer.md' });
    const cases = [
      ['../index.md', `${base}notes/AI/`],
      ['../../index.md', `${base}notes/`],
      ['./index.mdx?lang=zh#目录', `${base}notes/AI/models/?lang=zh#目录`],
      ['../learning/basics.md?x=1&y=2#part?raw', `${base}notes/AI/learning/basics/?x=1&y=2#part?raw`],
      ['../learning/?view=wide#top', `${base}notes/AI/learning/?view=wide#top`],
      ['../learning', `${base}notes/AI/learning/`],
      ['../../../index.md', `${base}notes/`],
      ['../../Chinese 笔记/Intro.md#标题', `${base}notes/Chinese%20%E7%AC%94%E8%AE%B0/Intro/#标题`],
      ['../../Chinese%20%E7%AC%94%E8%AE%B0/Intro.md', `${base}notes/Chinese%20%E7%AC%94%E8%AE%B0/Intro/`],
    ];
    for (const [input, expected] of cases) assert.equal(rewrite(input), expected, input);
  });

  test(`images and other copied assets keep original paths (${base})`, () => {
    const rewrite = createNoteUrlRewriter({ siteBasePath: base, sourcePath: 'AI/models/index.md' });
    assert.equal(rewrite('../assets/diagram.svg?v=2#view'), `${base}notes/AI/assets/diagram.svg?v=2#view`);
    assert.equal(rewrite('../files/paper.pdf?download=1#page=2'), `${base}notes/AI/files/paper.pdf?download=1#page=2`);
    assert.equal(rewrite('images/diagram', { asset: true }), `${base}notes/AI/models/images/diagram`);
    assert.equal(rewrite('/notes/assets/plot.png?x=1#layer', { asset: true }), `${base}notes/assets/plot.png?x=1#layer`);
  });

  test(`root-absolute navigation is base-prefixed exactly once (${base})`, () => {
    const rewrite = createNoteUrlRewriter({ siteBasePath: base, sourcePath: 'index.md' });
    assert.equal(rewrite('/notes/algorithm-templates/?q=1#top'), `${base}notes/algorithm-templates/?q=1#top`);
    assert.equal(rewrite('/notes/AI/index.md?x=1#top'), `${base}notes/AI/?x=1#top`);
    assert.equal(rewrite('/notes/index.md'), `${base}notes/`);
    assert.equal(rewrite('/about-me/'), `${base}about-me/`);
    assert.equal(rewrite('/favicon.ico'), `${base}favicon.ico`);
    assert.equal(rewrite('/'), base);
    assert.equal(rewrite(`${base}notes/AI/?q=1#top`), `${base}notes/AI/?q=1#top`);
    assert.equal(rewrite(`${base}notes/AI/intro.md#top`), `${base}notes/AI/intro/#top`);
  });

  test(`external, protocol-relative, query-only and fragment-only URLs stay intact (${base})`, () => {
    const rewrite = createNoteUrlRewriter({ siteBasePath: base, sourcePath: 'AI/index.md' });
    for (const value of [
      'https://example.com/a.md?q=1#top', '//cdn.example.com/image.png?q=1#layer',
      'mailto:me@example.com', 'tel:+1234', 'data:image/png;base64,AA==',
      '#heading?detail', '?view=wide#top', '',
    ]) assert.equal(rewrite(value), value);
  });

  test(`Markdown AST handles links, images and definitions (${base})`, () => {
    const tree = { type: 'root', children: [
      { type: 'link', url: './index.md?x=1#top' },
      { type: 'image', url: '../assets/image.png?x=1#layer' },
      { type: 'definition', identifier: 'note', url: '../intro.md?x=1#top' },
      { type: 'definition', identifier: 'image', url: './image-no-extension' },
      { type: 'imageReference', identifier: 'image' },
    ] };
    remarkNoteLinks({ siteBasePath: base, sourcePath: 'AI/models/index.md' })(tree);
    assert.equal(tree.children[0].url, `${base}notes/AI/models/?x=1#top`);
    assert.equal(tree.children[1].url, `${base}notes/AI/assets/image.png?x=1#layer`);
    assert.equal(tree.children[2].url, `${base}notes/AI/intro/?x=1#top`);
    assert.equal(tree.children[3].url, `${base}notes/AI/models/image-no-extension`);
  });

  test(`raw HTML href/src/poster share the rewrite and are idempotent (${base})`, () => {
    const tree = { type: 'root', children: [
      { type: 'element', tagName: 'a', properties: { href: '../index.md?q=1&x=2#top' } },
      { type: 'element', tagName: 'img', properties: { src: '../assets/plot?size=2#layer' } },
      { type: 'element', tagName: 'a', properties: { href: '//example.com/a.md?x=1#top' } },
      { type: 'element', tagName: 'video', properties: { src: 'clip.mp4', poster: '/notes/assets/poster.png' } },
      { type: 'element', tagName: 'use', properties: { href: '#icon' } },
    ] };
    const transform = rehypeNoteLinks({ siteBasePath: base, sourcePath: 'AI/models/intro.md' });
    transform(tree);
    assert.equal(tree.children[0].properties.href, `${base}notes/AI/?q=1&x=2#top`);
    assert.equal(tree.children[1].properties.src, `${base}notes/AI/assets/plot?size=2#layer`);
    assert.equal(tree.children[2].properties.href, '//example.com/a.md?x=1#top');
    assert.equal(tree.children[3].properties.src, `${base}notes/AI/models/clip.mp4`);
    assert.equal(tree.children[3].properties.poster, `${base}notes/assets/poster.png`);
    assert.equal(tree.children[4].properties.href, '#icon');
    const once = structuredClone(tree);
    transform(tree);
    assert.deepEqual(tree, once);
  });
}

test('root index and both source-path history conventions are compatible', () => {
  assert.equal(createNoteUrlRewriter({ sourcePath: 'index.md' })('./index.md'), '/notes/');
  for (const folder of ['content', 'docs']) {
    const tree = { type: 'link', url: './intro.md' };
    remarkNoteLinks({ siteBasePath: '/repo/' })(tree, {
      history: [`D:\\workspace\\notes\\${folder}\\AI\\index.md`],
    });
    assert.equal(tree.url, '/repo/notes/AI/intro/');
  }
});

test('site base defaults, normalization and invalid inputs', () => {
  assert.equal(normalizeSiteBasePath(), '/');
  assert.equal(normalizeSiteBasePath(''), '/');
  assert.equal(normalizeSiteBasePath('/repo'), '/repo/');
  assert.equal(normalizeSiteBasePath('/repo/'), '/repo/');
  for (const value of ['repo', '//example.com/', 'https://example.com/', '/repo/?q=1', '/repo/#x', '/repo/../', '/repo\\']) {
    assert.throws(() => normalizeSiteBasePath(value), /SITE_BASE_PATH/);
  }
});
