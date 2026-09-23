/** Business facts used across the site. Change once, update everywhere. */
export const site = {
  name: 'SGLA',
  url: 'https://sgla.co.uk',
  tagline: 'Websites built properly. Without the agency.',
  description:
    'Fast, modern websites for independent businesses. Custom-built, performance-focused websites that you actually own.',
  /**
   * Where enquiries end up. Deliberately NOT rendered anywhere on the site:
   * contact goes through the form so the address stays off public pages.
   */
  email: 'francois@sgla.co.uk',
  location: 'Bury St Edmunds, Suffolk',
  /** Analytics. The GA4 measurement id is public: it appears in the page source. */
  analytics: {
    googleTagId: 'G-YVVP3YG0WX',
  },
  /** Public profiles, used for structured data (sameAs) entity linking. */
  profiles: {
    linkedin: 'https://www.linkedin.com/in/francois--pretorius',
  },
  /**
   * Registered company. Used for structured data only. The registered office
   * address is deliberately not published here: it is on the public register,
   * but it does not need repeating on the website.
   */
  company: {
    legalName: 'SGLA LTD',
    number: '16758759',
    incorporated: '2025-10-02',
    url: 'https://find-and-update.company-information.service.gov.uk/company/16758759',
  },
  founder: 'François Pretorius',
  /** Primary conversion action. Used for every main CTA. */
  cta: {
    label: 'Show me your website',
    href: '/contact',
  },
} as const;

export const pricing = {
  standard: {
    name: 'SGLA Website',
    price: '£1,795',
    timeline: '2–3 weeks',
    includes: [
      '5–8 pages',
      'Custom design',
      'Responsive development',
      'Performance optimisation',
      'Contact forms',
      'SEO foundations',
      'Analytics',
      'Redirects',
      'Deployment',
      'Full handover',
    ],
  },
  larger: {
    price: '£2,495',
  },
  care: {
    name: 'SGLA Care',
    price: '£79',
    period: 'month',
    includes: [
      'Hosting management',
      'Updates',
      'Technical maintenance',
      'Small content changes',
      'Support',
    ],
  },
} as const;

export const navigation = {
  main: [
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
  ],
  footer: [
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
} as const;

export type NavItem = { label: string; href: string };
