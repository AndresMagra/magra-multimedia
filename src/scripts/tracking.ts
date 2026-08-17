/**
 * Click -> client attribution.
 *
 * The chain breaks in one specific place: Meta and GA4 can see the ad click and
 * the WhatsApp button click, but they cannot see the conversation, and they
 * definitely cannot see whether it became a client. Without a bridge you end up
 * optimising for cheap clicks instead of paying customers.
 *
 * The bridge is a lead code. On the WhatsApp click we generate a short code,
 * fire it to analytics alongside the campaign data, AND embed it in the
 * pre-filled message. The code appears in the first WhatsApp message, so every
 * conversation traces back to the exact ad creative that produced it.
 *
 * Log the code + outcome in the sheet (docs/tracking.md) and cost-per-CLIENT
 * by creative becomes answerable — which is the only number that matters.
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

type Utms = Partial<Record<(typeof UTM_KEYS)[number], string>>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Short, human-readable, easy to search for in WhatsApp. e.g. MG-7K2A */
export function getLeadCode(): string {
  const KEY = 'mg_lead_code';
  let code = sessionStorage.getItem(KEY);
  if (!code) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    code = `MG-${rand}`;
    sessionStorage.setItem(KEY, code);
  }
  return code;
}

/**
 * First-touch attribution: capture UTMs on the first page view and keep them
 * for the session, so a visitor who browses two pages before messaging still
 * carries the campaign that brought them in.
 */
export function captureUtms(): Utms {
  const KEY = 'mg_utms';
  const stored = sessionStorage.getItem(KEY);
  if (stored) return JSON.parse(stored) as Utms;

  const params = new URLSearchParams(window.location.search);
  const utms: Utms = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) utms[key] = v;
  }
  if (!utms.utm_source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (!host.includes(window.location.hostname)) utms.utm_source = `ref:${host}`;
    } catch {
      /* malformed referrer — ignore */
    }
  }
  sessionStorage.setItem(KEY, JSON.stringify(utms));
  return utms;
}

/** No-ops safely until the GA4 / Pixel IDs exist, so nothing breaks pre-launch. */
export function track(event: string, params: Record<string, unknown> = {}): void {
  const payload = { ...captureUtms(), ...params };

  window.gtag?.('event', event, payload);
  window.fbq?.('trackCustom', event, payload);

  if (import.meta.env.DEV) console.debug('[track]', event, payload);
}

/**
 * Builds the wa.me link. The message is the qualification handoff — Andrés
 * opens the chat already knowing the business, the pain and the spend level,
 * so the first reply can be a specific insight instead of "hola, cuéntame".
 */
export function buildWaLink(
  number: string,
  answers: { negocio?: string; problema?: string; publicidad?: string },
): { url: string; code: string } {
  const code = getLeadCode();
  const lines = ['Hola Magra.'];

  if (answers.negocio) lines.push(`Tengo: ${answers.negocio}.`);
  if (answers.problema) lines.push(`Mi problema: ${answers.problema}.`);
  if (answers.publicidad) lines.push(`Publicidad: ${answers.publicidad}.`);

  lines.push('Quiero el diagnóstico.');
  lines.push(`Ref: ${code}`);

  const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
  return { url, code };
}

/** THE conversion event. Everything else on the page is a supporting metric. */
export function trackWhatsappClick(
  answers: { negocio?: string; problema?: string; publicidad?: string },
  source: string,
): string {
  const code = getLeadCode();
  track('whatsapp_click', {
    lead_code: code,
    business_type: answers.negocio ?? 'no_especificado',
    problem: answers.problema ?? 'no_especificado',
    ad_status: answers.publicidad ?? 'no_especificado',
    cta_source: source,
    page: window.location.pathname,
  });
  // Meta's standard Lead event, so campaigns can optimise against it directly.
  window.fbq?.('track', 'Lead', { content_name: source, lead_code: code });
  return code;
}
