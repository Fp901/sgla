import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/**
 * Static site by default. The Vercel adapter is present only so that the
 * single contact endpoint (src/pages/api/contact.ts) can run on-demand;
 * every page is still prerendered to static HTML.
 */
export default defineConfig({
  site: 'https://sgla.co.uk',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // Keep noindex pages out of the sitemap.
      filter: (page) => !/\/(404|thanks)$/.test(page),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  env: {
    schema: {
      // Zoho CRM (server-only). Without these the contact endpoint refuses to
      // send and tells the visitor to email directly, rather than failing silently.
      ZOHO_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      ZOHO_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      ZOHO_REFRESH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Data centre. UK/EU accounts use the .eu domains; change both if yours differ.
      ZOHO_ACCOUNTS_DOMAIN: envField.string({
        context: 'server',
        access: 'secret',
        default: 'https://accounts.zoho.eu',
      }),
      ZOHO_API_DOMAIN: envField.string({
        context: 'server',
        access: 'secret',
        default: 'https://www.zohoapis.eu',
      }),
    },
  },
});
