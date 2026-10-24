import type { APIRoute } from 'astro';
import { ROUTES } from '../i18n';
import { SITE } from '../config';

// Hand-rolled so it needs no extra dependency; every page lives in ROUTES.
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(SITE.url)).href.replace(/\/$/, '');
  const abs = (p: string) => `${origin}${p}`;
  const entries = Object.entries(ROUTES)
    .flatMap(([es, en]) => [
      [es, es, en],
      [en, es, en],
    ])
    .map(
      ([loc, es, en]) => `  <url>
    <loc>${abs(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${abs(es)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(en)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(es)}"/>
  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
