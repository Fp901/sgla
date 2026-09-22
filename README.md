# SGLA (sgla.co.uk)

Marketing website for SGLA. Astro 7, TypeScript, plain CSS, deployed on Vercel.

> **Websites built properly. Without the agency.**

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | [Astro](https://astro.build) 7 | Static HTML by default, zero client JS unless a component asks for it |
| Language | TypeScript (strict) | `astro check` runs against every `.astro` file |
| Styling | Plain CSS with custom properties | No framework; tokens live in `src/styles/global.css` |
| Colour | Navy ramp generated from `#002966` | Tailwind-style 50, 950 steps, built in OKLCH so the steps are perceptually even |
| Fonts | Inter via Astro's Fonts API | Downloaded at build, self-hosted, subset to latin, preloaded |
| Images | `astro:assets` + sharp | Responsive `srcset`, WebP, dimensions set (no layout shift) |
| Form handling | Zoho CRM REST API via `fetch` | No SDK dependency; creates a Lead, secrets stay server-side |
| Analytics | Vercel Web Analytics | Cookieless; one script, production only |
| Hosting | Vercel | Git-connected: `main` → production, other branches → previews |

Every page is prerendered to static HTML. The only on-demand code is `src/pages/api/contact.ts`,
which is why `@astrojs/vercel` is installed.

## Local development

```bash
npm install
cp .env.example .env     # optional: without Zoho credentials, submissions are logged to the console
npm run dev              # http://localhost:4321
```

Other scripts:

```bash
npm run build     # production build → dist/ and .vercel/output/
npm run preview   # serve the production build
npm run check     # TypeScript + Astro diagnostics
```

Astro 7's dev server runs detached; `npx astro dev logs` shows server-side output (including
logged form submissions when no API key is set).

## Project structure

```
src/
├── components/     Reusable UI (Button, Header, Footer, Hero, Pillars, ProblemSection,
│                   SolutionSection, ProjectCard, OwnershipSection, Process, PricingCard,
│                   CarePlan, FAQ, ContactForm, FinalCTA, SectionHeading, PageIntro, Seo, Arrow)
├── layouts/        BaseLayout (head, header, footer, analytics) and LegalLayout
├── pages/          One file per route + api/contact.ts
├── data/           site.ts (business facts, pricing, nav), projects.ts, faq.ts
├── lib/            contact.ts (shared validation), structured-data.ts (JSON-LD)
├── styles/         global.css, design tokens, reset, layout primitives
└── assets/work/    Project screenshots (processed by astro:assets)
public/             favicon, OG image, robots.txt, manifest
```

### Changing business facts

Prices, email, location, nav and CTA copy all live in `src/data/site.ts`. FAQ copy is in
`src/data/faq.ts`. Change them once and every page updates.

### Logo

The wordmark lives in `src/components/Logo.astro` as SVG outlines (Space Grotesk Bold,
converted to paths). It is not live text, so the logo needs no second webfont and never
reflows while one loads. Letters use `currentColor` and the full stop uses `--color-accent`,
so the mark inverts correctly inside `.theme-dark` without a second asset.

`public/favicon.svg` is the matching square mark, an `S` plus the same stop on a navy tile;
the `.ico` and PNG icons are generated from it.

### Colour

The palette is a Tailwind-style 50, 950 ramp generated in OKLCH from the brand navy `#002966`
(which sits at step 900), exposed as `--navy-50` through `--navy-950` in `src/styles/global.css`.
Semantic tokens (`--color-ink`, `--color-accent`, `--color-surface`, ...) point at those steps, so
re-anchoring the ramp on a different brand colour re-themes the whole site.

Greys are not neutral: text, muted text, borders and surfaces all carry a little of the navy hue
so they read as one family. Every text/background pair on every page was measured at WCAG AA or
better.

### Adding a project

1. Put a screenshot in `src/assets/work/` (1600×1000 works well).
2. Import it in `src/data/projects.ts` and add an entry. Only real, launched work, no invented case studies.
3. The homepage shows the first three; `/work` shows all.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ZOHO_CLIENT_ID` | Yes (production) | Self Client ID from the Zoho API Console. |
| `ZOHO_CLIENT_SECRET` | Yes (production) | Self Client secret. |
| `ZOHO_REFRESH_TOKEN` | Yes (production) | Long-lived refresh token; access tokens are minted from it and cached in memory. |
| `ZOHO_ACCOUNTS_DOMAIN` | No | OAuth domain. Defaults to `https://accounts.zoho.eu` (UK/EU accounts). |
| `ZOHO_API_DOMAIN` | No | API domain. Defaults to `https://www.zohoapis.eu`. Must match the accounts domain. |

