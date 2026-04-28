import type { Env } from '../index';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handleAgents(_request: Request, env: Env): Promise<Response> {
  // Try with accent_color; fall back if the migration hasn't been applied yet
  let results: Record<string, unknown>[];
  try {
    const r = await env.DB.prepare(`
      SELECT id, name, title, specializations, slot_duration_min, working_hours, accent_color
      FROM agents WHERE active = 1 ORDER BY name
    `).all<Record<string, unknown>>();
    results = r.results;
  } catch {
    const r = await env.DB.prepare(`
      SELECT id, name, title, specializations, slot_duration_min, working_hours
      FROM agents WHERE active = 1 ORDER BY name
    `).all<Record<string, unknown>>();
    results = r.results;
  }

  const agents = results.map((r) => ({
    ...r,
    specializations: (() => {
      try { return JSON.parse(r.specializations as string); } catch { return []; }
    })(),
  }));

  return Response.json(agents, { headers: CORS });
}
