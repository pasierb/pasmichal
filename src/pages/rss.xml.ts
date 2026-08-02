import { getCollection, render } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { SITE } from "../consts";
import { clampDescription, toAbsolute } from "../lib/seo";

/**
 * Feed readers and post importers resolve nothing themselves, so every URL in
 * the body has to be absolute. Astro emits build-time image URLs as
 * /_astro/… paths, which would 404 anywhere but this origin.
 *
 * Deliberately regex rather than a DOM parser: the only relative URLs Sätteri
 * can emit are `src`, `href` and `srcset`, and adding a parser dependency to
 * rewrite three attributes is not worth it. Protocol-relative `//host/…` is
 * excluded, since it is already absolute.
 */
function absolutiseUrls(html: string): string {
	return html
		.replace(
			/\s(src|href)="(\/(?!\/)[^"]*)"/g,
			(_match, attr, path) => ` ${attr}="${toAbsolute(path)}"`,
		)
		.replace(/\ssrcset="([^"]*)"/g, (_match, srcset: string) => {
			const rewritten = srcset
				.split(",")
				.map((candidate) => {
					const [url, ...descriptors] = candidate.trim().split(/\s+/);
					return [toAbsolute(url), ...descriptors].join(" ");
				})
				.join(", ");
			return ` srcset="${rewritten}"`;
		});
}

/**
 * Embeds in a couple of posts pull in third-party widget loaders. Feed
 * validators flag inline script, and every reader and importer strips it
 * anyway — dropping it here keeps the payload honest about what will render.
 */
function stripScripts(html: string): string {
	return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

export async function GET(context: APIContext) {
	const posts = (await getCollection("post", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);

	// One container renders every post. Creating it per item would rebuild
	// Astro's whole renderer 22 times for no benefit.
	const container = await AstroContainer.create();

	const items = await Promise.all(
		posts.map(async (post) => {
			// Cross-posted stubs have an empty body — the article lives on the
			// other site, so there is nothing local to inline.
			const content = post.data.externalUrl
				? undefined
				: absolutiseUrls(
						stripScripts(
							await container.renderToString((await render(post)).Content),
						),
					);

			return {
				// Tell subscribers up front when an item lives on another site.
				// Keyed off externalUrl, not source: an imported post also names a
				// source, but its body is inlined below and its link is local, so
				// the suffix would only mislead.
				title:
					post.data.externalUrl && post.data.source
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
				content,
				categories: post.data.externalUrl
					? [...post.data.tags, "Elsewhere"]
					: post.data.tags,
				author: `${SITE.email} (${SITE.name})`,
			};
		}),
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
		items,
	});
}
