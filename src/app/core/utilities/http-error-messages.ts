// Messages for errors without a domain-specific code. Domain codes (e.g. 'Subject.AlreadyExists')
// are intentionally absent: those are handled by the component that made the request.
// 'General.Unauthorized' is absent on purpose, see showGlobalError in http-error-interceptor.ts.
export const GLOBAL_ERROR_MESSAGES: Record<string, string> = {
  'Network.Unavailable':
    'Došlo je do greške sa mrežom. Proveri internet konekciju i pokušaj ponovo.',
  'Http.Unexpected': 'Došlo je do neočekivane greške. Pokušaj ponovo kasnije.',
  'General.BadRequest': 'Zahtev nije ispravan. Proveri unete podatke i pokušaj ponovo.',
  'General.Forbidden': 'Nemaš dozvolu za ovu akciju.',
  'General.NotFound': 'Traženi resurs ne postoji. Osveži stranicu i pokušaj ponovo.',
  'General.Conflict': 'Podaci su u međuvremenu izmenjeni. Osveži stranicu i pokušaj ponovo.',
  'General.UnprocessableEntity': 'Zahtev nije moguće obraditi. Proveri unete podatke.',
  'General.TooManyRequests': 'Previše zahteva. Pokušaj ponovo kasnije.',
  'General.InternalServerError': 'Došlo je do greške na serveru. Pokušaj ponovo kasnije.',
};
