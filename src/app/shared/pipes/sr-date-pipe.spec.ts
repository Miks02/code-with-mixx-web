import { SrDatePipe } from './sr-date-pipe';

describe('SrDatePipe', () => {
  const pipe = new SrDatePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a date with the default format', () => {
    expect(pipe.transform('2026-10-27')).toBe('27. oktobar 2026.');
  });

  it('applies custom format options', () => {
    expect(pipe.transform('2026-10-27', { month: '2-digit', day: '2-digit' })).toBe('27.10.2026.');
  });

  it('returns an empty string for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
