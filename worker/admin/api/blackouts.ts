import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { isDate, bounded, parseIntStrict } from '../../lib/validate';

function corsFor(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': new URL(request.url).origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
  };
}

export async function handleAdminBlackouts(request: Request, env: Env): Promise<Response> {
  const CORS = corsFor(request);
  if (!(await verifyAccessJwt(request, env))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  if (request.method === 'GET') {
    const agentIdRaw = new URL(request.url).searchParams.get('agent_id');
    const agentId = agentIdRaw ? parseIntStrict(agentIdRaw) : null;
    let q = `SELECT b.*,a.name as agent_name FROM blackouts b LEFT JOIN agents a ON b.agent_id=a.id WHERE 1=1`;
    const p: (string | number)[] = [];
    if (agentId !== null) { q += ' AND b.agent_id=?'; p.push(agentId); }
    q += ' ORDER BY b.date';
    const { results } = await env.DB.prepare(q).bind(...p).all();
    return Response.json(results, { headers: CORS });
  }

  if (request.method === 'POST') {
    const { agent_id, date_from, date_to, reason } = await request.json<{
      agent_id?: number | string; date_from: string; date_to?: string; reason?: string;
    }>();

    if (!isDate(date_from)) return Response.json({ error: 'invalid date_from' }, { status: 400, headers: CORS });
    if (date_to !== undefined && date_to !== '' && !isDate(date_to)) {
      return Response.json({ error: 'invalid date_to' }, { status: 400, headers: CORS });
    }
    const agentIdNum = agent_id == null || agent_id === '' ? null : parseIntStrict(agent_id);
    if (agent_id != null && agent_id !== '' && agentIdNum === null) {
      return Response.json({ error: 'invalid agent_id' }, { status: 400, headers: CORS });
    }
    if (reason != null && reason !== '' && !bounded(reason, 200)) {
      return Response.json({ error: 'reason too long' }, { status: 400, headers: CORS });
    }

    const inserted: string[] = [];
    const start = new Date(`${date_from}T00:00:00Z`);
    const end = new Date(`${date_to && date_to !== '' ? date_to : date_from}T00:00:00Z`);
    if (end < start) return Response.json({ error: 'date_to before date_from' }, { status: 400, headers: CORS });

    // Hard cap at 366 days to prevent runaway loops
    const MAX_DAYS = 366;
    let days = 0;
    for (let d = new Date(start); d <= end && days < MAX_DAYS; d.setUTCDate(d.getUTCDate() + 1), days++) {
      const iso = d.toISOString().slice(0, 10);
      await env.DB.prepare('INSERT OR IGNORE INTO blackouts (agent_id,date,reason) VALUES (?,?,?)')
        .bind(agentIdNum, iso, reason && reason !== '' ? reason : null).run();
      inserted.push(iso);
    }
    return Response.json({ inserted }, { status: 201, headers: CORS });
  }

  if (request.method === 'DELETE') {
    const id = parseIntStrict(new URL(request.url).pathname.split('/').pop() ?? '');
    if (id === null) return Response.json({ error: 'Invalid id' }, { status: 400, headers: CORS });
    await env.DB.prepare('DELETE FROM blackouts WHERE id=?').bind(id).run();
    return Response.json({ success: true }, { headers: CORS });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS });
}
