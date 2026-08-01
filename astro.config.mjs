// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},

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

	site: "https://www.pasmichal.com",
	// imageCDN defaults to true, which routes every image through Netlify's
	// runtime /.netlify/images endpoint instead of optimizing at build time.
	// This site is fully static, so keep the pre-optimized build output.
	adapter: netlify({ imageCDN: false }),
});
