import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { isEmail, isHexColor, bounded, parseIntStrict } from '../../lib/validate';

function corsFor(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': new URL(request.url).origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
  };
}

const ALLOWED_FIELDS = ['group_id','name','title','specializations','notify_email','working_hours','slot_duration_min','active','accent_color'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

function validateField(field: AllowedField, value: unknown): string | null {
  switch (field) {
    case 'name':
      return bounded(value, 120) ? null : 'name 1–120 chars';
    case 'title':
      return value == null || (typeof value === 'string' && value.length <= 120) ? null : 'title ≤ 120 chars';
    case 'notify_email':
      return isEmail(value) ? null : 'invalid notify_email';
    case 'specializations':
      if (value == null) return null;
      if (typeof value !== 'string' || value.length > 1000) return 'specializations too long';
      try { JSON.parse(value); return null; } catch { return 'specializations not JSON'; }
    case 'working_hours':
      if (value == null) return null;
      if (typeof value !== 'string' || value.length > 2000) return 'working_hours too long';
      try { JSON.parse(value); return null; } catch { return 'working_hours not JSON'; }
    case 'slot_duration_min': {
      const n = parseIntStrict(value);
      return n !== null && n >= 15 && n <= 240 ? null : 'slot_duration_min 15–240';
    }
    case 'group_id':
      if (value == null) return null;
      return parseIntStrict(value) !== null ? null : 'invalid group_id';
    case 'active':
      if (value === 0 || value === 1 || value === true || value === false || value === '0' || value === '1') return null;
      return 'invalid active';
    case 'accent_color':
      return value == null || isHexColor(value) ? null : 'accent_color must be #rrggbb';
    default:
      return 'unknown field';
  }
}

export async function handleAdminAgents(request: Request, env: Env): Promise<Response> {
  const CORS = corsFor(request);
  if (!(await verifyAccessJwt(request, env))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const id = parseIntStrict(new URL(request.url).pathname.split('/').pop() ?? '');

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT a.*,g.name as group_name FROM agents a LEFT JOIN agent_groups g ON a.group_id=g.id ORDER BY g.name,a.name`
    ).all();
    return Response.json(results, { headers: CORS });
  }

  if (request.method === 'POST') {
    const b = await request.json<Record<string, unknown>>();
    for (const f of ['name', 'notify_email'] as const) {
      const err = validateField(f, b[f]);
      if (err) return Response.json({ error: err }, { status: 400, headers: CORS });
    }
    for (const f of ['title', 'specializations', 'working_hours', 'slot_duration_min', 'group_id', 'accent_color'] as const) {
      if (b[f] !== undefined) {
        const err = validateField(f, b[f]);
        if (err) return Response.json({ error: err }, { status: 400, headers: CORS });
      }
    }
    const slot = b.slot_duration_min !== undefined ? parseIntStrict(b.slot_duration_min) ?? 60 : 60;
    const groupId = b.group_id != null ? parseIntStrict(b.group_id) : null;
    const r = await env.DB.prepare(
      `INSERT INTO agents (group_id,name,title,specializations,notify_email,working_hours,slot_duration_min,accent_color)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(
      groupId,
      b.name as string,
      (b.title as string | undefined) ?? null,
      (b.specializations as string | undefined) ?? null,
      b.notify_email as string,
      (b.working_hours as string | undefined) ?? null,
      slot,
      (b.accent_color as string | undefined) ?? '#00E5A0',
    ).run();
    return Response.json({ id: r.meta.last_row_id }, { status: 201, headers: CORS });
  }

  if (request.method === 'PATCH' && id !== null) {
    const b = await request.json<Record<string, unknown>>();
    const updates: { field: AllowedField; value: unknown }[] = [];
    for (const f of ALLOWED_FIELDS) {
      if (b[f] === undefined) continue;
      const err = validateField(f, b[f]);
      if (err) return Response.json({ error: err }, { status: 400, headers: CORS });
      let v: unknown = b[f];
      if (f === 'slot_duration_min' || f === 'group_id') v = b[f] == null ? null : parseIntStrict(b[f]);
      if (f === 'active') v = (b[f] === 1 || b[f] === '1' || b[f] === true) ? 1 : 0;
      updates.push({ field: f, value: v });
    }
    if (!updates.length) return Response.json({ error: 'Nothing to update' }, { status: 400, headers: CORS });

    try {
      await env.DB.prepare(
        `UPDATE agents SET ${updates.map((u) => `${u.field}=?`).join(',')} WHERE id=?`,
      ).bind(...updates.map((u) => u.value), id).run();
    } catch {
      // accent_color column may not exist on databases predating migration 001; retry without it
      const safe = updates.filter((u) => u.field !== 'accent_color');
      if (!safe.length) return Response.json({ error: 'Nothing to update' }, { status: 400, headers: CORS });
      await env.DB.prepare(
        `UPDATE agents SET ${safe.map((u) => `${u.field}=?`).join(',')} WHERE id=?`,
      ).bind(...safe.map((u) => u.value), id).run();
    }
    return Response.json({ success: true }, { headers: CORS });
  }

  if (request.method === 'DELETE' && id !== null) {
    await env.DB.prepare('UPDATE agents SET active=0 WHERE id=?').bind(id).run();
    return Response.json({ success: true }, { headers: CORS });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: CORS });
}
