export function normalizeDate(d: string | null | undefined): string {
  if (!d || d === 'N/A') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) {
    const [day, m, y] = d.split('.');
    return `${y}-${m}-${day}`;
  }
  return d;
}
