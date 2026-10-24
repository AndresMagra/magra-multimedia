import { defineConfig } from 'astro/config';

// Served from the custom domain root (public/CNAME), so no base path.
// Everything in src/ still builds URLs through url() in config.ts, which reads
// import.meta.env.BASE_URL — if the site ever moves under a sub-path again,
// set `base` here and nothing else needs to change.
export default defineConfig({
  site: 'https://magramultimedia.com',
  trailingSlash: 'ignore',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  build: { inlineStylesheets: 'auto' },
});
