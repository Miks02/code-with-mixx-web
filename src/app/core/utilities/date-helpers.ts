export type DateFormatOptions = Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day'>;

export function dateConverter(
  date: string,
  { year = 'numeric', month = 'long', day = 'numeric' }: DateFormatOptions = {},
) {
  const newDate = new Date(date).toLocaleDateString('sr-Latn-RS', { year, month, day });

  return newDate;
}

export function dateTimeConverter(date: string) {
  return new Date(date).toLocaleString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dateInputValue(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function dateTimeInputValue(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function currentDate() {
  return new Date().toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isValidDate(date: string): boolean {
  return !date || !Number.isNaN(Date.parse(date));
}

export function isAfter(date: string, other: string): boolean {
  if (!date || !other || !isValidDate(date) || !isValidDate(other)) return false;

  return Date.parse(date) > Date.parse(other);
}

export function isBefore(date: string, other: string): boolean {
  if (!date || !other || !isValidDate(date) || !isValidDate(other)) return false;

  return Date.parse(date) < Date.parse(other);
}

export function timeConverter(date: string) {
  return new Date(date).toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' });
}
