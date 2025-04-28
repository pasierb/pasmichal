import { defineCollection, z } from "astro:content";
import { glob, file } from 'astro/loaders';


const postCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/post",
  }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		dateFormatted: z.string(),
    heroImage: z.string().optional(),
	}),
});

const appearanceCollection = defineCollection({
  loader: file('./src/collections/appearances.json'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    link: z.string(),
    date: z.string(),
    type: z.enum(['youtube']),
  }),
});

export const collections = {
	post: postCollection,
  appearance: appearanceCollection,
};
