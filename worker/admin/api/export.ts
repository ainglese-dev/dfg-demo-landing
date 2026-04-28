import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { parseIntStrict } from '../../lib/validate';

export async function handleExport(request: Request, env: Env): Promise<Response> {
  if (!(await verifyAccessJwt(request, env))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const agentIdRaw = new URL(request.url).searchParams.get('agent_id');
  const agentId = agentIdRaw ? parseIntStrict(agentIdRaw) : null;

  let q = `SELECT b.id,b.date,b.time,b.first_name,b.last_name,b.email,b.phone,b.address,b.city,b.state,b.zip,b.notes,b.status,b.created_at,a.name as agent_name FROM bookings b LEFT JOIN agents a ON b.agent_id=a.id WHERE 1=1`;
  const p: (string | number)[] = [];
  if (agentId !== null) { q += ' AND b.agent_id=?'; p.push(agentId); }
  q += ' ORDER BY b.date,b.time';

  const { results } = await env.DB.prepare(q).bind(...p).all<Record<string, unknown>>();
  const headers = ['id','date','time','first_name','last_name','email','phone','address','city','state','zip','notes','status','created_at','agent_name'];
  const rows = results.map((r) =>
    headers.map((h) => {
      const v = String(r[h] ?? '');
      return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')
  );

  return new Response([headers.join(','), ...rows].join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bookings.csv"',
    },
  });
}
