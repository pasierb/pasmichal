import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	AlignmentType,
	Document,
	ExternalHyperlink,
	HeadingLevel,
	Packer,
	Paragraph,
	TextRun,
} from "docx";

const ROOT_DIR = resolve(".");
const PUBLIC_OUTPUT = resolve(ROOT_DIR, "public/michal_pasierbski_cv.docx");
const DIST_OUTPUT = resolve(ROOT_DIR, "dist/michal_pasierbski_cv.docx");
const cv = JSON.parse(
	readFileSync(resolve(ROOT_DIR, "src/collections/cv.json"), "utf8"),
);

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function formatDates(value) {
	return value.replace(
		/\b(0[1-9]|1[0-2])\.(\d{4})\b/g,
		(_, month, year) => `${MONTHS[Number(month) - 1]} ${year}`,
	);
}

function sectionHeading(text) {
	return new Paragraph({
		text,
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 220, after: 80 },
		keepNext: true,
	});
}

function labelAndValue(label, value) {
	return new Paragraph({
		children: [
			new TextRun({ text: `${label}: `, bold: true }),
			new TextRun(value),
		],
		spacing: { after: 50 },
	});
}

function descriptionBullet(text) {
	const colonIndex = text.indexOf(":");
	const hasPrefix = colonIndex > 0 && colonIndex < 40;
	const children = hasPrefix
		? [
				new TextRun({ text: text.slice(0, colonIndex + 1), bold: true }),
				new TextRun(text.slice(colonIndex + 1)),
			]
		: [new TextRun(text)];

	return new Paragraph({
		children,
		bullet: { level: 0 },
		spacing: { after: 55 },
	});
}

function experience(entry) {
	return [
		new Paragraph({
			text: entry.company,
			heading: HeadingLevel.HEADING_3,
			spacing: { before: 150, after: 30 },
			keepNext: true,
		}),
		new Paragraph({
			children: [new TextRun({ text: entry.role, bold: true })],
			spacing: { after: 25 },
			keepNext: true,
		}),
		new Paragraph({
			text: formatDates(entry.dates),
			spacing: { after: entry.location ? 25 : 70 },
			keepNext: true,
		}),
		...(entry.location
			? [
					new Paragraph({
						children: [
							new TextRun({ text: "Location: ", bold: true }),
							new TextRun(entry.location),
						],
						spacing: { after: 70 },
						keepNext: true,
					}),
				]
			: []),
		...(entry.highlights || []).map(descriptionBullet),
		...(entry.tech ? [labelAndValue("Technologies", entry.tech)] : []),
	];
}

function project(entry) {
	return [
		new Paragraph({
			text: entry.name,
			heading: HeadingLevel.HEADING_3,
			spacing: { before: 150, after: 30 },
			keepNext: true,
		}),
		new Paragraph({
			children: [new TextRun({ text: entry.role, bold: true })],
			spacing: { after: 25 },
			keepNext: true,
		}),
		new Paragraph({
			text: formatDates(entry.dates),
			spacing: { after: 25 },
			keepNext: true,
		}),
		...(entry.url
			? [
					new Paragraph({
						children: [
							new ExternalHyperlink({
								link: entry.url,
								children: [
									new TextRun({
										text: entry.urlDisplay || entry.url,
										style: "Hyperlink",
									}),
								],
							}),
						],
						spacing: { after: 70 },
						keepNext: true,
					}),
				]
			: []),
		...(entry.highlights || []).map(descriptionBullet),
		...(entry.tech ? [labelAndValue("Technologies", entry.tech)] : []),
	];
}

const contactLinks = [
	{ label: cv.email, url: `mailto:${cv.email}` },
	{ label: cv.websiteDisplay, url: cv.website },
	{ label: cv.linkedinDisplay, url: cv.linkedin },
	{ label: cv.githubDisplay, url: cv.github },
];

