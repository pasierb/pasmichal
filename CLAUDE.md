# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack & Architecture

This is a personal blog and portfolio site built with:
- **Astro 7** - Static site generator with content collections
- **TailwindCSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Netlify** - Hosting
- **Biome** - Linting and formatting
- **pnpm** - Package manager (the only lockfile; do not add `package-lock.json`)

Requires Node 22.12+ (pinned in `.node-version`).

Tailwind 4 is configured CSS-first — there is no `tailwind.config.mjs`. The
theme, plugins, and the `dark` variant all live at the top of
`src/assets/css/main.css` via `@theme`, `@plugin`, and `@custom-variant`. Dark
mode keys off a `.dark` class on `<html>`, so the `@custom-variant dark` line is
load-bearing for every `dark:` utility in the codebase.

Fonts come from Astro's `fonts` config, which emits `--font-sans-family` and
`--font-serif-family`. Those are deliberately *not* named `--font-sans` /
`--font-serif`, because Tailwind 4 uses those names as its own theme keys;
`@theme` composes the Astro variables into the Tailwind ones.

Markdown is rendered by **Sätteri**, Astro's native pipeline. There is no
remark/rehype setup — adding a remark or rehype plugin would require installing
`@astrojs/markdown-remark` and setting `markdown.processor`.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production (includes type checking)
pnpm build

# Preview production build
pnpm preview

# Lint and format code
pnpm check
```

## Project Structure

- `src/content/` - Content collections (posts and podcasts)
- `src/pages/` - Astro pages with dynamic routing
- `src/layouts/` - Reusable page layouts
- `src/components/` - Astro components
- `src/collections/` - JSON data files for experiences, projects, menu

## Content System

The site uses Astro's content collections with two main types:

1. **Posts** (`src/content/post/`) - Blog posts in Markdown with frontmatter
2. **Podcasts** (`src/content/podcast/`) - Podcast appearances with links

Content schema is defined in `src/content.config.js` using Zod validation.

## Key Features

- Dark mode support with localStorage persistence
- Responsive design with TailwindCSS
- Opt-in table of contents: set `toc: true` in a post's frontmatter and
  `src/components/table-of-contents.astro` builds it from the headings returned
  by `render()`
- SEO-friendly with proper meta tags

## Writing Style Guidelines

When creating content, follow the established tone from `.cursor/rules/writing-style.mdc`:
- Pragmatic and candid approach
- Direct, conversational language
- Personal experience and practical insights
- Clear structure with headings and bullet points
- Code examples where relevant