/**
 * Single source of truth for brand strings used across metadata, structured
 * data, and the RSS feed. Keep `url` in sync with `site` in astro.config.mjs.
 */
export const SITE = {
	/** No trailing slash. */
	url: "https://www.pasmichal.com",
	name: "Michał Pasierbski",
	/** ASCII spelling, so schema.org keeps the diacritic-free form discoverable. */
	alternateName: "Michal Pasierbski",
	email: "mpasierbski@gmail.com",
	twitterHandle: "@pasmichal_",
	jobTitle: "Staff Software Engineer, Engineering Lead",
	employer: { name: "Delta Labs AG", url: "https://delta-labs.ch" },
	locale: "en_US",
	/**
	 * Social card dimensions. 1.91:1 is what the scrapers want, and JPEG is the
	 * only universally safe OG format — LinkedIn and several chat unfurlers
	 * still refuse to render WebP.
	 */
	ogWidth: 1200,
	ogHeight: 630,
	description:
		"Michał Pasierbski — engineering leader and AI consultant in Zurich. 15+ years shipping products at Google, AWS and startups. Essays on AI engineering.",
	sameAs: [
		"https://x.com/pasmichal_",
		"https://www.linkedin.com/in/mpasierbski",
		"https://github.com/pasierb",
	],
} as const;
