// Astro config: static site, deployed to Cloudflare Pages.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bhattarainavin.com',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
