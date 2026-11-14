export const INQUIRY_TOAST_MESSAGES = {
  resolveSuccess: 'Upit je označen kao rešen.',
  deleteSuccess: 'Upit je uspešno obrisan.',
  bulkDeleteSuccess: (count: number) =>
    count === 1 ? 'Obrisan je 1 upit.' : `Obrisano je upita: ${count}.`,
} as const;
