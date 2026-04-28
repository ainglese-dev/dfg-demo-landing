import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { isTimezone, parseIntStrict } from '../../lib/validate';

const ALLOWED_SETTINGS = new Set(['meeting_duration_min', 'timezone']);

function corsFor(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': new URL(request.url).origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
  };
}

export async function handleAdminSettings(request: Request, env: Env): Promise<Response> {
  const CORS = corsFor(request);
  if (!(await verifyAccessJwt(request, env))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT key,value FROM settings').all<{ key: string; value: string }>();
    return Response.json(Object.fromEntries(results.map((r) => [r.key, r.value])), { headers: CORS });
  }

  if (request.method === 'PATCH') {
    let body: Record<string, unknown>;
    try {
      body = await request.json<Record<string, unknown>>();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
    }

    const applied: string[] = [];
    for (const [key, raw] of Object.entries(body)) {
      if (!ALLOWED_SETTINGS.has(key)) continue;
      const value = String(raw ?? '').slice(0, 200);

      if (key === 'meeting_duration_min') {
        const n = parseIntStrict(value);
        if (n == null || n < 15 || n > 240) continue;
        await env.DB.prepare(
          'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        ).bind(key, String(n)).run();
        applied.push(key);
        continue;
      }

      if (key === 'timezone') {
        if (!isTimezone(value)) continue;
        await env.DB.prepare(
          'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        ).bind(key, value).run();
        applied.push(key);
        continue;
      }
    }

    return Response.json({ success: true, applied }, { headers: CORS });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS });
}
