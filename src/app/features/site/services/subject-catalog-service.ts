import { Service } from '@angular/core';
import { CatalogSubject, SubjectArea, SubjectGroup } from '../models/catalog-subject';

const AREA_NOTES: Record<SubjectArea, string> = {
  Programiranje: 'Predmeti na kojima učiš da razmišljaš kao programer i da pišeš kod koji radi.',
  'Web razvoj': 'Od prve stranice do aplikacije sa serverom, prijavom i bazom.',
  Podaci: 'Kako se podaci modeluju, čuvaju i izvlače upitima.',
};

@Service()
export class SubjectCatalogService {
  readonly subjects: CatalogSubject[] = [
    {
      id: 'c-programming',
      name: 'Osnove programiranja u C jeziku',
      area: 'Programiranje',
      description:
        'Krećemo od nule: šta je promenljiva, kako radi petlja i kako da zadatak sa papira pretvoriš u program. Vežbamo na zadacima kakvi dolaze na kolokvijumu i ispitu.',
      topics: ['Promenljive i tipovi', 'Grananja i petlje', 'Funkcije', 'Nizovi', 'Pokazivači'],
      itsCourses: [],
      image: 'subjects/c-programming.webp',
    },
    {
      id: 'object-oriented-programming',
      name: 'Objektno orijentisano programiranje',
      area: 'Programiranje',
      description:
        'Klase i objekti prestaju da budu apstrakcija kada ih primeniš na konkretnom primeru. Radimo u jeziku koji koristiš na fakultetu.',
      topics: ['Klase i objekti', 'Nasleđivanje', 'Polimorfizam', 'Interfejsi', 'Izuzeci'],
      itsCourses: [],
      image: 'subjects/oop.webp',
    },
    {
      id: 'java',
      name: 'Programiranje u Javi',
      area: 'Programiranje',
      description:
        'Od prve klase do programa koji čita fajlove i radi sa kolekcijama. Prolazimo i ono na čemu se na ispitu najčešće gube poeni.',
      topics: ['Sintaksa i tipovi', 'Kolekcije', 'Izuzeci', 'Rad sa fajlovima', 'Generički tipovi'],
      itsCourses: ['Internet programerski alati'],
      image: 'subjects/java.webp',
    },
    {
      id: 'csharp-dotnet',
      name: 'C# i .NET',
      area: 'Programiranje',
      description:
        'Jezik i platforma na kojima je napisan i server ovog sajta. Radimo konzolne i desktop aplikacije, a po potrebi i uvod u ASP.NET Core.',
      topics: ['Sintaksa i tipovi', 'LINQ', 'Kolekcije', 'Windows Forms', 'Entity Framework Core'],
      itsCourses: ['Praktikum primenjenog programiranja', 'Programerski alati'],
      image: 'subjects/dotnet.webp',
    },
    {
      id: 'python',
      name: 'Python',
      area: 'Programiranje',
      description:
        'Jezik sa najmanje ceremonije, pa je dobar i za prvi susret sa programiranjem i za brzo rešavanje zadataka. Tempo prilagođavamo tome odakle krećeš.',
      topics: ['Osnove jezika', 'Liste i rečnici', 'Funkcije i moduli', 'Rad sa fajlovima', 'OOP'],
      itsCourses: [],
      image: 'subjects/python.webp',
    },
    {
      id: 'web-frontend',
      name: 'Web programiranje: frontend',
      area: 'Web razvoj',
      description:
        'Praviš stranice koje izgledaju dobro na telefonu i na monitoru i koje reaguju na ono što korisnik radi. Sve vežbamo na stranici koju sam gradiš.',
      topics: ['HTML', 'CSS i Flexbox/Grid', 'Responzivan dizajn', 'JavaScript', 'DOM i događaji'],
      itsCourses: ['Web programiranje'],
      image: 'subjects/frontend.webp',
    },
    {
      id: 'web-backend',
      name: 'Web programiranje: backend',
      area: 'Web razvoj',
      description:
        'Šta se dešava kada pregledač pošalje zahtev: rute, validacija, baza i odgovor. Na kraju imaš API koji možeš da pokažeš na odbrani projekta.',
      topics: ['HTTP i REST', 'Rute i kontroleri', 'Validacija', 'Autentifikacija', 'Rad sa bazom'],
      itsCourses: [
        'Web Programiranje',
        'Praktikum primenjenog programiranja',
        'Internet programerski alati',
      ],
      image: 'subjects/backend.webp',
    },
    {
      id: 'angular-typescript',
      name: 'Angular i TypeScript',
      area: 'Web razvoj',
      description:
        'Ovaj sajt je napisan u Angularu, pa primere uzimamo iz stvarnog koda. Namenjeno je onima koji već znaju osnove JavaScript-a.',
      topics: ['TypeScript tipovi', 'Komponente', 'Signali', 'Rutiranje', 'Forme i HTTP'],
      itsCourses: [],
      image: 'subjects/angular.webp',
    },
    {
      id: 'databases',
      name: 'Baze podataka',
      area: 'Podaci',
      description:
        'Projektuješ šemu, pišeš upite i razumeš zašto je tabela podeljena baš tako. Od prvog SELECT upita do složenih spajanja.',
      topics: ['ER modeli', 'Normalizacija', 'SQL upiti', 'JOIN i agregacije', 'Indeksi'],
      itsCourses: ['Baze podataka', 'Napredne baze podataka'],
      image: 'subjects/databases.webp',
    },
  ];

  readonly groups: SubjectGroup[] = (Object.keys(AREA_NOTES) as SubjectArea[]).map((area) => ({
    area,
    note: AREA_NOTES[area],
    subjects: this.subjects.filter((subject) => subject.area === area),
  }));
}
