import { getCollection } from "astro:content";
import { projects } from "../collections/projects";
import { SITE } from "../consts";
import { canonicalFor, clampDescription } from "../lib/seo";

/**
 * https://llmstxt.org/ — an H1, a blockquote summary, optional prose, then H2
 * sections of `[name](url): notes` link lists.
 *
 * Generated from the content collections rather than hand-maintained, so it
 * cannot drift from the site the way a checked-in public/llms.txt would.
 */

/** Titles are plain text; brackets would otherwise break the link syntax. */
function escapeLinkText(text: string): string {
	return text.replace(/([[\]])/g, "\\$1");
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function link(name: string, url: string, notes: string[]): string {
	const suffix = notes.filter(Boolean).join(". ");
	return `- [${escapeLinkText(name)}](${url})${suffix ? `: ${suffix}` : ""}`;
}

/**
 * /resume and /404 are the NOINDEX set in astro.config.mjs; keep them out here
 * too. Everything else in src/pages is either listed below or a detail page
 * already covered by the collection sections.
 */
const PAGES: Array<[path: string, notes: string]> = [
	["/", "Homepage: bio, featured writing and projects"],
	["/about", "Background, career history and how to get in touch"],
	["/services", "Consulting: AI engineering and shipping-velocity work"],
	["/posts", "Full writing archive, grouped by year"],
	["/podcasts", "Podcast and conference appearances"],
	["/projects", "Products built and shipped"],
];

export async function GET() {
	const posts = (
		await getCollection("post", ({ data }) => !data.draft && !data.noindex)
	).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

	const podcasts = (await getCollection("podcast")).sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);

	const sections = [
		`# ${SITE.name}`,
		`> ${clampDescription(SITE.description, 400)}`,
		`${SITE.jobTitle} at ${SITE.employer.name} (${SITE.employer.url}), based in Zurich. Contact: ${SITE.email}.`,

		"## Writing",
		posts
			.map((post) =>
				link(
					post.data.title,
					// Cross-posted stubs have no page here — link where the text lives.
					post.data.externalUrl ?? canonicalFor(`/post/${post.id}`),
					[
						isoDate(post.data.pubDate),
						post.data.externalUrl
							? `published on ${post.data.source ?? "another site"}`
							: "",
						clampDescription(
							post.data.seoDescription ?? post.data.description,
							200,
						),
					],
				),
			)
			.join("\n"),

		"## Podcasts",
		podcasts
			.map((podcast) =>
				link(podcast.data.title, canonicalFor(`/podcast/${podcast.id}`), [
					isoDate(podcast.data.pubDate),
					podcast.data.author,
					clampDescription(podcast.data.description, 200),
				]),
			)
			.join("\n"),

		"## Projects",
		projects
			.map((project) =>
				link(project.name, project.url, [
					project.status,
					clampDescription(project.description, 200),
				]),
			)
			.join("\n"),

		"## Pages",
		PAGES.map(([path, notes]) =>
			link(
				path === "/"
					? SITE.name
					: path.slice(1).replace(/^./, (c) => c.toUpperCase()),
				canonicalFor(path),
				[notes],
			),
		).join("\n"),

		"## Optional",
		[
			link("RSS feed", canonicalFor("/rss.xml"), [
				"Every post, newest first, including cross-posted ones",
			]),
			link("Sitemap", canonicalFor("/sitemap-index.xml"), [
				"All indexable pages",
			]),
		].join("\n"),
	];

	return new Response(`${sections.join("\n\n")}\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
