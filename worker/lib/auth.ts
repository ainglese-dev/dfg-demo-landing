import type { Env } from '../index';

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
  use?: string;
}
interface Jwks { keys: Jwk[] }

const JWKS_TTL_MS = 5 * 60 * 1000;
const jwksCache = new Map<string, { jwks: Jwks; fetchedAt: number }>();

async function getJwks(team: string): Promise<Jwks> {
  const cached = jwksCache.get(team);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) return cached.jwks;
  const res = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const jwks = await res.json<Jwks>();
  jwksCache.set(team, { jwks, fetchedAt: Date.now() });
  return jwks;
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToString(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}

export function extractAccessToken(req: Request): string {
  const header = req.headers.get('Cf-Access-Jwt-Assertion');
  if (header) return header;
  const cookieMatch = (req.headers.get('Cookie') ?? '').match(/CF_Authorization=([^;]+)/);
  return cookieMatch?.[1] ?? '';
}

export async function verifyAccessJwt(req: Request, env: Env): Promise<boolean> {
  if (env.DEBUG === '1') return true;

  const token = extractAccessToken(req);
  if (!token) return false;
  if (!env.CF_ACCESS_TEAM || !env.CF_ACCESS_AUD) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;

  let header: { kid?: string; alg?: string };
  let claims: { aud?: string | string[]; exp?: number; iss?: string };
  try {
    header = JSON.parse(b64urlToString(h)) as typeof header;
    claims = JSON.parse(b64urlToString(p)) as typeof claims;
  } catch {
    return false;
  }

  if (header.alg !== 'RS256' || !header.kid) return false;
  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return false;

  const auds = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!auds.includes(env.CF_ACCESS_AUD)) return false;

  let jwks: Jwks;
  try {
    jwks = await getJwks(env.CF_ACCESS_TEAM);
  } catch {
    return false;
  }

  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) return false;

  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk as JsonWebKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const data = new TextEncoder().encode(`${h}.${p}`);
    const sig = b64urlToBytes(s);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);
  } catch {
    return false;
  }
}
