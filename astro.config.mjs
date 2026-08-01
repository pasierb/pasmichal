// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { lastmodByPath } from "./src/lib/content-dates.mjs";

import netlify from "@astrojs/netlify";

/** Real pages that should not be indexed, so they stay out of the sitemap too. */
const NOINDEX = new Set(["/resume", "/404"]);

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [
		sitemap({
			filter: (page) => {
				// filter() receives the full URL, not just the pathname.
				const { pathname } = new URL(page);
				// rss.xml and sitemap*.xml are emitted as routes and would
				// otherwise be listed as indexable pages.
				if (/\.(xml|json|txt|pdf)$/.test(pathname)) return false;
				return !NOINDEX.has(pathname.replace(/\/+$/, "") || "/");
			},
			serialize(item) {
				const path = new URL(item.url).pathname.replace(/\/+$/, "") || "/";
				const lastmod = lastmodByPath[path];
				// No changefreq and no priority on purpose: Google ignores both,
				// and unmaintained values are pure noise. Bing still reads lastmod.
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],

	fonts: [
		{
			provider: fontProviders.google(),
			name: "Source Serif 4",
			cssVariable: "--font-serif-family",
			weights: ["400", "600", "700"],
		},
		{
			provider: fontProviders.google(),
			name: "Inter Tight",
			cssVariable: "--font-sans-family",
			weights: ["400", "500", "600"],
		},
	],

	// layout: "constrained" makes Astro derive width/height from the source
	// aspect ratio and auto-fill widths/sizes, which is what takes CLS to zero.
	// responsiveStyles ships the small global stylesheet those images need.
	// The narrowed breakpoints keep it to ~4 variants per image instead of 7.
	image: {
		responsiveStyles: true,
		layout: "constrained",
		objectFit: "cover",
		objectPosition: "center",
		breakpoints: [640, 768, 1024, 1344],
	},

	site: "https://www.pasmichal.com",
	// Every internal href in the codebase is already slash-less, so "never"
	// means zero internal redirect hops. @astrojs/sitemap reads this knob
	// directly; keep canonicalFor() in src/lib/seo.ts in sync with it.
	trailingSlash: "never",
	// imageCDN defaults to true, which routes every image through Netlify's
	// runtime /.netlify/images endpoint instead of optimizing at build time.
	// This site is fully static, so keep the pre-optimized build output.
	adapter: netlify({ imageCDN: false }),
});
