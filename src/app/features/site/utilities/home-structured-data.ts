import { environment } from '@environments/environment';

const site = environment.siteUrl;

export const HOME_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      name: 'CodeWithMixx',
      url: `${site}/`,
      inLanguage: 'sr-Latn',
      publisher: { '@id': `${site}/#milan` },
    },
    {
      '@type': 'Person',
      '@id': `${site}/#milan`,
      name: 'Milan Nikolić',
      jobTitle: 'Softverski inženjer',
      description:
        'Softverski inženjer i master student na ITS-u. Radi u .NET i Angular tehnologijama, uz PostgreSQL bazu.',
      image: `${site}/profile.webp`,
      email: 'milan@codewithmixx.com',
      url: `${site}/`,
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'ITS, Informacione tehnologije' },
      knowsAbout: [
        '.NET',
        'C#',
        'Angular',
        'TypeScript',
        'MS SQL',
        'PostgreSQL',
        'Programiranje u C jeziku',
        'Objektno orijentisano programiranje',
        'Java',
        'Python',
        'Web programiranje',
        'Baze podataka',
      ],
      sameAs: [
        'https://www.instagram.com/codewithmixx',
        'https://github.com/Miks02',
        'https://my-personal-portfolio-website-7vh5.vercel.app/',
      ],
    },
    {
      '@type': 'Service',
      '@id': `${site}/#casovi`,
      name: 'Privatni časovi programiranja',
      serviceType: 'Privatni časovi programiranja i IT predmeta',
      description:
        'Individualni online časovi iz programiranja i IT predmeta za studente, rad 1 na 1 preko Google Meet-a ili Discorda. Prve konsultacije su besplatne.',
      provider: { '@id': `${site}/#milan` },
      availableLanguage: 'sr',
      availableChannel: {
        '@type': 'ServiceChannel',
        name: 'Online (Google Meet ili Discord)',
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Individualni čas',
          description:
            'Plaćaš čas po čas, bez obaveze da nastaviš. Hitan termin (sutra za prekosutra): +500 rsd.',
          price: '1300',
          priceCurrency: 'RSD',
        },
        {
          '@type': 'Offer',
          name: 'Paket časova (10 časova)',
          description:
            '950 rsd po času. Ceo paket se plaća unapred. Fokus na ispitu, rešavanje ispita iz prošlih godina i podrška putem poruka.',
          price: '9500',
          priceCurrency: 'RSD',
        },
      ],
    },
    {
      '@type': 'Service',
      '@id': `${site}/#radovi`,
      name: 'Pomoć oko seminarskih i diplomskih radova',
      description:
        'Pomoć pri savladavanju praktičnog dela, mentorisanje u toku rada, pomoć oko dokumentacije i priprema za odbranu rada.',
      provider: { '@id': `${site}/#milan` },
      availableLanguage: 'sr',
      offers: {
        '@type': 'Offer',
        description:
          'Cena zavisi od toga da li je rad seminarski ili diplomski, od složenosti, predmeta i preostalog roka.',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: '6000',
          maxPrice: '24000',
          priceCurrency: 'RSD',
        },
      },
    },
  ],
};
