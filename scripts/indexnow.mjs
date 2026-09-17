import { readFile } from "node:fs/promises";

const site = "https://www.pasmichal.com";
const key = (
	await readFile(
		new URL("../public/26cd4fcc67304ac19b1a9b303c088c65.txt", import.meta.url),
		"utf8",
	)
).trim();

export async function submit(fetchUrl = fetch) {
	const pending = [`${site}/sitemap-index.xml`];
	const visited = new Set();
	const pages = new Set();
	const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
	for (const sitemap of pending) {
		if (visited.has(sitemap)) continue;
		visited.add(sitemap);
		const response = await fetchUrl(sitemap);
		if (!response.ok) throw new Error(`${sitemap}: HTTP ${response.status}`);
		const xml = await response.text();
		// ponytail: reads Astro's generated <loc> tags; use an XML parser if the sitemap producer changes.
		const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
			([, value]) =>
				value
					.trim()
					.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => entities[name]),
		);
		if (!locations.length) throw new Error(`No URLs in ${sitemap}`);
		for (const url of locations) {
			if (new URL(url).origin !== site)
				throw new Error(`Unexpected URL: ${url}`);
			if (/<sitemapindex\b/.test(xml)) pending.push(url);
			else pages.add(url);
		}
	}
	const urls = [...pages];
	if (!urls.length) throw new Error("No pages to submit");
	for (let offset = 0; offset < urls.length; offset += 10_000) {
		const urlList = urls.slice(offset, offset + 10_000);
		const response = await fetchUrl("https://api.indexnow.org/indexnow", {
			method: "POST",
			headers: { "Content-Type": "application/json; charset=utf-8" },
			body: JSON.stringify({
				host: new URL(site).host,
				key,
				keyLocation: `${site}/${key}.txt`,
				urlList,
			}),
		});
		if (!response.ok) {
			throw new Error(
				`IndexNow: HTTP ${response.status}: ${await response.text()}`,
			);
		}
		console.log(
			`Submitted ${urlList.length} URLs (HTTP ${response.status}${
				response.status === 202 ? "; key validation pending" : ""
			}).`,
		);
	}
}

if (import.meta.main) {
	await submit();
}
