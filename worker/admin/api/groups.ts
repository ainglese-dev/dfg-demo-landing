import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { bounded, parseIntStrict } from '../../lib/validate';

function corsFor(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': new URL(request.url).origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
  };
}

export async function handleAdminGroups(request: Request, env: Env): Promise<Response> {
  const CORS = corsFor(request);
  if (!(await verifyAccessJwt(request, env))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const id = parseIntStrict(new URL(request.url).pathname.split('/').pop() ?? '');

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM agent_groups ORDER BY name').all();
    return Response.json(results, { headers: CORS });
  }

  if (request.method === 'POST') {
    const { name, description } = await request.json<{ name: string; description?: string }>();
    if (!bounded(name, 120)) return Response.json({ error: 'name required (1–120 chars)' }, { status: 400, headers: CORS });
    if (description != null && !bounded(description, 500)) {
      return Response.json({ error: 'description too long' }, { status: 400, headers: CORS });
    }
    const r = await env.DB.prepare('INSERT INTO agent_groups (name,description) VALUES (?,?)').bind(name, description ?? null).run();
    return Response.json({ id: r.meta.last_row_id }, { status: 201, headers: CORS });
  }

  if (request.method === 'PATCH' && id !== null) {
    const { name, description } = await request.json<{ name?: string; description?: string }>();
    const fields: string[] = []; const vals: (string | null)[] = [];
    if (name !== undefined) {
      if (!bounded(name, 120)) return Response.json({ error: 'invalid name' }, { status: 400, headers: CORS });
      fields.push('name=?'); vals.push(name);
    }
    if (description !== undefined) {
      if (description !== null && !bounded(description, 500)) {
        return Response.json({ error: 'description too long' }, { status: 400, headers: CORS });
      }
      fields.push('description=?'); vals.push(description);
    }
    if (!fields.length) return Response.json({ error: 'Nothing to update' }, { status: 400, headers: CORS });
    await env.DB.prepare(`UPDATE agent_groups SET ${fields.join(',')} WHERE id=?`).bind(...vals, id).run();
    return Response.json({ success: true }, { headers: CORS });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS });
}
