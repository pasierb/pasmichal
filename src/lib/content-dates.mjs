/**
 * Build-time route -> ISO lastmod map, read straight off markdown frontmatter.
 *
 * astro.config.mjs cannot import `astro:content`, and @astrojs/sitemap's
 * serialize() hook has no content access either, so the dates come from here.
 * Plain .mjs so the Astro config loader needs no transform. Keep the field
 * names in sync with src/content.config.js.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function field(frontmatter, name) {
	const match = frontmatter.match(
		new RegExp(`^${name}:\\s*"?([^"\\n]+?)"?\\s*$`, "m"),
	);
	return match ? match[1].trim() : undefined;
}

function collect(dir, prefix, out) {
	for (const file of readdirSync(dir)) {
		if (!file.endsWith(".md")) continue;
		const frontmatter =
			readFileSync(join(dir, file), "utf8").split(/^---\s*$/m)[1] ?? "";
		// Stubs have no page of their own; drafts and noindex pages stay out.
		if (field(frontmatter, "externalUrl")) continue;
		if (
			field(frontmatter, "draft") === "true" ||
			field(frontmatter, "noindex") === "true"
		) {
			continue;
		}
		const date =
			field(frontmatter, "updatedDate") ?? field(frontmatter, "pubDate");
		if (!date) continue;
		out[`${prefix}/${file.replace(/\.md$/, "")}`] = new Date(
			date,
		).toISOString();
	}
}

/** @type {Record<string, string>} */
export const lastmodByPath = {};
collect("src/content/post", "/post", lastmodByPath);
collect("src/content/podcast", "/podcast", lastmodByPath);

const newestUnder = (prefix) =>
	Object.entries(lastmodByPath)
		.filter(([path]) => path.startsWith(prefix))
		.map(([, iso]) => iso)
		.sort()
		.pop();

// Index pages inherit their newest child's date. /about, /projects and
// /services get NO lastmod on purpose: a sitemap where every lastmod equals
// build time is a signal search engines learn to distrust.
lastmodByPath["/"] = newestUnder("/post");
lastmodByPath["/posts"] = newestUnder("/post");
lastmodByPath["/podcasts"] = newestUnder("/podcast");
