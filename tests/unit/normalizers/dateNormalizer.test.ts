import { normalizeDate } from '../../../src/normalizers/dateNormalizer.js';

describe('normalizeDate', () => {
  it('passes through ISO date unchanged', () => {
    expect(normalizeDate('2024-03-15')).toBe('2024-03-15');
  });
  it('converts DD.MM.YYYY to ISO', () => {
    expect(normalizeDate('15.03.2024')).toBe('2024-03-15');
  });
  it('returns empty string for null', () => {
    expect(normalizeDate(null)).toBe('');
  });
  it('returns empty string for undefined', () => {
    expect(normalizeDate(undefined)).toBe('');
  });
  it('returns empty string for N/A', () => {
    expect(normalizeDate('N/A')).toBe('');
  });
  it('returns unknown format as-is', () => {
    expect(normalizeDate('March 2024')).toBe('March 2024');
  });
});
