import { defineConfig } from 'astro/config';

export default defineConfig({
  // Swap to the real domain once it's registered. Cloudflare Pages serves
  // at the root path, so no `base` is needed (this is what bit us on gh-pages).
  site: 'https://magramultimedia.com',

  // i18n architecture lands on day one even though /en/ content ships in v1.1 —
  // retrofitting locale routing into Astro later is painful.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  build: { inlineStylesheets: 'auto' },
});
