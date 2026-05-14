import tailwind from "@astrojs/tailwind";
// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import remarkToc from "remark-toc";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind()],

	experimental: {
		fonts: [
			{
				provider: fontProviders.google(),
				name: "Source Serif 4",
				cssVariable: "--font-serif",
				weights: ["400", "600", "700"],
			},
			{
				provider: fontProviders.google(),
				name: "Inter Tight",
				cssVariable: "--font-sans",
				weights: ["400", "500", "600"],
			},
		],
	},

	markdown: {
		remarkPlugins: [[remarkToc, { heading: "On this page", maxDepth: 3 }]],
	},

	site: "https://www.pasmichal.com",
	adapter: netlify(),
});
