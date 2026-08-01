/**
 * One-off source-image re-encode. NOT a build step — `astro build` already
 * generates delivery derivatives, so a second pass would just double build time.
 *
 * Run once against a clean working tree so `git diff --stat` shows exactly what
 * changed, then commit the result:
 *
 *   node scripts/optimize-source-images.mjs
 *
 * Keep it around for future image drops. `sharp` is already a direct dependency.
 */
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "src/assets/images";

/**
 * [relative path, max width, output format]
 * Output replaces the input; the extension may change, so update importers.
 * PNG -> WebP rather than PNG -> JPEG: the workflow screenshots have alpha,
 * and JPEG would flatten them onto an assumed background.
 */
const JOBS = [
	["posts/cloudflare-kv.png", 1536, "webp"],
	["posts/adk-function-to-state.png", 1536, "webp"],
	["posts/n8n-puppeteer.png", 1600, "webp"],
	["passport-check-workflow.png", 1600, "webp"],
	["fam.jpg", 1344, "webp"],
	["bern.jpg", 900, "webp"],
	["lucerne.jpg", 1600, "webp"],
	["profile_pic.png", 256, "webp"],
	["pasmichal-pfp.png", 384, "webp"],
	["cover.png", 1200, "jpeg"],
];

let before = 0;
let after = 0;

for (const [rel, width, format] of JOBS) {
	const from = path.join(SRC, rel);
	const to = from.replace(/\.\w+$/, `.${format === "jpeg" ? "jpg" : format}`);
	const originalSize = (await readFile(from)).length;

	// .rotate() with no argument applies EXIF orientation then strips it, which
	// matters for the phone photos. Sharp drops all other metadata (incl. GPS)
	// by default -- a privacy win for the family photo.
	let pipe = sharp(from).rotate().resize({ width, withoutEnlargement: true });
	pipe =
		format === "webp"
			? pipe.webp({ quality: 82, effort: 6 })
			: pipe
					.flatten({ background: "#ffffff" })
					.jpeg({ quality: 82, mozjpeg: true });

	const out = await pipe.toBuffer();
	await writeFile(to, out);
	if (to !== from) await unlink(from);

	before += originalSize;
	after += out.length;
	const pct = (100 * (1 - out.length / originalSize)).toFixed(1);
	console.log(
		`${rel.padEnd(36)} ${String(originalSize).padStart(9)} -> ${String(
			out.length,
		).padStart(8)}  (-${pct}%)`,
	);
}

console.log(
	`\ntotal ${before} -> ${after} (-${(100 * (1 - after / before)).toFixed(
		1,
	)}%)`,
);
