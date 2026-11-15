import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeBase, publicPath } from './site.mjs';

test('Pages accepts both user and project site bases', () => {
  assert.equal(normalizeBase(''), '/');
  assert.equal(normalizeBase('/'), '/');
  assert.equal(normalizeBase('wkn-personal-site'), '/wkn-personal-site/');
  assert.equal(normalizeBase('/wkn-personal-site/'), '/wkn-personal-site/');
  assert.throws(() => normalizeBase('/../private/'));
  assert.throws(() => normalizeBase('https://example.com/'));
});

test('public paths preserve base and encode non-ASCII source names', () => {
  assert.equal(publicPath('/site/', 'notes/中文/图 1.png'), '/site/notes/%E4%B8%AD%E6%96%87/%E5%9B%BE%201.png');
});
