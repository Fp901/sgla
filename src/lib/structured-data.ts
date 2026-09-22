import { pricing, site } from '@data/site';
import type { FaqItem } from '@data/faq';

/** Organisation record. Factual only: no ratings, reviews or awards. */
export const organisation = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#organisation`,
  name: site.name,
  legalName: site.company.legalName,
  url: site.url,
  description: site.description,
  foundingDate: site.company.incorporated,
  // Links the site to the public register, so the business can be verified
  // as a real registered entity rather than an unattributed page.
  sameAs: [site.company.url, site.profiles.linkedin],
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Companies House company number',
    value: site.company.number,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bury St Edmunds',
    addressRegion: 'Suffolk',
    addressCountry: 'GB',
  },
  // Specific places as well as the country: these are the terms people
  // actually ask about ("web developer in Suffolk").
  areaServed: [
    { '@type': 'City', name: 'Bury St Edmunds' },
    { '@type': 'AdministrativeArea', name: 'Suffolk' },
    { '@type': 'AdministrativeArea', name: 'East of England' },
    { '@type': 'Country', name: 'United Kingdom' },
  ],
  priceRange: `${pricing.standard.price} - ${pricing.larger.price}`,
  currenciesAccepted: 'GBP',
  founder: {
    '@type': 'Person',
    '@id': `${site.url}/#founder`,
    name: site.founder,
    jobTitle: 'Web developer',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Suffolk' },
    sameAs: [site.profiles.linkedin],
  },
  knowsAbout: [
    'Web design',
    'Web development',
    'Website rebuilds',
    'Website performance',
    'Core Web Vitals',
    'Responsive design',
    'Technical SEO',
    'Website accessibility',
    'Astro',
    'Small business websites',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Website services',
    itemListElement: [
      {
        '@type': 'Offer',
        name: pricing.standard.name,
        description: `A custom-built ${pricing.standard.includes[0]} website, designed, developed and handed over. Typical project ${pricing.standard.timeline}.`,
        price: pricing.standard.price.replace(/[^0-9.]/g, ''),
        priceCurrency: 'GBP',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom website design and development',
          serviceType: 'Web design and development',
          provider: { '@id': `${site.url}/#organisation` },
        },
      },
      {
        '@type': 'Offer',
        name: 'Larger website',
        description: `Larger or more complex websites, from ${pricing.larger.price}.`,
        price: pricing.larger.price.replace(/[^0-9.]/g, ''),
        priceCurrency: 'GBP',
        eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 1 },
      },
      {
        '@type': 'Offer',
        name: pricing.care.name,
        description:
          'Optional monthly plan covering hosting management, updates, maintenance and small content changes.',
        price: pricing.care.price.replace(/[^0-9.]/g, ''),
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: pricing.care.price.replace(/[^0-9.]/g, ''),
          priceCurrency: 'GBP',
          billingIncrement: 1,
          unitCode: 'MON',
        },
      },
    ],
  },
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
