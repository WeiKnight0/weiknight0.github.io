import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

/**
 * @description Exposes legacy Markdown bodies while database posts are migrated lazily.
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .map((post) => ({ slug: post.slug, content: post.body }));

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
