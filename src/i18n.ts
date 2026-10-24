/**
 * Two locales: Spanish at the root, English under /en/.
 * ROUTES is the single map between matching pages, so the ES/EN toggle always
 * lands on the equivalent page (never a 404) and hreflang stays in sync.
 */
import { url } from './config';

export type Lang = 'es' | 'en';

/** Spanish path -> English path. Add a row here whenever a page is added. */
export const ROUTES: Record<string, string> = {
  '/': '/en/',
  '/diagnostico/': '/en/diagnostic/',
  '/privacidad/': '/en/privacy/',
  '/servicios/video-y-anuncios/': '/en/services/video-ads/',
};

const withSlash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/** Strips the deploy base so paths can be compared against ROUTES. */
function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return withSlash(p || '/');
}

export function getLang(u: URL): Lang {
  const p = stripBase(u.pathname);
  return p === '/en/' || p.startsWith('/en/') ? 'en' : 'es';
}

/** Localised, base-prefixed link to a page given by its Spanish path. */
export function href(lang: Lang, esPath: string, hash = ''): string {
  const key = withSlash(esPath);
  const target = lang === 'en' ? (ROUTES[key] ?? '/en/') : key;
  return url(`${target}${hash}`);
}

/** The same page in both languages (base-prefixed), for the toggle and hreflang. */
export function alternates(u: URL): { es: string; en: string } {
  const p = stripBase(u.pathname);
  const esEntry = Object.entries(ROUTES).find(([es, en]) => es === p || en === p);
  const [es, en] = esEntry ?? ['/', '/en/'];
  return { es: url(es), en: url(en) };
}
