import { z } from "astro:content";
import type { ImageMetadata } from "astro";
import data from "./projects.json";

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
	"/src/assets/images/projects/*.{png,jpg,jpeg,avif,webp}",
	{ eager: true },
);

const imagesByName = new Map<string, ImageMetadata>(
	Object.entries(imageModules).map(([path, mod]) => [
		path.split("/").pop() as string,
		mod.default,
	]),
);

const projectSchema = z.object({
	name: z.string(),
	description: z.string(),
	image: z.string(),
	url: z.string().url(),
	status: z.enum(["active", "exited", "discontinued"]),
	techStack: z.array(z.string()),
	featured: z.boolean().optional().default(false),
});

const rawProjects = z.array(projectSchema).parse(data);

export type Project = z.infer<typeof projectSchema> & {
	imageAsset: ImageMetadata | null;
};

export const projects: Project[] = rawProjects.map((p) => ({
	...p,
	imageAsset: imagesByName.get(p.image) ?? null,
}));

export const featuredProjects = projects.filter((p) => p.featured);
