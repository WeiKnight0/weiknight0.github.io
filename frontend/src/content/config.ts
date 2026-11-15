import { defineCollection, z } from 'astro:content';

const orderedItem = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export const collections = {
  world: defineCollection({ schema: orderedItem }),
};
