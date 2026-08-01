import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../consts";
import { clampDescription } from "../lib/seo";

export async function GET(context: APIContext) {
	const posts = (await getCollection("post", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);

	return rss({
		title: `${SITE.name} — Writing`,
		description: SITE.description,
		site: context.site ?? SITE.url,
		// Matches `trailingSlash: "never"` in astro.config.mjs.
		trailingSlash: false,
		customData: [
			"<language>en-us</language>",
			`<managingEditor>${SITE.email} (${SITE.name})</managingEditor>`,
			`<webMaster>${SITE.email} (${SITE.name})</webMaster>`,
			`<copyright>© ${new Date().getFullYear()} ${SITE.name}</copyright>`,
		].join(""),
		items: posts.map((post) => ({
			// Tell subscribers up front when an item lives on another site.
			title: post.data.source
				? `${post.data.title} (${post.data.source})`
				: post.data.title,
			// @astrojs/rss passes absolute links through untouched, so the
			// cross-posted stubs keep pointing at the real article — and those
			// URLs become stable GUIDs.
			link: post.data.externalUrl ?? `/post/${post.id}`,
			pubDate: post.data.pubDate,
			description: clampDescription(
				post.data.seoDescription ?? post.data.description,
				400,
			),
			categories: post.data.externalUrl
				? [...post.data.tags, "Elsewhere"]
				: post.data.tags,
			author: `${SITE.email} (${SITE.name})`,
		})),
	});
}
