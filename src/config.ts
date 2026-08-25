/**
 * Single source of truth for anything that changes without a redesign.
 * Swapping the WhatsApp number or adding analytics IDs happens here only.
 */

export const SITE = {
  name: 'Magra MultiMedia',
  tagline: 'Video · Sitios web · Campañas publicitarias',
  locale: 'es',
  url: 'https://magramultimedia.com',
} as const;

/**
 * PLACEHOLDER — replace with the dedicated business line when it exists.
 * International format, digits only, no + and no spaces (wa.me requirement).
 * +1 829 659 1315  ->  18296591315
 */
export const WHATSAPP_NUMBER = '18296591315';

/**
 * Analytics. Left empty on purpose — the tracking module is a no-op until
 * these are filled, so nothing breaks before the accounts exist.
 */
export const ANALYTICS = {
  ga4: '', // e.g. 'G-XXXXXXXXXX'
  metaPixel: '', // e.g. '123456789012345'
} as const;

/** Diagnostic widget — options double as the qualification data sent to WhatsApp. */
export const NEGOCIOS = [
  'Restaurante',
  'Clínica o consultorio',
  'Inmobiliaria',
  'Hotel o turismo',
  'Tienda / e-commerce',
  'Servicios profesionales',
  'Otro',
] as const;

export const PROBLEMAS = [
  'No me llegan suficientes clientes',
  'Tengo visitas pero no vendo',
  'Casi no tengo presencia digital',
  'Mis anuncios no están funcionando',
] as const;

export const PUBLICIDAD = ['Sí, actualmente', 'Antes sí, ahora no', 'Nunca'] as const;

/** Fallback link for the "prefiero escribir directo" escape hatch. */
export function waDirectLink(): string {
  const texto = encodeURIComponent('Hola Magra. Quiero el diagnóstico.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
}

/**
 * Prefixes an app-absolute path with the deploy base path.
 * GitHub Pages project sites live at /<repo>/; a custom domain lives at /.
 * Always route internal links and asset URLs through this.
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (path === '/') return base || '/';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
