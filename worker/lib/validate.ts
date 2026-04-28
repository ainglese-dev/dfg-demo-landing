export const isEmail = (s: unknown): s is string =>
  typeof s === 'string' && s.length > 0 && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const isTime = (s: unknown): s is string =>
  typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const bounded = (s: unknown, max: number): s is string =>
  typeof s === 'string' && s.length > 0 && s.length <= max;

export const isHexColor = (s: unknown): s is string =>
  typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);

export const isTimezone = (s: unknown): s is string =>
  typeof s === 'string' && /^[A-Za-z]+(?:\/[A-Za-z_]+){1,2}$/.test(s);

export const parseIntStrict = (s: unknown): number | null => {
  if (typeof s === 'number' && Number.isInteger(s)) return s;
  if (typeof s !== 'string' || !/^-?\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};
