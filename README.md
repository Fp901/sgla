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
| Form email | [Resend](https://resend.com) via `fetch` | No SDK dependency; API key stays server-side |
| Analytics | Vercel Web Analytics | Cookieless; one script, production only |
| Hosting | Vercel | Git-connected: `main` → production, other branches → previews |

Every page is prerendered to static HTML. The only on-demand code is `src/pages/api/contact.ts`,
which is why `@astrojs/vercel` is installed.

## Local development

```bash
npm install
cp .env.example .env     # optional: without RESEND_API_KEY, submissions are logged to the console
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
| `RESEND_API_KEY` | Yes (production) | Sends contact form submissions. Without it, production submissions fail gracefully with a "please email directly" message; dev logs them instead. |
| `CONTACT_TO_EMAIL` | No | Where submissions go. Default `francois@sgla.co.uk`. |
| `CONTACT_FROM_EMAIL` | No | Sender. Default `SGLA Website <onboarding@resend.dev>` (Resend's test sender). Change to an address on a verified domain, e.g. `SGLA Website <hello@sgla.co.uk>`. |

All three are server-only (`astro:env/server`) and never reach the browser.

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
3. **Environment variables** (Settings → Environment Variables): add `RESEND_API_KEY` for Production (and Preview if you want previews to send real email). Optionally `CONTACT_FROM_EMAIL`.
4. Deploy. Pushes to `main` go to production; every other branch/PR gets a preview URL.
5. **Analytics**: Project → Analytics → Enable. The script is already in the layout.

### Domain

- Settings → Domains → add `sgla.co.uk` and `www.sgla.co.uk`.
- Recommended: make `sgla.co.uk` the primary and set `www` to redirect to it (Vercel does this when you mark one as the redirect target). `astro.config.ts` has `site: 'https://sgla.co.uk'`, so canonicals and the sitemap already use the apex.
- Point DNS at Vercel as instructed in that screen (A record `76.76.21.21` for the apex, CNAME `cname.vercel-dns.com` for `www`, or use Vercel nameservers). HTTPS is automatic.

### Email sending (Resend)

1. Create a Resend account and an API key → `RESEND_API_KEY`.
2. Add and verify `sgla.co.uk` in Resend (SPF/DKIM DNS records).
3. Set `CONTACT_FROM_EMAIL` to an address on that domain.
4. Submit the live form once and confirm it lands in `francois@sgla.co.uk`.

### After the first deploy, check

- `curl -I https://sgla.co.uk` shows the security headers from `vercel.json`.
- `https://sgla.co.uk/sitemap-index.xml` and `/robots.txt` resolve.
- A test form submission arrives.
- Share the URL in Slack/WhatsApp to confirm the OG image renders.

## Known notes

- `npm audit` reports `path-to-regexp` via `@vercel/routing-utils`, a build-time dependency of the Vercel adapter. It does not ship to the browser or run at request time; it will clear when Vercel updates their package.
- `/privacy` and `/terms` describe how the site actually works but are marked as drafts and have not been reviewed by a solicitor.
- `/about` has a clearly marked placeholder for François's background paragraph.
