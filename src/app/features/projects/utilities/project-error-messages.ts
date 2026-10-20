export const PROJECT_RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  'Student.NotFound': 'Izabrani student više ne postoji. Osvežite stranicu i izaberite drugog.',
  'Subject.MultipleSubjectsMissing':
    'Neki od izabranih predmeta više ne postoje. Osvežite stranicu i izaberite ponovo.',
  'Reservation.NoProjectsProvided': 'Rezervacija mora imati barem jedan projekat.',
  'Reservation.InvalidTotalPrice': 'Ukupna cena ne može biti negativna.',
  'Reservation.InvalidAmount': 'Plaćeni iznos ne može biti negativan.',
  'Project.NegativePrice': 'Cena projekta ne može biti negativna.',
  'Project.InvalidProgress': 'Napredak projekta mora biti između 0 i 100.',
  'Project.InvalidDateRange': 'Početak projekta ne može biti posle roka.',
  'Project.InvalidReservationDate': 'Datum rezervacije ne može biti u budućnosti.',
  'Project.GithubLinkIsTooLong': 'Github link ne može imati više od 200 karaktera.',
  'Project.DownloadLinkIsTooLong': 'Download link ne može imati više od 200 karaktera.',
  'Project.EmptyProjectNote': 'Beleške ne mogu biti prazne.',
};
