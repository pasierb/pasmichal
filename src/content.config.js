import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postCollection = defineCollection({
	loader: glob({
		pattern: "**/*.md",
		base: "./src/content/post",
	}),
	// The function form is required by the image() helper, which resolves paths
	// relative to the markdown file and returns ImageMetadata.
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/** Shorter title for <title>/og:title when `title` overflows ~55 chars. */
			seoTitle: z.string().max(60).optional(),
			/**
			 * Visible lede rendered under the h1. Any length — clampDescription()
			 * trims it for <meta name="description">. Use seoDescription when the
			 * automatic cut reads badly.
			 */
			description: z.string(),
			seoDescription: z.string().min(120).max(165).optional(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			heroImageAlt: z.string().optional(),
			externalUrl: z.url().optional(),
			/** Publication brand for cross-posted stubs, e.g. "Practically Agents". */
			source: z.string().optional(),
			/** Canonical target when this post was first published elsewhere. */
			canonicalUrl: z.url().optional(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			noindex: z.boolean().default(false),
			toc: z.boolean().optional(),
		}),
});

const podcastCollection = defineCollection({
	loader: glob({
		pattern: "*.md",
		base: "./src/content/podcast",
	}),
	schema: z.object({
		title: z.string(),
		seoTitle: z.string().max(60).optional(),
		/** Required: these pages used to ship an empty <meta name="description">. */
		description: z.string().min(80),
		/** Show or host name. */
		author: z.string(),
		link: z.url(),
		pubDate: z.coerce.date(),
		type: z.enum(["youtube"]),
		/** ISO 8601 for VideoObject.duration, e.g. "PT48M12S". */
		duration: z.string().regex(/^PT/).optional(),
		/** BCP-47; drives <html lang>. */
		lang: z.string().default("en"),
	}),
});

export const collections = {
	post: postCollection,
	podcast: podcastCollection,
};
