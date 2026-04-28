const HTML_RE = /[&<>"']/g;
const HTML_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (v: unknown): string =>
  v == null ? '' : String(v).replace(HTML_RE, (c) => HTML_MAP[c]);

// Escape values for embedding inside a <script> string literal.
// JSON.stringify already escapes quotes, control chars, and non-BMP correctly;
// the additional replacements defend against </script> injection that breaks
// the surrounding script tag.
export const escJs = (v: unknown): string =>
  JSON.stringify(v ?? null)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

export const escIcs = (s: string): string =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