Without the three credentials, production submissions fail gracefully with a "please email
directly" message; local development logs them to the console instead.

All of these are server-only (`astro:env/server`) and never reach the browser.

## Contact form

- Progressive: works as a plain HTML POST without JavaScript (server redirects to `/thanks`),
  and with JavaScript validates inline and shows success/error states in place.
- Validation rules are shared between browser and server in `src/lib/contact.ts`; the server check is authoritative.
- Spam: honeypot field + minimum fill time. Bot submissions get a fake "success" so they learn nothing.
- Astro's built-in CSRF origin check rejects cross-site POSTs.
- If sending fails the visitor is told to email directly; the error is logged server-side.

If spam becomes a problem, the next step is Cloudflare Turnstile (verify the token in `api/contact.ts` before sending).

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset is detected as Astro; no build settings need changing.
3. **Environment variables** (Settings → Environment Variables): add `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` and `ZOHO_REFRESH_TOKEN` for Production (and Preview if you want preview deploys to write real leads).
4. Deploy. Pushes to `main` go to production; every other branch/PR gets a preview URL.
5. **Analytics**: Project → Analytics → Enable. The script is already in the layout.

### Domain

- Settings → Domains → add `sgla.co.uk` and `www.sgla.co.uk`.
- Recommended: make `sgla.co.uk` the primary and set `www` to redirect to it (Vercel does this when you mark one as the redirect target). `astro.config.ts` has `site: 'https://sgla.co.uk'`, so canonicals and the sitemap already use the apex.
- Point DNS at Vercel as instructed in that screen (A record `76.76.21.21` for the apex, CNAME `cname.vercel-dns.com` for `www`, or use Vercel nameservers). HTTPS is automatic.

### Zoho CRM setup

Submissions are created as **Leads** in Zoho CRM. Notification email is handled by a CRM
workflow rule rather than a separate email service, so there is no second vendor to configure.

**1. Create a Self Client** at [api-console.zoho.eu](https://api-console.zoho.eu) (use
`.eu` for a UK/EU Zoho account, `.com` for US). Choose **Self Client** → Create. Note the
**Client ID** and **Client Secret**.

**2. Generate a grant token.** On the Self Client's *Generate Code* tab enter:

- Scope: `ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.notes.CREATE`
- Time duration: 10 minutes
- Scope description: anything

If this errors with *"You are not a part of any CRM service orgs"*, the account has no Zoho CRM
organisation yet. Open `crm.zoho.eu`, set one up (the free edition is enough), then try again. If
that URL redirects you to `crm.zoho.com`, your account is on the US data centre, so use
`api-console.zoho.com` instead and pick `com` in the next step.

**3. Exchange the code for a refresh token.** The code is single-use and expires in minutes, so
run this straight away:

```bash
node scripts/zoho-token.mjs
```

It asks for the data centre, Client ID, Client Secret and the code, exchanges them, and writes
`.env` with `0600` permissions. It won't overwrite an existing `.env` that already has Zoho
values; it writes `.env.zoho.new` instead. The refresh token it returns is long-lived, so this is
a one-off unless the token is revoked.

**4. Set up the notification email** in Zoho CRM: *Setup → Automation → Workflow Rules → Create
Rule*, module **Leads**, execute on **Create**, condition `Lead Source is Web Form`, action
**Email Notification** to `francois@sgla.co.uk`. The site sends `trigger: ["workflow"]` with each
lead so the rule fires.

**5. Data centre.** If your Zoho account is not on the EU data centre, set `ZOHO_ACCOUNTS_DOMAIN`
and `ZOHO_API_DOMAIN` together (for example `https://accounts.zoho.com` and
`https://www.zohoapis.com`). A mismatch is the usual cause of `INVALID_TOKEN` errors.

**Repeat enquiries.** If someone enquires twice from the same address, Zoho's duplicate check
rejects the second lead. The site handles this by attaching the new message as a **Note** on the
existing lead, so nothing is lost.

### After the first deploy, check

- `curl -I https://sgla.co.uk` shows the security headers from `vercel.json`.
- `https://sgla.co.uk/sitemap-index.xml` and `/robots.txt` resolve.
- A test form submission appears as a Lead in Zoho CRM and the workflow email arrives.
- Share the URL in Slack/WhatsApp to confirm the OG image renders.

## Known notes

- `npm audit` reports `path-to-regexp` via `@vercel/routing-utils`, a build-time dependency of the Vercel adapter. It does not ship to the browser or run at request time; it will clear when Vercel updates their package.
- `/privacy` and `/terms` describe how the site actually works but are marked as drafts and have not been reviewed by a solicitor.
- `/about` has a clearly marked placeholder for François's background paragraph.
