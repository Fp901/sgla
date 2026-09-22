/**
 * Zoho CRM client. Server-only: creates a Lead from a contact form submission.
 *
 * Auth is OAuth2 with a long-lived refresh token. Access tokens last an hour,
 * so one is cached in module scope and reused across warm invocations of the
 * function rather than minted on every submission.
 */
import {
  ZOHO_ACCOUNTS_DOMAIN,
  ZOHO_API_DOMAIN,
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN,
} from 'astro:env/server';
import { normaliseWebsite, type ContactPayload } from './contact';

export const zohoConfigured = Boolean(ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET && ZOHO_REFRESH_TOKEN);

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Treat a token as stale a minute early so it can't expire mid-request. */
const TOKEN_SAFETY_MS = 60_000;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_SAFETY_MS) {
    return cachedToken.value;
  }

  const response = await fetch(`${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN!,
      client_id: ZOHO_CLIENT_ID!,
      client_secret: ZOHO_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  // Zoho returns HTTP 200 with an `error` key when the refresh token is bad,
  // so response.ok alone is not enough to tell success from failure.
  if (!response.ok || body.error || !body.access_token) {
    throw new Error(`Zoho token refresh failed: ${body.error ?? response.status}`);
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

/** Zoho requires Last_Name, so the trailing word becomes the surname. */
function splitName(full: string): { first?: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { last: parts[0]! };
  return { first: parts.slice(0, -1).join(' '), last: parts.at(-1)! };
}

async function zohoFetch(path: string, token: string, payload: unknown): Promise<Response> {
  return fetch(`${ZOHO_API_DOMAIN}/crm/v8${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

type ZohoRecordResult = {
  code?: string;
  status?: string;
  message?: string;
  details?: { id?: string; duplicate_record?: { id?: string } };
};

function firstResult(body: unknown): ZohoRecordResult {
  const data = (body as { data?: ZohoRecordResult[] })?.data;
  return Array.isArray(data) && data[0] ? data[0] : {};
}

/**
 * Adds the enquiry as a note on an existing lead. Used when Zoho's duplicate
 * check rejects the insert, so a repeat enquiry is never silently dropped.
 */
async function addNoteToLead(leadId: string, values: ContactPayload, token: string): Promise<void> {
  const response = await zohoFetch(`/Leads/${leadId}/Notes`, token, {
    data: [
      {
        Parent_Id: { module: { api_name: 'Leads' }, id: leadId },
        Note_Title: 'New website enquiry',
        Note_Content: [`Website: ${normaliseWebsite(values.website)}`, '', values.message].join(
          '\n',
        ),
      },
    ],
  });

  const result = firstResult(await response.json().catch(() => ({})));
  if (!response.ok || result.code !== 'SUCCESS') {
    throw new Error(`Zoho note failed: ${result.code ?? response.status} ${result.message ?? ''}`);
  }
}

/** Creates the Lead. Returns how it was recorded, for logging. */
export async function createLead(values: ContactPayload): Promise<'created' | 'noted'> {
  const token = await getAccessToken();
  const { first, last } = splitName(values.name);

  const response = await zohoFetch('/Leads', token, {
    data: [
      {
        ...(first ? { First_Name: first } : {}),
        Last_Name: last,
        Company: values.business,
        Email: values.email,
        Website: normaliseWebsite(values.website),
        Description: values.message,
        Lead_Source: 'Web Form',
      },
    ],
    trigger: ['workflow'], // lets the CRM workflow rule send the notification email
  });

  const body = await response.json().catch(() => ({}));
  const result = firstResult(body);

  if (result.code === 'SUCCESS') return 'created';

  // Repeat enquiry from an address already in the CRM: attach it to that lead.
  const duplicateId = result.details?.duplicate_record?.id;
  if (result.code === 'DUPLICATE_DATA' && duplicateId) {
    await addNoteToLead(duplicateId, values, token);
    return 'noted';
  }

  throw new Error(
    `Zoho lead failed: ${response.status} ${result.code ?? ''} ${result.message ?? JSON.stringify(body).slice(0, 200)}`,
  );
}
