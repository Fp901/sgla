import type { APIRoute } from 'astro';
import { pricing, site } from '@data/site';
import { projects } from '@data/projects';
import { faq } from '@data/faq';

/**
 * /llms.txt: a plain-text summary for language models, following the
 * llmstxt.org convention. Generated from the same data files as the pages,
 * so it cannot drift out of date.
 *
 * Adoption of this convention is still uncertain, but it costs one small
 * static file and states the facts plainly for anything that does read it.
 */
export const GET: APIRoute = () => {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.tagline} ${site.description}`,
    '',
    `${site.name} is ${site.founder}, an independent web developer based in ${site.location},`,
    'working with independent and owner-led businesses across the United Kingdom.',
    'There is no agency and no team: one developer designs, builds and launches the site,',
    'then hands over the domain, hosting and code so the client owns everything.',
    '',
    '## What SGLA does',
    '',
    '- Rebuilds outdated, slow or restrictive websites from scratch',
    '- Builds new custom websites for businesses starting from nothing',
    '- Performance and mobile optimisation, built in rather than sold as an extra',
    '- Technical and on-page SEO foundations, redirects from old URLs',
    '- Contact forms and lightweight, privacy-conscious analytics',
    '- Full handover of domain, hosting and code',
    '',
    'SGLA does not work inside Wix, Squarespace or similar site builders, does not sell',
    'ongoing SEO retainers, and does not do social media management. Where an existing site',
    'needs significant work, the usual recommendation is to rebuild it.',
    '',
    '## Pricing',
    '',
    `- Standard website: ${pricing.standard.price} for ${pricing.standard.includes[0]}, typically ${pricing.standard.timeline}`,
    `- Larger or more complex websites: from ${pricing.larger.price}`,
    `- ${pricing.care.name} (optional): ${pricing.care.price} per ${pricing.care.period} for hosting management, updates and small changes`,
    '',
    `Included in the standard price: ${pricing.standard.includes.join(', ')}.`,
    '',
    '## Selected work',
    '',
    ...projects.flatMap((p) => [
      `### ${p.name}`,
      '',
      `${p.category}. ${p.description}`,
      ...(p.challenge ? [`The challenge: ${p.challenge}`] : []),
      ...(p.rebuild ? [`The rebuild: ${p.rebuild}`] : []),
      ...(p.url ? [p.url] : []),
      '',
    ]),
    '',
    '## Pages',
    '',
    `- [Home](${site.url}/): overview, pricing and process`,
    `- [Work](${site.url}/work): selected projects`,
    `- [Services](${site.url}/services): what is and is not offered`,
    `- [About](${site.url}/about): background of the developer`,
    `- [Contact](${site.url}/contact): send a current website for review`,
    '',
    '## Common questions',
    '',
    ...faq.flatMap((item) => [`### ${item.question}`, '', item.answer, '']),
    '## About the business',
    '',
    `${site.company.legalName} is a company registered in England and Wales,`,
    `number ${site.company.number}, incorporated ${site.company.incorporated}.`,
    `Register entry: ${site.company.url}`,
    `LinkedIn: ${site.profiles.linkedin}`,
    '',
    '## Contact',
    '',
    `Enquiries go through the contact form at ${site.url}/contact.`,
    'Send an existing website address and a note about what is not working, and you get',
    'an honest answer on whether it is worth rebuilding.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
