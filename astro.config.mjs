// @ts-check
import { defineConfig } from "astro/config";
import remarkToc from 'remark-toc';
import tailwind from "@astrojs/tailwind";

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],

  markdown: {
    remarkPlugins: [ [remarkToc, { heading: 'On this page', maxDepth: 3 } ] ],
  },

  site: 'https://www.pasmichal.com',
  adapter: netlify(),
});