import type { Env } from '../../index';
import { verifyAccessJwt } from '../../lib/auth';
import { isDate, bounded, parseIntStrict } from '../../lib/validate';
import { esc, escIcs } from '../../lib/escape';
import { dlog, derr } from '../../lib/log';

function corsFor(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': new URL(request.url).origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
  };
}

const VALID_STATUS = new Set(['pending', 'confirmed', 'cancelled', 'completed']);

export async function handleAdminBookings(request: Request, env: Env): Promise<Response> {
  const CORS = corsFor(request);
  if (!(await verifyAccessJwt(request, env))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);

  // POST /api/admin/bookings/:id/cancel — cancel + notify client
  if (request.method === 'POST' && segments[segments.length - 1] === 'cancel') {
    const id = parseIntStrict(segments[segments.length - 2]);
    if (id === null) return Response.json({ error: 'Invalid id' }, { status: 400, headers: CORS });

    let reason = '';
    try {
      const body = await request.json<{ reason?: string }>();
      reason = body.reason?.trim() ?? '';
    } catch { /* body is optional */ }
    if (reason && !bounded(reason, 500)) {
      return Response.json({ error: 'reason too long' }, { status: 400, headers: CORS });
    }

    const booking = await env.DB.prepare(
      `SELECT b.*, a.notify_email, a.name as agent_name, a.slot_duration_min
       FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id
       WHERE b.id = ?`
    ).bind(id).first<{
      id: number; date: string; time: string;
      first_name: string; last_name: string; email: string;
      agent_name: string; notify_email: string; slot_duration_min: number;
    }>();
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404, headers: CORS });

    await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(id).run();

    const clientName = `${booking.first_name} ${booking.last_name}`;
    const cancelIcs = generateCancelIcs(booking.id, booking.date, booking.time, booking.slot_duration_min ?? 60);
    const subject = `Appointment cancelled — ${booking.date} at ${booking.time}`;
    const safe = {
      first: esc(booking.first_name),
      date: esc(booking.date),
      time: esc(booking.time),
      client: esc(clientName),
      email: esc(booking.email),
      reason: esc(reason),
    };
    const reasonRow = reason
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:90px">Reason</td><td style="padding:6px 0;font-size:14px;color:#111827">${safe.reason}</td></tr>`
      : '';

    // Client cancellation email (non-fatal)
    try {
      const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)"><tr><td style="background:#2D2D3F;padding:28px 36px"><span style="color:#00E5A0;font-size:18px;font-weight:700">DFG Booking</span><span style="color:#ffffff;font-size:13px;margin-left:12px;opacity:.6">Appointment update</span></td></tr><tr><td style="padding:32px 36px"><p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a2e">Appointment cancelled</p><p style="margin:0 0 24px;font-size:15px;color:#6b7280">Hi ${safe.first}, your appointment has been cancelled. Please contact us to reschedule.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px"><tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:90px">Date</td><td style="padding:6px 0;font-size:14px;color:#111827">${safe.date}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Time</td><td style="padding:6px 0;font-size:14px;color:#111827">${safe.time}</td></tr>${reasonRow}</table><p style="margin:0;font-size:14px;color:#6b7280">To reschedule: <a href="tel:+13059272731" style="color:#2D2D3F">+1 305-927-2731</a> · <a href="mailto:info@digitsfinancial.tax" style="color:#2D2D3F">info@digitsfinancial.tax</a></p></td></tr><tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0"><p style="margin:0;font-size:12px;color:#9ca3af">Digits Financial Group · 18425 NW 2nd Ave, Suite 403, Miami FL 33169</p></td></tr></table></td></tr></table></body></html>`;
      await env.EMAIL.send({
        to: booking.email,
        from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
        subject,
        html: clientHtml,
        attachments: [{ content: cancelIcs, filename: 'cancel.ics', type: 'text/calendar; method=CANCEL', disposition: 'attachment' as const }],
      });
      dlog(env, '[cancel] client email sent OK');
    } catch (err) {
      derr('[cancel] client email failed:', String(err));
    }

    // Agent notification email (non-fatal)
    if (booking.notify_email) {
      try {
        const agentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)"><tr><td style="background:#2D2D3F;padding:28px 36px"><span style="color:#00E5A0;font-size:18px;font-weight:700;letter-spacing:-.3px">DFG Booking</span><span style="color:#ffffff;font-size:13px;margin-left:12px;opacity:.6">Booking cancelled</span></td></tr><tr><td style="padding:32px 36px"><p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1a1a2e">Booking cancelled</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px"><tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:90px">Date</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827">${safe.date}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#00E5A0">${safe.time}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Client</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827">${safe.client}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Email</td><td style="padding:6px 0;font-size:14px;color:#111827"><a href="mailto:${safe.email}" style="color:#2D2D3F">${safe.email}</a></td></tr>${reasonRow}</table></td></tr><tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0"><p style="margin:0;font-size:12px;color:#9ca3af">Digits Financial Group - 18425 NW 2nd Ave, Suite 403, Miami FL 33169</p></td></tr></table></td></tr></table></body></html>`;
        await env.EMAIL.send({
          to: booking.notify_email,
          from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
          subject: `Booking cancelled — ${clientName} on ${booking.date} at ${booking.time}`,
          html: agentHtml,
          attachments: [{ content: cancelIcs, filename: 'cancel.ics', type: 'text/calendar; method=CANCEL', disposition: 'attachment' as const }],
        });
        dlog(env, '[cancel] agent email sent OK');
      } catch (err) {
        derr('[cancel] agent email failed:', String(err));
      }
    }

    return Response.json({ success: true }, { headers: CORS });
  }

  // PATCH /api/admin/bookings/:id/status
  if (request.method === 'PATCH') {
    const id = parseIntStrict(segments[segments.length - 2]);
    if (id === null) return Response.json({ error: 'Invalid id' }, { status: 400, headers: CORS });

    const { status } = await request.json<{ status: string }>();
    if (!VALID_STATUS.has(status)) return Response.json({ error: 'Invalid status' }, { status: 400, headers: CORS });

    await env.DB.prepare('UPDATE bookings SET status=? WHERE id=?').bind(status, id).run();
    return Response.json({ success: true }, { headers: CORS });
  }

  // GET with filters
  const agentIdRaw = url.searchParams.get('agent_id');
  const agentId = agentIdRaw ? parseIntStrict(agentIdRaw) : null;
  const status = url.searchParams.get('status');
  const dateFrom = url.searchParams.get('date_from');
  const dateTo = url.searchParams.get('date_to');

  if (status && !VALID_STATUS.has(status)) {
    return Response.json({ error: 'invalid status filter' }, { status: 400, headers: CORS });
  }
  if (dateFrom && !isDate(dateFrom)) {
    return Response.json({ error: 'invalid date_from' }, { status: 400, headers: CORS });
  }
  if (dateTo && !isDate(dateTo)) {
    return Response.json({ error: 'invalid date_to' }, { status: 400, headers: CORS });
  }

  let q = `SELECT b.*,a.name as agent_name FROM bookings b LEFT JOIN agents a ON b.agent_id=a.id WHERE 1=1`;
  const p: (string | number)[] = [];
  if (agentId !== null) { q += ' AND b.agent_id=?'; p.push(agentId); }
  if (status) { q += ' AND b.status=?'; p.push(status); }
  if (dateFrom) { q += ' AND b.date>=?'; p.push(dateFrom); }
  if (dateTo) { q += ' AND b.date<=?'; p.push(dateTo); }
  q += ' ORDER BY b.date DESC,b.time DESC LIMIT 500';

  const { results } = await env.DB.prepare(q).bind(...p).all();
  return Response.json(results, { headers: CORS });
}

function generateCancelIcs(bookingId: number, date: string, time: string, durationMin: number): string {
  const [year, month, day] = date.split('-');
  const [hour, min] = time.split(':');
  const pad = (n: number) => String(n).padStart(2, '0');
  const startMin = parseInt(hour) * 60 + parseInt(min);
  const endMin = startMin + durationMin;
  const dtstart = `${year}${month}${day}T${hour}${min}00`;
  const dtend = `${year}${month}${day}T${pad(Math.floor(endMin / 60))}${pad(endMin % 60)}00`;
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DFG//Booking//EN', 'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:dfg-booking-${bookingId}@digitsfinancial.tax`,
    `DTSTART;TZID=America/New_York:${dtstart}`,
    `DTEND;TZID=America/New_York:${dtend}`,
    `DTSTAMP:${dtstamp}`,
    'SEQUENCE:1',
    'STATUS:CANCELLED',
    `SUMMARY:${escIcs('Cancelled: DFG Appointment')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n') + '\r\n';
}
