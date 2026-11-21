import { environment } from '@environments/environment';
import { FAQ_GROUPS } from './faq-content';

const site = environment.siteUrl;

export const FAQ_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${site}/faq#faq`,
  url: `${site}/faq`,
  inLanguage: 'sr-Latn',
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.join(' '),
      },
    })),
  ),
};
