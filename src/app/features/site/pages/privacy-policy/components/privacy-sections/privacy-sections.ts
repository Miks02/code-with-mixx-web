import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type TocItem = {
  id: string;
  title: string;
};

type DataGroup = {
  when: string;
  paragraphs: string[];
  basis: string;
};

type Cookie = {
  name: string;
  purpose: string;
  duration: string;
  readableFromScript: boolean;
};

type Processor = {
  name: string;
  role: string;
  receives: string;
  location: string;
};

type Retention = {
  subject: string;
  rule: string;
};

type Right = {
  title: string;
  description: string;
};

type Repository = {
  name: string;
  url: string;
};

@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-privacy-sections',
  styleUrl: './privacy-sections.css',
  templateUrl: './privacy-sections.html',
})
export class PrivacySections {
  readonly email = 'milan@codewithmixx.com';

  readonly toc: TocItem[] = [
    { id: 'rukovalac', title: 'Ko stoji iza sajta' },
    { id: 'podaci', title: 'Koje podatke prikupljam i zašto' },
    { id: 'kolacici', title: 'Kolačići' },
    { id: 'servisi', title: 'Ko još dolazi u dodir sa podacima' },
    { id: 'cuvanje', title: 'Koliko dugo čuvam podatke' },
    { id: 'prava', title: 'Tvoja prava' },
    { id: 'bezbednost', title: 'Kako čuvam podatke' },
    { id: 'uzrast', title: 'Uzrast' },
    { id: 'izmene', title: 'Izmene ove politike' },
  ];

  readonly dataGroups: DataGroup[] = [
    {
      when: 'Kada pošalješ upit',
      paragraphs: [
        'Ime, prezime, email adresa, broj telefona, vrsta upita i tekst poruke.',
        'Trebaju mi da ti odgovorim i da dogovorimo čas ili saradnju. Upit se upisuje u bazu, a kopija mi stiže kao obaveštenje na Discord, o čemu više piše u odeljku 04.',
      ],
      basis: 'Tvoj zahtev da stupimo u kontakt pre dogovora o časovima.',
    },
    {
      when: 'Kada dobiješ nalog',
      paragraphs: [
        'Registracija nije otvorena. Nalog ti otvaram ja kada se dogovorimo, i u njega unosim ime, prezime, email adresu, broj telefona i, ako želiš, fakultet.',
        'Na mejl ti stiže pozivnica, a lozinku biraš ti. U bazi je samo njen heš, pa je ni ja ne mogu pročitati. Uz nalog se beleže još status naloga i vreme poslednje prijave.',
      ],
      basis: 'Izvršenje našeg dogovora o časovima.',
    },
    {
      when: 'Dok radimo zajedno',
      paragraphs: [
        'Rezervacije časova sa predmetom, terminima i cenom. Kod seminarskih i diplomskih radova tu su još tip rada, rokovi, napredak, beleške i link ka GitHub repozitorijumu ili fajlu za preuzimanje.',
        'Vodim i evidenciju uplata: iznos, datum, vrstu transakcije i kratku napomenu. Plaćanje ne ide preko sajta, tako da podatke o tvojoj kartici ili računu nemam.',
      ],
      basis: 'Izvršenje našeg dogovora o časovima.',
    },
    {
      when: 'Kada se prijaviš',
      paragraphs: [
        'Za svaku prijavu pamtim IP adresu sa koje je otvorena i opis pregledača koji tvoj uređaj sam pošalje (user agent). Iz njega se vidi tip uređaja, operativni sistem i pregledač.',
        'Kada studentski panel bude gotov, tu ćeš videti sve svoje aktivne prijave i moći da ugasiš jednu ili sve odjednom. Do tada mi piši ako posumnjaš da se na tvoj nalog prijavio neko drugi.',
      ],
      basis: 'Legitimni interes da nalozi budu bezbedni.',
    },
    {
      when: 'Pri svakoj poseti',
      paragraphs: [
        'Server vidi tvoju IP adresu i koristi je da ograniči broj zahteva u kratkom vremenu, čime se forma i prijava štite od zloupotrebe. U bazu je zbog toga ne upisuje.',
        'Pregledač uz zahteve šalje i svoju vremensku zonu, da bi se termini prikazali po tvom vremenu. Serverski logovi beleže koji je zahtev stigao, kako se završio i ID naloga ako postoji prijava. IP adresa ulazi u log samo kod sumnjivih događaja, na primer kada neko pokuša da iskoristi tuđu sesiju.',
      ],
      basis: 'Legitimni interes da sajt radi stabilno i bezbedno.',
    },
  ];

