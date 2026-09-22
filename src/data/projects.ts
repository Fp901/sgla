import type { ImageMetadata } from 'astro';
import rooibergImage from '@assets/work/rooiberg-wander.png';
import ferryImage from '@assets/work/ferry-cafe.png';
import commercialTradesImage from '@assets/work/commercial-trades-jobs.png';

export interface Project {
  /** URL-safe identifier, used for anchors. */
  slug: string;
  name: string;
  /** e.g. "Photography", "Architecture practice". */
  category: string;
  /** One line. What it is and what changed. */
  description: string;
  image: ImageMetadata;
  imageAlt: string;
  /** Live site. Omit if the site isn't public yet. */
  url?: string;
  /** Optional, shown as small labels. */
  technologies?: string[];
}

/**
 * Only real, launched work belongs here. Do not add invented case studies.
 *
 * To add a project:
 *  1. Drop a screenshot in src/assets/work/ (1600×1000 works well; PNG or JPG).
 *  2. Import it above and add an entry below.
 *  3. Homepage shows the first three; /work shows all of them.
 */
export const projects: Project[] = [
  {
    slug: 'rooiberg-wander',
    name: 'Rooiberg Wander',
    category: 'Walking safari, Limpopo',
    description:
      'A three-day guided walking safari in the Waterberg. Booking-led site built to load fast over patchy rural connections and to sell the trail on photography.',
    image: rooibergImage,
    imageAlt:
      'The Rooiberg Wander homepage, showing a sunset over the Waterberg with the headline "Three Days. The Big Five. On Foot."',
    url: 'https://rooibergwander.com',
    technologies: ['Astro', 'Vercel'],
  },
  {
    slug: 'ferry-cafe',
    name: 'The Ferry Café',
    category: 'Café, Felixstowe Ferry',
    description:
      'Fish and chips by the River Deben since 1953. Menu, opening hours and directions, ships no JavaScript at all.',
    image: ferryImage,
    imageAlt:
      'The Ferry Café homepage, showing the blue timber café building under a bright sky with the headline "The Ferry Café".',
    url: 'https://theferry.cafe',
    technologies: ['Astro', 'Tailwind', 'Cloudflare'],
  },
  {
    slug: 'commercial-trades-jobs',
    name: 'Commercial Trades Jobs',
    category: 'Job board, UK',
    description:
      'A specialist job board for commercial FM engineers. Search, filtering, job alerts and employer listings, rather than a brochure site with a contact form.',
    image: commercialTradesImage,
    imageAlt:
      'The Commercial Trades Jobs homepage, showing the headline "UK Commercial FM Engineering Jobs" above a job search form.',
    url: 'https://commercialtradesjobs.co.uk',
    technologies: ['Next.js', 'Tailwind', 'Cloudflare'],
  },
];

export const featuredProjects = projects.slice(0, 3);
