import assert from "node:assert/strict";
import { test } from "node:test";
import { submit } from "./indexnow.mjs";

test("submits sitemap pages once, batches URLs, and reports failures", async () => {
	const site = "https://www.pasmichal.com";
	const urls = Array.from({ length: 10_001 }, (_, i) => `${site}/post/${i}`);
	urls[0] = `${site}/?a=1&b=2`;
	const requests = [];
	let status = 202;
	let sitemapStatus = 200;
	let pageXml = `<urlset>${[...urls, urls[0]]
		.map((url) => `<url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`)
		.join("")}</urlset>`;
	const fakeFetch = async (url, options) => {
		if (options) {
			assert.equal(url, "https://api.indexnow.org/indexnow");
			assert.equal(options.method, "POST");
			requests.push(JSON.parse(options.body));
			return new Response("", { status });
		}
		if (url === `${site}/sitemap-index.xml`) {
			return new Response(
				`<sitemapindex><sitemap><loc>${site}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
				{ status: sitemapStatus },
			);
		}
		assert.equal(url, `${site}/sitemap-0.xml`);
		return new Response(pageXml);
	};
	await submit(fakeFetch);
	assert.deepEqual(
		requests.map(({ urlList }) => urlList.length),
		[10_000, 1],
	);
	assert.deepEqual(
		requests.flatMap(({ urlList }) => urlList),
		urls,
	);
	assert.equal(requests[0].host, "www.pasmichal.com");
	assert.equal(requests[0].key, "26cd4fcc67304ac19b1a9b303c088c65");
	assert.equal(requests[0].keyLocation, `${site}/${requests[0].key}.txt`);
	status = 429;
	await assert.rejects(submit(fakeFetch), /IndexNow: HTTP 429/);
	sitemapStatus = 503;
	await assert.rejects(submit(fakeFetch), /HTTP 503/);
	sitemapStatus = 200;
	pageXml = "<urlset></urlset>";
	await assert.rejects(submit(fakeFetch), /No URLs/);
	pageXml = "<urlset><url><loc>https://example.com/</loc></url></urlset>";
	await assert.rejects(submit(fakeFetch), /Unexpected URL/);
});
