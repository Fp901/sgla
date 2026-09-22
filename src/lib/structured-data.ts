import { site } from '@data/site';
import type { FaqItem } from '@data/faq';

/** Organisation record. Factual only: no ratings, reviews or awards. */
export const organisation = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#organisation`,
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bury St Edmunds',
    addressRegion: 'Suffolk',
    addressCountry: 'GB',
  },
  areaServed: { '@type': 'Country', name: 'United Kingdom' },
  knowsAbout: ['Web design', 'Web development', 'Website rebuilds', 'Website performance'],
};

export const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  name: site.name,
  url: site.url,
  publisher: { '@id': `${site.url}/#organisation` },
};

export const faqPage = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});
