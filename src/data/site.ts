/** Business facts used across the site. Change once, update everywhere. */
export const site = {
  name: 'SGLA',
  url: 'https://sgla.co.uk',
  tagline: 'Websites built properly. Without the agency.',
  description:
    'Fast, modern websites for independent businesses. Custom-built, performance-focused websites that you actually own.',
  email: 'francois@sgla.co.uk',
  location: 'Bury St Edmunds, Suffolk',
  founder: 'François',
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
