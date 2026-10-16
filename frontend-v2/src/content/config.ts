import { defineCollection, z } from 'astro:content';

const orderedItem = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export const collections = {
  projects: defineCollection({
    schema: orderedItem.extend({
      tags: z.array(z.string()).default([]),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
    }),
  }),
  world: defineCollection({ schema: orderedItem }),
  ocs: defineCollection({ schema: orderedItem.extend({ draft: z.boolean().default(false) }) }),
};
