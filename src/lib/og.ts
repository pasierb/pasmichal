import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import ogFallback from "../assets/images/cover.jpg";
import { SITE } from "../consts";

/**
 * Derive the social card for a page.
 *
 * Content-collection hero images are ImageMetadata, not strings, so they cannot
 * go straight into og:image. getImage() registers the transform with the
 * static-image collector, so the crop is emitted even though no <img>
 * references it — and the result is content-hashed into /_astro/, which means it
 * inherits the adapter's immutable cache header and busts automatically when the
 * hero changes.
 *
 * JPEG is deliberate: LinkedIn and several chat unfurlers still refuse to
 * render WebP social cards.
 */
export async function deriveOgImage(source?: ImageMetadata) {
	const image = await getImage({
		src: source ?? ogFallback,
		width: SITE.ogWidth,
		height: SITE.ogHeight,
		fit: "cover",
		position: "center",
		format: "jpeg",
		quality: 82,
	});
	return {
		src: image.src,
		width: SITE.ogWidth,
		height: SITE.ogHeight,
	};
}
