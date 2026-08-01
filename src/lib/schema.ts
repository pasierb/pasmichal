import { SITE } from "../consts";
import { canonicalFor, toAbsolute } from "./seo";

const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;

export const graph = (...nodes: object[]) => ({
	"@context": "https://schema.org",
	"@graph": nodes,
});

/** Full Person node. Emit only on pages that are *about* Michał (/ and /about). */
export const person = (image: string) => ({
	"@type": "Person",
	"@id": PERSON_ID,
	name: SITE.name,
	alternateName: SITE.alternateName,
	url: `${SITE.url}/`,
	image: toAbsolute(image),
	jobTitle: SITE.jobTitle,
	description: SITE.description,
	email: `mailto:${SITE.email}`,
	worksFor: {
		"@type": "Organization",
		name: SITE.employer.name,
		url: SITE.employer.url,
	},
	address: {
		"@type": "PostalAddress",
		addressLocality: "Zurich",
		addressCountry: "CH",
	},
	knowsAbout: [
		"AI agents",
		"Large language models",
		"Google Agent Development Kit",
		"Software architecture",
		"TypeScript",
		"Python",
		"Google Cloud",
		"AWS",
	],
	sameAs: SITE.sameAs,
});

/**
 * Author stub for article pages. Keeps the @id for graph consolidation but
 * stays self-contained, because Google does NOT resolve @id across pages.
 */
const authorRef = () => ({
	"@type": "Person",
	"@id": PERSON_ID,
	name: SITE.name,
	url: `${SITE.url}/about`,
});

export const website = () => ({
	"@type": "WebSite",
	"@id": WEBSITE_ID,
	url: `${SITE.url}/`,
	name: SITE.name,
	description: SITE.description,
	inLanguage: "en",
	publisher: { "@id": PERSON_ID },
});

export function blogPosting(o: {
	title: string;
	description: string;
	pathname: string;
	pubDate: Date;
	updatedDate?: Date;
	image: string;
	tags?: string[];
}) {
	const url = canonicalFor(o.pathname);
	return {
		"@type": "BlogPosting",
		"@id": `${url}#article`,
		headline: o.title.slice(0, 110), // schema.org caps headline at 110
		description: o.description,
		url,
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		image: [toAbsolute(o.image)],
		datePublished: o.pubDate.toISOString(),
		dateModified: (o.updatedDate ?? o.pubDate).toISOString(),
		author: authorRef(),
		publisher: authorRef(),
		isPartOf: { "@id": WEBSITE_ID },
		inLanguage: "en",
		...(o.tags?.length ? { keywords: o.tags.join(", ") } : {}),
	};
}

export const breadcrumbs = (items: { name: string; path?: string }[]) => ({
	"@type": "BreadcrumbList",
	itemListElement: items.map((item, i) => ({
		"@type": "ListItem",
		position: i + 1,
		name: item.name,
		// The final crumb is the current page and carries no `item` by design.
		...(item.path ? { item: canonicalFor(item.path) } : {}),
	})),
});

export const profilePage = () => ({
	"@type": "ProfilePage",
	"@id": `${canonicalFor("/about")}#profilepage`,
	url: canonicalFor("/about"),
	name: `About ${SITE.name}`,
	isPartOf: { "@id": WEBSITE_ID },
	mainEntity: { "@id": PERSON_ID },
});

export function videoObject(o: {
	name: string;
	description: string;
	videoId: string;
	embedUrl: string;
	thumbnailUrl: string;
	uploadDate: Date;
	pathname: string;
	duration?: string;
	inLanguage: string;
}) {
	return {
		"@type": "VideoObject",
		name: o.name,
		description: o.description,
		thumbnailUrl: [o.thumbnailUrl],
		uploadDate: o.uploadDate.toISOString(),
		embedUrl: o.embedUrl,
		contentUrl: `https://www.youtube.com/watch?v=${o.videoId}`,
		url: canonicalFor(o.pathname),
		inLanguage: o.inLanguage,
		author: authorRef(),
		...(o.duration ? { duration: o.duration } : {}),
	};
}

export function service(offers: { title: string; description: string }[]) {
	return {
		"@type": "Service",
		"@id": `${canonicalFor("/services")}#service`,
		name: "Fix the Vibe — vibe-code cleanup and audits",
		serviceType: "Software code audit and remediation",
		description:
			"Security, infrastructure and code-quality audits for AI-generated codebases, plus an actionable remediation plan.",
		url: canonicalFor("/services"),
		provider: authorRef(),
		areaServed: { "@type": "Place", name: "Worldwide" },
		// No price/priceCurrency: the real number lives in the Stripe button, and
		// inventing one here would be false structured data.
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Fix the Vibe engagements",
			itemListElement: offers.map((offer) => ({
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: offer.title,
					description: offer.description,
				},
			})),
		},
	};
}
