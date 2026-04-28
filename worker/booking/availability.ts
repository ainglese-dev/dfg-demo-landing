import type { Env } from '../index';
import { parseIntStrict } from '../lib/validate';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handleAvailability(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const agentId = parseIntStrict(url.searchParams.get('agent_id') ?? '');
  const year = parseIntStrict(url.searchParams.get('year') ?? '');
  const month = parseIntStrict(url.searchParams.get('month') ?? '');

  if (agentId === null || year === null || month === null) {
    return Response.json({ error: 'Missing agent_id, year, or month' }, { status: 400, headers: CORS });
  }
  if (year < 2024 || year > 2100 || month < 1 || month > 12) {
    return Response.json({ error: 'Out-of-range year or month' }, { status: 400, headers: CORS });
  }

  const agent = await env.DB.prepare(
    'SELECT working_hours, slot_duration_min FROM agents WHERE id = ? AND active = 1'
  ).bind(agentId).first<{ working_hours: string; slot_duration_min: number }>();

  if (!agent) return Response.json({ available: [] }, { headers: CORS });

  let workingHours: Record<string, [string, string]>;
  try {
    workingHours = JSON.parse(agent.working_hours ?? '{}');
  } catch {
    return Response.json({ available: [] }, { headers: CORS });
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const available: string[] = [];
  const todayIso = new Date().toISOString().slice(0, 10);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const weekday = String(date.getDay());
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!workingHours[weekday]) continue;
    if (iso < todayIso) continue;

    const blackout = await env.DB.prepare(
      `SELECT id FROM blackouts WHERE date = ? AND (agent_id = ? OR agent_id IS NULL) LIMIT 1`
    ).bind(iso, agentId).first();
    if (blackout) continue;

    const [start, end] = workingHours[weekday];
    const totalSlots = Math.floor((toMin(end) - toMin(start)) / agent.slot_duration_min);
    if (totalSlots <= 0) continue;

    const booked = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM bookings WHERE agent_id = ? AND date = ? AND status != 'cancelled'`
    ).bind(agentId, iso).first<{ cnt: number }>();

    if ((booked?.cnt ?? 0) < totalSlots) available.push(iso);
  }

  return Response.json({ available }, { headers: CORS });
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
