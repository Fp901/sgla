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
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'francois@sgla.co.uk',
      }),
      CONTACT_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'SGLA Website <onboarding@resend.dev>',
      }),
    },
  },
});
