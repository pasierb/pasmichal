/** Last path segment of a youtu.be / youtube.com/live URL. */
export function youTubeId(link: string): string {
	const url = new URL(link);
	return url.pathname.split("/").filter(Boolean).pop() ?? "";
}

export function youTubeEmbedUrl(link: string): string {
	const source = new URL(link);
	// nocookie avoids setting tracking cookies before the user hits play.
	const embed = new URL(
		`https://www.youtube-nocookie.com/embed/${youTubeId(link)}`,
	);
	const start = source.searchParams.get("t");
	// The old code did `result += "&amp;start=" + t` on a string. Astro escapes
	// attribute values, so "&amp;" shipped as "&amp;amp;" and YouTube saw a
	// parameter literally named "amp;start" — the timestamp never applied.
	if (start) embed.searchParams.set("start", start.replace(/\D/g, ""));
	return embed.href;
}

/** Works as a real og:image for the podcast pages, which otherwise have none. */
export const youTubeThumbnail = (link: string) =>
	`https://i.ytimg.com/vi/${youTubeId(link)}/maxresdefault.jpg`;
