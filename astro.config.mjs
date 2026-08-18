import { defineConfig } from 'astro/config';

// GitHub Pages project sites serve from /<repo>/, so `base` is required or
// every asset and internal link 404s. Everything in src/ builds URLs through
// url() in config.ts, which reads import.meta.env.BASE_URL — so moving to a
// real domain later means setting base back to '/' here and nothing else.
const BASE = process.env.PUBLIC_BASE ?? '/magra-multimedia';

export default defineConfig({
  site: 'https://andresmagra.github.io',
  base: BASE,
  trailingSlash: 'ignore',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  build: { inlineStylesheets: 'auto' },
});
