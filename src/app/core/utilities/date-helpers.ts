
export function dateConverter(date: string) {
  const newDate = new Date(date).toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return newDate;
}
