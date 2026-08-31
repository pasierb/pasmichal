import { execSync } from "node:child_process";
import { copyFileSync, createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const ROOT_DIR = resolve(".");
const DIST_DIR = resolve(ROOT_DIR, "dist");
const PUBLIC_OUTPUT = resolve(ROOT_DIR, "public/michal_pasierbski_cv.pdf");
const DIST_OUTPUT = resolve(ROOT_DIR, "dist/michal_pasierbski_cv.pdf");

const MIME_TYPES = {
	".html": "text/html",
	".css": "text/css",
	".js": "application/javascript",
	".webp": "image/webp",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".svg": "image/svg+xml",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".ttf": "font/ttf",
	".pdf": "application/pdf",
};

function createStaticServer() {
	return http.createServer((req, res) => {
		let reqPath = (req.url || "/").split("?")[0];
		if (reqPath === "/resume" || reqPath === "/resume/") {
			reqPath = "/resume/index.html";
		}

		const filePath = join(DIST_DIR, reqPath);
		if (existsSync(filePath) && statSync(filePath).isFile()) {
			const ext = extname(filePath).toLowerCase();
			res.writeHead(200, {
				"Content-Type": MIME_TYPES[ext] || "application/octet-stream",
			});
			createReadStream(filePath).pipe(res);
		} else {
			res.writeHead(404);
			res.end("Not found");
		}
	});
}

async function main() {
	console.log("📦 Building static site to ensure fresh assets...");
	execSync("pnpm astro build", { cwd: ROOT_DIR, stdio: "inherit" });

	const server = createStaticServer();
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	const targetUrl = `http://127.0.0.1:${port}/resume`;

	console.log(`✓ Static server listening at ${targetUrl}`);

	try {
		console.log("📄 Launching Chromium...");
		const browser = await chromium.launch({
			executablePath: "/usr/bin/chromium",
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-gpu",
				"--font-render-hinting=medium",
			],
		});

		const page = await browser.newPage();
		await page.goto(targetUrl, { waitUntil: "networkidle" });

		// Ensure web fonts and all images are fully loaded and decoded
		await page.evaluate(async () => {
			await document.fonts.ready;
			const images = Array.from(document.querySelectorAll("img"));
			await Promise.all(
				images.map((img) => {
					if (img.complete && img.naturalHeight !== 0) {
						return img.decode
							? img.decode().catch(() => {})
							: Promise.resolve();
					}
					return new Promise((resolve) => {
						img.addEventListener("load", () => {
							if (img.decode)
								img
									.decode()
									.catch(() => {})
									.then(resolve);
							else resolve();
						});
						img.addEventListener("error", resolve);
					});
				}),
			);
		});

		// Emulate print media so print stylesheets apply
		await page.emulateMedia({ media: "print" });

		console.log("🖨️ Generating PDF...");
		await page.pdf({
			path: PUBLIC_OUTPUT,
			format: "A4",
			printBackground: true,
			preferCSSPageSize: true,
			displayHeaderFooter: false,
		});

		await browser.close();
		console.log(`✅ CV PDF generated at: ${PUBLIC_OUTPUT}`);

		if (existsSync(DIST_DIR)) {
			copyFileSync(PUBLIC_OUTPUT, DIST_OUTPUT);
			console.log(`✅ Synced to dist: ${DIST_OUTPUT}`);
		}
	} finally {
		server.close();
	}
}

main().catch((err) => {
	console.error("❌ Error generating CV PDF:", err);
	process.exit(1);
});