const children = [
	new Paragraph({
		text: cv.name,
		heading: HeadingLevel.TITLE,
		alignment: AlignmentType.CENTER,
		spacing: { after: 50 },
	}),
	new Paragraph({
		children: [new TextRun({ text: cv.title, bold: true, size: 24 })],
		alignment: AlignmentType.CENTER,
		spacing: { after: 40 },
	}),
	new Paragraph({
		text: "Zurich, Switzerland",
		alignment: AlignmentType.CENTER,
		spacing: { after: 40 },
	}),
	new Paragraph({
		children: contactLinks.flatMap((item, index) => [
			...(index ? [new TextRun(" | ")] : []),
			new ExternalHyperlink({
				link: item.url,
				children: [new TextRun({ text: item.label, style: "Hyperlink" })],
			}),
		]),
		alignment: AlignmentType.CENTER,
		spacing: { after: 25 },
	}),
	new Paragraph({
		text: cv.phone,
		alignment: AlignmentType.CENTER,
		spacing: { after: 130 },
	}),
	sectionHeading("Professional Summary"),
	new Paragraph({ text: cv.summary, spacing: { after: 80 } }),
	sectionHeading("Technical Skills and Competencies"),
	...Object.entries(cv.skills).map(([category, skills]) =>
		labelAndValue(category, skills.join(", ")),
	),
	sectionHeading("Professional Experience"),
	...cv.experiences.flatMap(experience),
	...(cv.projects?.length
		? [
				sectionHeading("Selected Projects and Independent Engineering"),
				...cv.projects.flatMap(project),
			]
		: []),
	sectionHeading("Education"),
	...cv.education.flatMap((entry) => [
		new Paragraph({
			text: entry.institution,
			heading: HeadingLevel.HEADING_3,
			spacing: { before: 100, after: 25 },
			keepNext: true,
		}),
		new Paragraph({
			text: entry.degree,
			spacing: { after: 25 },
			keepNext: true,
		}),
		new Paragraph({
			text: `${formatDates(entry.dates)}${
				entry.location ? ` | ${entry.location}` : ""
			}`,
			spacing: { after: 60 },
		}),
	]),
	sectionHeading("Certifications"),
	...cv.certifications.flatMap((entry) => [
		new Paragraph({
			text: entry.name,
			heading: HeadingLevel.HEADING_3,
			spacing: { before: 100, after: 25 },
			keepNext: true,
		}),
		new Paragraph({
			text: entry.issuer,
			spacing: { after: 25 },
			keepNext: true,
		}),
		new Paragraph({ text: formatDates(entry.date), spacing: { after: 60 } }),
	]),
];

const document = new Document({
	creator: cv.name,
	title: `${cv.name} - Resume`,
	description: `${cv.name}'s professional resume`,
	styles: {
		default: {
			document: {
				run: { font: "Arial", size: 20, color: "222222" },
				paragraph: { spacing: { line: 240 } },
			},
			heading1: { run: { font: "Arial" } },
			heading2: {
				run: { font: "Arial", size: 24, bold: true, color: "0F6B69" },
			},
			heading3: {
				run: { font: "Arial", size: 21, bold: true, color: "111111" },
			},
			title: {
				run: { font: "Arial", size: 36, bold: true, color: "111111" },
			},
		},
	},
	sections: [
		{
			properties: {
				page: {
					size: { width: 11906, height: 16838 },
					margin: { top: 720, right: 850, bottom: 720, left: 850 },
				},
			},
			children,
		},
	],
});

const buffer = await Packer.toBuffer(document);
writeFileSync(PUBLIC_OUTPUT, buffer);
console.log(`DOCX CV generated at: ${PUBLIC_OUTPUT}`);

if (existsSync(resolve(ROOT_DIR, "dist"))) {
	copyFileSync(PUBLIC_OUTPUT, DIST_OUTPUT);
	console.log(`Synced to dist: ${DIST_OUTPUT}`);
}