  readonly cookies: Cookie[] = [
    {
      name: 'AccessToken',
      purpose: 'Potvrđuje serveru da zahtev dolazi sa tvog naloga.',
      duration: 'Nekoliko minuta, zatim se sam obnavlja',
      readableFromScript: false,
    },
    {
      name: 'RefreshToken',
      purpose: 'Obnavlja prijavu bez ponovnog unosa lozinke. Na serveru se čuva samo njegov heš.',
      duration: 'Do 14 dana',
      readableFromScript: false,
    },
    {
      name: 'Session',
      purpose:
        'Prazan marker po kom aplikacija zna da prijava postoji, da ne bi bez potrebe pitala server ko si.',
      duration: 'Do 14 dana',
      readableFromScript: true,
    },
  ];

  readonly processors: Processor[] = [
    {
      name: 'Railway',
      role: 'Hosting servera i baze podataka.',
      receives: 'Sve što je navedeno u odeljku 02.',
      location: 'Serveri u Evropskoj uniji',
    },
    {
      name: 'Resend',
      role: 'Slanje mejlova: pozivnica, link za reset lozinke i potvrde promena na nalogu.',
      receives: 'Tvoju email adresu i sadržaj tih poruka.',
      location: 'SAD',
    },
    {
      name: 'Discord',
      role: 'Obaveštenje o novom upitu stiže u moj privatni kanal, da bih ti brže odgovorio.',
      receives: 'Ime, prezime, email adresu, broj telefona, vrstu upita i poruku.',
      location: 'SAD',
    },
    {
      name: 'Google Fonts',
      role: 'Font kojim je sajt ispisan učitava se sa Google servera.',
      receives: 'IP adresu i opis pregledača, kao pri učitavanju bilo kog fajla sa interneta.',
      location: 'SAD',
    },
  ];

  readonly retention: Retention[] = [
    {
      subject: 'Upiti',
      rule: 'Nemaju unapred određen rok. Čuvam ih dok traje naša komunikacija i dok mi mogu zatrebati da se nadovežemo na raniji razgovor, a brišem ih ručno kada više nisu potrebni. Ako želiš da tvoj upit nestane odmah, piši mi i obrisaću ga iz baze i sa Discorda.',
    },
    {
      subject: 'Nalog',
      rule: 'Dok sarađujemo, odnosno dok ne zatražiš brisanje.',
    },
    {
      subject: 'Posle brisanja naloga',
      rule: 'Ako nemaš nijednu rezervaciju, nalog se briše u potpunosti. Ako ih ima, iz naloga uklanjam ime, prezime, email adresu, broj telefona, fakultet i lozinku. Ostaje evidencija časova, projekata i uplata koja više ne nosi tvoje ime ni kontakt, a treba mi radi pregleda sopstvenog rada.',
    },
    {
      subject: 'Prijave',
      rule: 'Zapis o prijavi sa IP adresom i opisom pregledača ističe najkasnije za 14 dana ako se ne obnovi, a nekoliko dana po isteku se automatski briše.',
    },
    {
      subject: 'Pozivnice i linkovi',
      rule: 'Pozivnica za aktivaciju naloga važi 7 dana, a link za reset lozinke 1 sat.',
    },
  ];

  readonly rights: Right[] = [
    {
      title: 'Uvid',
      description: 'Da saznaš da li obrađujem tvoje podatke i da dobiješ njihovu kopiju.',
    },
    {
      title: 'Ispravka',
      description:
        'Studentski panel je još u izradi, pa podatke za sada ispravljam ja: piši mi šta treba da se promeni. Lozinku menjaš preko linka za reset lozinke.',
    },
    {
      title: 'Brisanje',
      description: 'Da tražiš da obrišem upit ili ceo nalog, onako kako je opisano u odeljku 05.',
    },
    {
      title: 'Ograničenje obrade',
      description: 'Da podatke zadržim, ali ih ne koristim dok ne rešimo ono što osporavaš.',
    },
    {
      title: 'Prenosivost',
      description: 'Da podatke koje imam o tebi dobiješ u formatu koji može da pročita računar.',
    },
    {
      title: 'Prigovor',
      description:
        'Da se usprotiviš obradi koju zasnivam na legitimnom interesu, kao što su zapisi o prijavama.',
    },
  ];

  readonly safeguards: string[] = [
    'Lozinke se čuvaju isključivo kao heš.',
    'Tokeni za prijavu su u HttpOnly kolačićima, a u bazi je samo heš tokena za obnavljanje.',
    'Sav saobraćaj između tebe i servera ide preko HTTPS-a.',
    'Broj pokušaja prijave, slanja upita i reseta lozinke je ograničen.',
    'Ako neko pokuša da iskoristi već potrošen token, sistem gasi sve sesije tog naloga i traži novu prijavu.',
    'Podatke u admin panelu vidim samo ja.',
  ];

  readonly repositories: Repository[] = [
    { name: 'code-with-mixx-web', url: 'https://github.com/Miks02/code-with-mixx-web' },
    { name: 'code-with-mixx-api', url: 'https://github.com/Miks02/code-with-mixx-api' },
  ];
}
