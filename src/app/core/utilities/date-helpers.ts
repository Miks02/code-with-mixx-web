
export function dateConverter(date: string) {
  const newDate = new Date(date).toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return newDate;
}

export function dateInputValue(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function currentDate() {
  return new Date().toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
