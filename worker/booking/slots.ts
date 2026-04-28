import type { Env } from '../index';
import { isDate, parseIntStrict } from '../lib/validate';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handleSlots(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const agentId = parseIntStrict(url.searchParams.get('agent_id') ?? '');
  const date = url.searchParams.get('date');

  if (agentId === null || !date || !isDate(date)) {
    return Response.json({ error: 'Missing or invalid agent_id or date' }, { status: 400, headers: CORS });
  }

  const agent = await env.DB.prepare(
    'SELECT working_hours, slot_duration_min FROM agents WHERE id = ? AND active = 1'
  ).bind(agentId).first<{ working_hours: string; slot_duration_min: number }>();

  if (!agent) return Response.json({ slots: [] }, { headers: CORS });

  let workingHours: Record<string, [string, string]>;
  try {
    workingHours = JSON.parse(agent.working_hours ?? '{}');
  } catch {
    return Response.json({ slots: [] }, { headers: CORS });
  }

  const weekday = String(new Date(date + 'T12:00:00').getDay());
  if (!workingHours[weekday]) return Response.json({ slots: [] }, { headers: CORS });

  // Blackouts override working hours (same logic as availability.ts)
  const blackout = await env.DB.prepare(
    `SELECT id FROM blackouts WHERE date = ? AND (agent_id = ? OR agent_id IS NULL) LIMIT 1`
  ).bind(date, agentId).first();
  if (blackout) return Response.json({ slots: [] }, { headers: CORS });

  const [start, end] = workingHours[weekday];
  const duration = agent.slot_duration_min ?? 60;
  const allSlots: string[] = [];
  for (let m = toMin(start); m + duration <= toMin(end); m += duration) {
    allSlots.push(fromMin(m));
  }

  const { results: booked } = await env.DB.prepare(
    `SELECT time FROM bookings WHERE agent_id = ? AND date = ? AND status != 'cancelled'`
  ).bind(agentId, date).all<{ time: string }>();

  const bookedSet = new Set(booked.map((r) => r.time));
  return Response.json({ slots: allSlots.filter((s) => !bookedSet.has(s)) }, { headers: CORS });
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fromMin(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
