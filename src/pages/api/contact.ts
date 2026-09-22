import type { APIRoute } from 'astro';
import { validateContact } from '@lib/contact';
import { createLead, zohoConfigured } from '@lib/zoho';

/** The one route on the site that runs on-demand. Everything else is static. */
export const prerender = false;

const MAX_BODY_BYTES = 16_000;
/** Submissions faster than this after the page loaded are almost certainly bots. */
const MIN_FILL_TIME_MS = 3_000;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) throw new Error('Payload too large');
    return JSON.parse(text) as Record<string, unknown>;
  }
  const data = await request.formData();
  return Object.fromEntries(data.entries());
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;

  let raw: Record<string, unknown>;
  try {
    raw = await readBody(request);
  } catch {
    return wantsJson
      ? json({ ok: false, message: 'Could not read the form.' }, 400)
      : new Response('Could not read the form.', { status: 400 });
  }

  // Bot checks. Respond as if successful so automated senders learn nothing.
  const honeypot = typeof raw.company_url === 'string' ? raw.company_url : '';
  const ts = typeof raw.ts === 'string' ? Number(raw.ts) : NaN;
  const tooFast = Number.isFinite(ts) && Date.now() - ts < MIN_FILL_TIME_MS;
  if (honeypot || tooFast) {
    return wantsJson ? json({ ok: true }) : redirect('/thanks', 303);
  }

  const { values, errors } = validateContact(raw);
  if (Object.keys(errors).length > 0) {
    if (wantsJson) return json({ ok: false, errors }, 400);
    const list = Object.values(errors)
      .map((e) => `<li>${escapeHtml(e)}</li>`)
      .join('');
    return new Response(
      `<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Please check the form</title>
       <body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:0 1.25rem">
       <h1>Please check the form</h1><ul>${list}</ul><p><a href="/contact">Back to the form</a></p></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  try {
    if (!zohoConfigured) {
      // Local development without credentials: log rather than lose the submission.
      if (import.meta.env.DEV) {
        console.info(
          '[contact] Zoho not configured, submission logged instead:\n' +
            `Name: ${values.name}\nBusiness: ${values.business}\nEmail: ${values.email}\n` +
            `Website: ${values.website}\n\n${values.message}`,
        );
        return wantsJson ? json({ ok: true }) : redirect('/thanks', 303);
      }
      throw new Error('Zoho CRM credentials are not configured');
    }

    const { result, id } = await createLead(values);
    console.info(`[contact] lead ${result}${id ? ` (${id})` : ''} for ${values.business}`);
  } catch (error) {
    console.error('[contact] submission failed:', error);
    return wantsJson
      ? json({ ok: false, message: 'Could not send your message.' }, 502)
      : new Response('Sorry, that didn’t send. Please email francois@sgla.co.uk directly.', {
          status: 502,
        });
  }

  return wantsJson ? json({ ok: true }) : redirect('/thanks', 303);
};

export const GET: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
