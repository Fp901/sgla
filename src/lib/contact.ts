/**
 * Contact form schema and validation.
 * Shared by the browser (inline feedback) and the API route (authoritative check).
 * No dependencies so it stays tiny on the client.
 */

export const contactFields = ['name', 'business', 'email', 'website', 'message'] as const;
export type ContactField = (typeof contactFields)[number];

export type ContactPayload = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const limits = {
  name: 120,
  business: 160,
  email: 254,
  website: 300,
  message: 4000,
} as const satisfies Record<ContactField, number>;

/** Pragmatic email check: something@something.tld, no spaces. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts "example.com", "www.example.com" or a full URL. */
const WEBSITE_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export function normaliseWebsite(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function validateContact(data: Partial<Record<ContactField, unknown>>): {
  values: ContactPayload;
  errors: ContactErrors;
} {
  const values = Object.fromEntries(
    contactFields.map((key) => [key, typeof data[key] === 'string' ? data[key].trim() : '']),
  ) as ContactPayload;

  const errors: ContactErrors = {};

  if (!values.name) errors.name = 'Please add your name.';
  else if (values.name.length > limits.name) errors.name = 'That name is a little long.';

  if (!values.business) errors.business = 'Please add your business name.';
  else if (values.business.length > limits.business)
    errors.business = 'That name is a little long.';

  if (!values.email) errors.email = 'Please add your email so I can reply.';
  else if (values.email.length > limits.email || !EMAIL_RE.test(values.email))
    errors.email = "That email address doesn't look right.";

  if (!values.website) errors.website = 'Please add your current website address.';
  else if (values.website.length > limits.website || !WEBSITE_RE.test(values.website))
    errors.website = 'Please enter a web address, like example.co.uk.';

  if (!values.message) errors.message = "Tell me a little about what isn't working.";
  else if (values.message.length > limits.message)
    errors.message = `Please keep this under ${limits.message} characters.`;

  return { values, errors };
}
