# Click → Client tracking

The point of this system is to answer one question: **which ad creative produces
paying clients** — not which one produces cheap clicks. Those are usually
different creatives, and optimising for the wrong one burns budget for months.

## Where the chain breaks

| Step | Who can see it |
|---|---|
| Ad click → site visit | Meta / Google / GA4 |
| Site visit → WhatsApp click | GA4 + Pixel (we fire this) |
| WhatsApp click → conversation | **Only WhatsApp** |
| Conversation → client | **Only Andrés** |

Nothing automatically bridges steps 2 and 3. The lead code does.

## The lead code

On the WhatsApp click the site generates a short code (`MG-7K2A`), stores it for
the session, fires it to analytics **and** embeds it in the pre-filled message.
So the first WhatsApp message reads:

```
Hola Magra.
Tengo: Clínica o consultorio.
Mi problema: Tengo visitas pero no vendo.
Publicidad: Sí, actualmente.
Quiero el diagnóstico.
Ref: MG-AKS9
```

The chat opens already qualified, and `MG-AKS9` ties that conversation back to
the exact creative that produced it.

## Events fired

| Event | When | Key params |
|---|---|---|
| `diagnostico_abierto` | Any CTA opens the dialog | `cta_source` |
| `diagnostico_paso_1` | Business type chosen | `negocio`, `cta_source` |
| `diagnostico_paso_2` | Problem chosen | `problema`, `cta_source` |
| `diagnostico_paso_3` | Ad spend chosen | `publicidad`, `cta_source` |
| **`whatsapp_click`** | **The conversion** | `lead_code`, `business_type`, `problem`, `ad_status`, `cta_source`, all UTMs |
| `scroll_depth` | 25 / 50 / 75 / 90% | `depth` |
| `faq_open` | An FAQ is expanded | `question` |

`whatsapp_click` also fires Meta's standard `Lead` event so campaigns can
optimise against it directly.

`cta_source` tells you *which* button converted — hero, a service card, the
sticky mobile bar, the footer. If the service cards outconvert the hero, the
hero copy is wrong.

Step events exist to show where people abandon the qualifier. Heavy drop-off at
step 1 means the categories don't match how your market describes itself — and
their answers are free market research.

## Setup checklist

1. Create GA4 property → put the `G-` ID in `src/config.ts` → `ANALYTICS.ga4`
2. Create Meta Pixel → put the ID in `ANALYTICS.metaPixel`
3. In GA4, mark `whatsapp_click` as a **key event** (conversion)
4. In Meta Events Manager, create a custom conversion on `whatsapp_click`
5. Verify with GA4 DebugView and Meta Pixel Helper before spending anything

Until those IDs are filled the tracking module is a safe no-op — nothing breaks,
nothing is recorded.

**Do not optimise campaigns for `whatsapp_click` until you get roughly 50/week.**
Below that Meta has too little signal; optimise for landing page views first.

## The log — this is the part that actually matters

The pixel cannot see outcomes. Keep one sheet:

| Código | Fecha | utm_source | Campaña | Creativo | Tipo de negocio | Problema | Estado | Valor |
|---|---|---|---|---|---|---|---|---|

`Estado`: Nuevo → Calificado → Propuesta → Cliente → Perdido

Mirror the same five stages as WhatsApp Business labels so updating takes
seconds from your phone after each conversation.

Without this sheet the whole system degrades into counting clicks. With it, once
a month you can sort by creative and get **cost per client**, which is the only
number worth acting on.

## Monthly review

1. Export the sheet
2. Join on `Código` against GA4/Meta campaign data
3. Cost per client by creative, not cost per click
4. Kill the creatives with cheap clicks and no clients — there will be some
5. Check `faq_open` for the dominant objection and rewrite that section

## Note on Meta's click-to-WhatsApp ads

Meta offers ad objectives that open WhatsApp directly, skipping the site. Those
often show a lower cost per conversation — but they skip the qualification
widget and the premium framing, so the conversations are colder and worse. Worth
testing as a variant later; not the default.
