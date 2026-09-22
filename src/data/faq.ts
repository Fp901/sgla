export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: 'Do I have to use Wix?',
    answer:
      "No. SGLA doesn't work inside Wix or Squarespace. If the existing site needs significant work, the usual solution is to rebuild it.",
  },
  {
    question: 'Do I own the website?',
    answer: 'Yes. The domain, hosting and code belong to you.',
  },
  {
    question: 'Can you redesign my existing website?',
    answer: 'Yes. The normal process is to rebuild it rather than patching an old platform.',
  },
  {
    question: 'How much does a website cost?',
    answer: 'The standard SGLA website is £1,795 for 5–8 pages. Larger projects start from £2,495.',
  },
  {
    question: 'How long does it take?',
    answer: 'Most standard projects are targeted for 2–3 weeks, depending on content and feedback.',
  },
  {
    question: 'Do you provide hosting?',
    answer:
      'The website can be deployed to hosting under your ownership. SGLA can manage the technical side if you want.',
  },
  {
    question: 'What if I need changes later?',
    answer:
      'You can make arrangements directly with SGLA or have another developer work with the code.',
  },
  {
    question: 'Do you provide SEO?',
    answer:
      'Every website includes sensible technical and on-page SEO foundations. SGLA is not selling an ongoing SEO agency service as part of the standard website.',
  },
];
