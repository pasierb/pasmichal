# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack & Architecture

This is a personal blog and portfolio site built with:
- **Astro** - Static site generator with content collections
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Netlify** - Hosting and serverless functions
- **Biome** - Linting and formatting
- **pnpm** - Package manager

## Development Commands

```bash
# Start development server
pnpm dev
# or
netlify dev

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
- `netlify/functions/` - Serverless functions (newsletter subscription)

## Content System

The site uses Astro's content collections with two main types:

1. **Posts** (`src/content/post/`) - Blog posts in Markdown with frontmatter
2. **Podcasts** (`src/content/podcast/`) - Podcast appearances with links

Content schema is defined in `src/content.config.js` using Zod validation.

## Key Features

- Dark mode support with localStorage persistence
- Newsletter signup via Buttondown API (Netlify function)
- Responsive design with TailwindCSS
- Table of contents generation for posts
- SEO-friendly with proper meta tags

## Writing Style Guidelines

When creating content, follow the established tone from `.cursor/rules/writing-style.mdc`:
- Pragmatic and candid approach
- Direct, conversational language
- Personal experience and practical insights
- Clear structure with headings and bullet points
- Code examples where relevant