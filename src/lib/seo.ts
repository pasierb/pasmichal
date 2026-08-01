import { SITE } from "../consts";

const ORIGIN = SITE.url.replace(/\/$/, "");

/**
 * The single place trailing-slash policy lives. MUST stay in sync with
 * `trailingSlash` in astro.config.mjs (which @astrojs/sitemap reads) and with
 * `trailingSlash` in src/pages/rss.xml.ts.
 *
 * Deliberately built off SITE.url and NOT Astro.site/Astro.url.origin, so a
 * Netlify deploy-preview hostname can never leak into a canonical tag.
 */
export function canonicalFor(pathname: string): string {
	const clean = pathname.replace(/\/+$/, "");
	return clean === "" ? `${ORIGIN}/` : `${ORIGIN}${clean}`;
}

/** Absolutise a site-relative path; pass through anything already absolute. */
export function toAbsolute(pathOrUrl: string): string {
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	return `${ORIGIN}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Google renders ~155-160 chars. Cut on a word boundary, never mid-word. */
export function clampDescription(text: string, max = 158): string {
	const flat = text.replace(/\s+/g, " ").trim();
	if (flat.length <= max) return flat;
	const cut = flat.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(" ");
	return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}
