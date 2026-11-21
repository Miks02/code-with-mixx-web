import { FaqGroup } from '../models/faq';


export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'classes',
    title: 'Časovi',
    items: [
      {
        question: 'Ko drži časove?',
        answer: [
          'Ja, Milan Nikolić, softverski inženjer i master student na ITS-u. Radim u .NET i Angular tehnologijama, uz PostgreSQL bazu. Iza sajta nema tima, pa sa svakim studentom radim lično.',
        ],
        link: { label: 'Moja priča', path: '/', fragment: 'my-story' },
      },
      {
        question: 'Da li su prve konsultacije besplatne?',
        answer: [
          'Jesu. Na prvom razgovoru prolazimo šta ti treba, koje gradivo radiš i do kada, pa tek onda dogovaramo časove. Ništa se ne plaća dok se ne dogovorimo.',
        ],
      },
      {
        question: 'Gde se održavaju časovi?',
        answer: [
          'Online, preko Google Meet-a ili Discorda. Treba ti računar, stabilna veza i mikrofon.',
        ],
      },
      {
        question: 'Koliko traje jedan čas?',
        answer: ['Do 45 minuta. Ako ti treba više vremena, više časova može da se zakaže u nizu.'],
      },
      {
        question: 'Kako se zakazuje termin?',
        answer: [
          'Pošalji upit preko kontakt forme ili mi piši na mejl, Discord ili Instagram. Termin dogovaramo porukom, a čas je zakazan kada ga potvrdim i upišem kao rezervaciju.',
          'Dostupan sam za konsultacije svakog radnog dana i na poruke odgovaram u roku od 30 do 60 minuta.',
        ],
        link: { label: 'Kontakt forma', path: '/', fragment: 'contact' },
      },
      {
        question: 'Iz kojih predmeta držiš časove?',
        answer: [
          'Najčešće su to osnove programiranja u C-u, objektno orijentisano programiranje (Java, C#, C++), web razvoj i baze podataka, ali spisak je duži. Nazivi predmeta se razlikuju od fakulteta do fakulteta, pa svoj predmet traži po temama, a ne po imenu.',
        ],
        link: { label: 'Spisak predmeta', path: '/subjects' },
      },
      {
        question: 'Da li garantuješ da ću položiti ispit?',
        answer: [
          'Ne mogu. Radimo na zadacima kakvi dolaze na kolokvijumu i ispitu, ali ishod zavisi i od tvog rada između časova, a o ocenama odlučuju fakultet i profesor.',
        ],
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Cene i plaćanje',
    items: [
      {
        question: 'Koliko košta jedan čas?',
        answer: ['1.300 rsd po času. Plaćaš čas po čas, bez obaveze da nastaviš.'],
        link: { label: 'Cenovnik', path: '/', fragment: 'pricing' },
      },
      {
        question: 'Šta je hitan termin?',
        answer: ['Čas koji zakazuješ sutra za prekosutra. Na redovnu cenu se tada dodaje 500 rsd.'],
      },
      {
        question: 'Šta dobijam paketom od 10 časova?',
        answer: [
          'Paket košta 9.500 rsd, odnosno 950 rsd po času, što je 3.500 rsd manje nego deset pojedinačnih časova. Fokus je na ispitu: rešavamo ispite iz prošlih godina, a između časova imaš podršku putem poruka.',
          'Ceo paket se plaća unapred, pre prvog časa.',
        ],
      },
      {
        question: 'Kako se plaća?',
        answer: [
          'Isključivo uplatom na račun, posle dogovora. Preko sajta se ne plaća ništa, pa podatke o tvojoj kartici ili računu nemam.',
        ],
      },
    ],
  },
  {
    id: 'cancellation',
    title: 'Otkazivanje i povraćaj',
    items: [
      {
        question: 'Mogu li da otkažem ili pomerim čas?',
        answer: [
          'Možeš, bez ikakvih posledica, ako mi javiš najkasnije 24 sata pre termina. Dovoljna je poruka ili mejl.',
        ],
      },
      {
        question: 'Šta ako otkažem kasnije ili ne dođem?',
        answer: [
          'Čas se tada računa kao otkazan. U zavisnosti od toga šta se dogovorimo, pomeram ga na novi termin ili ga brišem iz rezervacije.',
          'Ako je to jedini čas u rezervaciji, a ti javiš da ne želiš novi termin ili se ne javiš uopšte, cela rezervacija se vodi kao otkazana.',
        ],
      },
      {
        question: 'Šta ako ti otkažeš čas?',
        answer: [
          'Javljam ti čim saznam da ne mogu da ga održim i dogovaramo novi termin koji ti odgovara.',
        ],
      },
      {
        question: 'Da li mi vraćaš novac ako odustanem od paketa?',
        answer: [
          'Ako odustaneš pre prvog časa, vraćam ti ceo uplaćeni iznos. Ako su neki časovi održani, svaki se računa po punoj ceni od 1.300 rsd, a ostatak uplate ti vraćam.',
          'Primer: posle četiri održana časa vraćam ti 9.500 − 4 × 1.300 = 4.300 rsd. Posle osam ili više održanih časova nema ostatka za povraćaj.',
        ],
        link: { label: 'Uslovi korišćenja', path: '/terms-of-service', fragment: 'refunds' },
      },
    ],
  },
  {
    id: 'projects',
    title: 'Seminarski i diplomski radovi',
    items: [
      {
        question: 'Koliko košta pomoć oko seminarskog ili diplomskog rada?',
        answer: [
          'Od 6.000 do 24.000 rsd. Cena zavisi od toga da li je rad seminarski ili diplomski, od složenosti, predmeta i preostalog roka. Tačnu cenu i iznos avansa dogovaramo pre nego što počnemo.',
          'Avans se plaća pre početka rada, a ostatak na kraju.',
        ],
      },
      {
        question: 'Šta tačno dobijam?',
        answer: [
          'Pomoć da savladaš praktični deo, mentorisanje dok radiš, pomoć oko dokumentacije i pripremu za odbranu. Prolazak kroz realne primere.',
        ],
      },
      {
        question: 'Da li ti radiš rad umesto mene?',
        answer: [
          'Ne. Rad je tvoj: ti ga predaješ i braniš, pa ti odgovaraš i za to da bude u skladu sa pravilima tvog fakulteta. Cilj je da razumeš svaki deo koda koji predaješ.',
        ],
      },
      {
        question: 'Šta mi treba da bismo stigli na vreme?',
        answer: [
          'Rok dogovaramo unapred i on utiče na cenu. Da bih ga ispoštovao, treba mi da na vreme pošalješ temu, zahteve i materijale sa fakulteta.',
        ],
      },
      {
        question: 'Šta ako odustanem kada je rad već počet?',
        answer: ['Avans se ne vraća, jer pokriva ono što je do tada urađeno.'],
      },
    ],
  },
  {
    id: 'account',
    title: 'Nalog i privatnost',
    items: [
      {
        question: 'Kako da otvorim nalog?',
        answer: [
          'Registracija nije otvorena. Nalog ti otvaram ja kada se dogovorimo, a na mejl ti stiže pozivnica koja važi 7 dana. Lozinku biraš ti i u bazi je samo njen heš, pa je ni ja ne mogu pročitati.',
        ],
      },
      {
        question: 'Šta mogu da radim u studentskom panelu?',
        answer: [
          'Studentski panel je još u izradi. Do tada naloge, rezervacije i uplate vodim ja, a ako nešto u tvojim podacima treba da se promeni, samo mi piši.',
        ],
      },
      {
        question: 'Šta ako zaboravim lozinku?',
        answer: [
          'Na stranici za prijavu izaberi zaboravljenu lozinku i na mejl ti stiže link za reset. Link važi 1 sat.',
        ],
        link: { label: 'Zaboravljena lozinka', path: '/auth/forgot-password' },
      },
      {
        question: 'Koje podatke o meni prikupljaš?',
        answer: [
          'Samo ono što ostaviš u kontakt formi i ono što je potrebno da bismo održali časove: ime, prezime, kontakt, rezervacije i evidenciju uplata. Nema reklama, analitike ni praćenja, a podatke ne prodajem i ne dajem nikome radi marketinga.',
        ],
        link: { label: 'Politika privatnosti', path: '/privacy-policy', fragment: 'data' },
      },
      {
        question: 'Da li sajt koristi kolačiće?',
        answer: [
          'Samo tri, i sva tri služe isključivo za prijavu. Ako samo čitaš sajt ili pošalješ upit, ne dobijaš nijedan, zato nema ni banera za pristanak.',
        ],
        link: { label: 'Kolačići', path: '/privacy-policy', fragment: 'cookies' },
      },
      {
        question: 'Kako da obrišem svoje podatke?',
        answer: [
          'Jednim mejlom. Odgovaram najkasnije u roku od 1 dan i to ne naplaćujem. Ako nemaš nijednu rezervaciju, nalog se briše u potpunosti. Ako ih ima, uklanjam ime, prezime i kontakt, a ostaje samo evidencija časova i uplata koja više ne nosi tvoje ime (anonimizacija).',
        ],
        link: { label: 'Tvoja prava', path: '/privacy-policy', fragment: 'rights' },
      },
    ],
  },
];
