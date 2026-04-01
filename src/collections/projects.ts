import { z } from "astro:content";
import data from "./projects.json";

const projectSchema = z.object({
	name: z.string(),
	description: z.string(),
	image: z.string(),
	url: z.string().url(),
	status: z.enum(["active", "exited", "discontinued"]),
	techStack: z.array(z.string()),
	featured: z.boolean().optional().default(false),
});

export type Project = z.infer<typeof projectSchema>;

export const projects = z.array(projectSchema).parse(data);
export const featuredProjects = projects.filter(p => p.featured);
