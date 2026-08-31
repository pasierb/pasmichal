import { execSync, spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const PORTS = [4321, 4322, 3000];
const ROOT_DIR = resolve(".");
const PUBLIC_OUTPUT = resolve(ROOT_DIR, "public/michal_pasierbski_cv.pdf");
const DIST_OUTPUT = resolve(ROOT_DIR, "dist/michal_pasierbski_cv.pdf");

async function checkUrl(url) {
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
		return res.ok;
	} catch {
		return false;
	}
}

async function findRunningServerUrl() {
	for (const port of PORTS) {
		for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
			const url = `http://${host}:${port}/resume`;
			if (await checkUrl(url)) {
				return url;
			}
		}
	}
	return null;
}

async function waitForServer(url, timeoutMs = 15000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await checkUrl(url)) return true;
		await new Promise((r) => setTimeout(r, 250));
	}
	return false;
}

async function main() {
	let targetUrl = await findRunningServerUrl();
	let serverProcess = null;

	if (targetUrl) {
		console.log(`✓ Detected running dev server at ${targetUrl}`);
	} else {
		const port = 4321;
		targetUrl = `http://localhost:${port}/resume`;
		console.log(`🚀 Starting Astro server at ${targetUrl}...`);

		serverProcess = spawn(
			"pnpm",
			["astro", "dev", "--port", String(port), "--host", "0.0.0.0"],
			{
				cwd: ROOT_DIR,
				stdio: "ignore",
				env: { ...process.env, NODE_ENV: "production" },
			},
		);

		const ready = await waitForServer(targetUrl, 12000);
		if (!ready) {
			targetUrl = await findRunningServerUrl();
			if (!targetUrl) {
				if (serverProcess) serverProcess.kill("SIGTERM");
				throw new Error("Could not connect to Astro server.");
			}
		}
		console.log(`✓ Server ready at ${targetUrl}`);
	}

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

		// Ensure web fonts are fully loaded
		await page.evaluate(async () => {
			await document.fonts.ready;
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

		if (existsSync(resolve(ROOT_DIR, "dist"))) {
			copyFileSync(PUBLIC_OUTPUT, DIST_OUTPUT);
			console.log(`✅ Synced to dist: ${DIST_OUTPUT}`);
		}
	} finally {
		if (serverProcess) {
			serverProcess.kill("SIGTERM");
		}
	}
}

main().catch((err) => {
	console.error("❌ Error generating CV PDF:", err);
	process.exit(1);
});
