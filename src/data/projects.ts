import type { ImageMetadata } from 'astro';
import sglaImage from '@assets/work/sgla.png';

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
    slug: 'sgla',
    name: 'SGLA',
    category: 'Independent web development',
    description:
      'This site. Static-first, no client framework, self-hosted fonts, one serverless function for the form.',
    image: sglaImage,
    imageAlt:
      'The SGLA homepage on a desktop browser, showing the headline "Websites built properly. Without the agency."',
    url: 'https://sgla.co.uk',
    technologies: ['Astro', 'TypeScript', 'Vercel'],
  },
];

export const featuredProjects = projects.slice(0, 3);
