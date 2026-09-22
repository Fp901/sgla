import type { APIRoute } from 'astro';
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { normaliseWebsite, validateContact, type ContactPayload } from '@lib/contact';

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

const stripLineBreaks = (value: string) => value.replace(/[\r\n]+/g, ' ');

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

function buildEmail(values: ContactPayload) {
  const website = normaliseWebsite(values.website);
  const subject = `Website review: ${stripLineBreaks(values.business)}`;

  const text = [
    `Name: ${values.name}`,
    `Business: ${values.business}`,
    `Email: ${values.email}`,
    `Website: ${website}`,
    '',
    "What isn't working:",
    values.message,
  ].join('\n');

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(values.name)}</p>
    <p><strong>Business:</strong> ${escapeHtml(values.business)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(values.email)}">${escapeHtml(values.email)}</a></p>
    <p><strong>Website:</strong> <a href="${escapeHtml(website)}">${escapeHtml(website)}</a></p>
    <p><strong>What isn't working:</strong></p>
    <p>${escapeHtml(values.message).replace(/\n/g, '<br>')}</p>
  `;

  return { subject, text, html };
}

async function sendEmail(values: ContactPayload): Promise<void> {
  const { subject, text, html } = buildEmail(values);

  if (!RESEND_API_KEY) {
    if (import.meta.env.DEV) {
      console.info('[contact] RESEND_API_KEY not set, submission logged instead:\n' + text);
      return;
    }
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: values.email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`);
  }
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
    await sendEmail(values);
  } catch (error) {
    console.error('[contact] send failed:', error);
    return wantsJson
      ? json({ ok: false, message: 'Could not send your message.' }, 502)
      : new Response('Sorry, that didn’t send. Please email francois@sgla.co.uk directly.', {
          status: 502,
        });
  }

  return wantsJson ? json({ ok: true }) : redirect('/thanks', 303);
};

export const GET: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
