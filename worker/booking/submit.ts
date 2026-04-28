import type { Env } from '../index';
import { isEmail, isDate, isTime, bounded } from '../lib/validate';
import { esc, escIcs } from '../lib/escape';
import { dlog, derr } from '../lib/log';

interface BookingPayload {
  agentId: number;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  turnstileToken: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handleSubmit(request: Request, env: Env): Promise<Response> {
  let body: BookingPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
  }

  const { agentId, date, time, firstName, lastName, email, phone, address, city, state, zip, notes, turnstileToken } = body;

  // Server-side input validation
  const errors: string[] = [];
  if (!Number.isInteger(agentId)) errors.push('agentId');
  if (!isDate(date)) errors.push('date');
  if (!isTime(time)) errors.push('time');
  if (!bounded(firstName, 80)) errors.push('firstName');
  if (!bounded(lastName, 80)) errors.push('lastName');
  if (!isEmail(email)) errors.push('email');
  if (phone != null && phone !== '' && !bounded(phone, 30)) errors.push('phone');
  if (address != null && address !== '' && !bounded(address, 200)) errors.push('address');
  if (city != null && city !== '' && !bounded(city, 100)) errors.push('city');
  if (state != null && state !== '' && (typeof state !== 'string' || state.length > 2)) errors.push('state');
  if (zip != null && zip !== '' && !bounded(zip, 20)) errors.push('zip');
  if (notes != null && typeof notes === 'string' && notes.length > 2000) errors.push('notes');
  if (errors.length) {
    return Response.json({ error: 'Invalid fields', fields: errors }, { status: 400, headers: CORS });
  }

  // 1. Verify Turnstile — fail-closed
  if (!env.TURNSTILE_SECRET_KEY) {
    if (env.DEBUG !== '1') {
      return Response.json({ error: 'CAPTCHA not configured' }, { status: 503, headers: CORS });
    }
  } else {
    if (!turnstileToken) {
      return Response.json({ error: 'CAPTCHA required' }, { status: 422, headers: CORS });
    }
    try {
      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
      });
      const ts = await tsRes.json<{ success: boolean }>();
      if (!ts.success) {
        return Response.json({ error: 'CAPTCHA verification failed' }, { status: 422, headers: CORS });
      }
    } catch (err) {
      derr('[submit] Turnstile verification error:', String(err));
      return Response.json({ error: 'CAPTCHA verification unavailable' }, { status: 503, headers: CORS });
    }
  }

  // 2. Pre-check (UX optimization; UNIQUE index is the source of truth)
  const existing = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM bookings WHERE agent_id=? AND date=? AND time=? AND status!='cancelled'`
  ).bind(agentId, date, time).first<{ cnt: number }>();
  if ((existing?.cnt ?? 0) > 0) {
    return Response.json({ error: 'Time slot no longer available' }, { status: 409, headers: CORS });
  }

  // 3. Fetch agent
  const agent = await env.DB.prepare(
    'SELECT name, notify_email, slot_duration_min FROM agents WHERE id = ? AND active = 1'
  ).bind(agentId).first<{ name: string; notify_email: string; slot_duration_min: number }>();
  if (!agent) {
    return Response.json({ error: 'Agent not found' }, { status: 404, headers: CORS });
  }

  // 4. Insert booking — UNIQUE index catches concurrent races
  let bookingId: number;
  try {
    const result = await env.DB.prepare(`
      INSERT INTO bookings (agent_id,date,time,first_name,last_name,email,phone,address,city,state,zip,notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(agentId, date, time, firstName, lastName, email,
            phone ?? null, address ?? null, city ?? null, state ?? null, zip ?? null, notes ?? null).run();
    bookingId = Number(result.meta.last_row_id);
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return Response.json({ error: 'Time slot no longer available' }, { status: 409, headers: CORS });
    }
    throw err;
  }

  const clientName = `${firstName} ${lastName}`;
  const ics = generateIcs(bookingId, date, time, agent.slot_duration_min ?? 60, agent.name, clientName, notes ?? '');
  const adminUrl = env.ADMIN_URL ?? '/admin';

  // Pre-escape all user-controlled values once for use in HTML email bodies
  const safe = {
    date: esc(date),
    time: esc(time),
    client: esc(clientName),
    email: esc(email),
    phone: esc(phone && phone !== '' ? phone : '-'),
    notes: esc(notes ?? ''),
    first: esc(firstName),
    adminUrl: esc(adminUrl),
  };

  // 5a. Agent notification
  try {
    const notesRow = notes
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;vertical-align:top">Notes</td><td style="padding:6px 0;font-size:14px;color:#111827">${safe.notes}</td></tr>`
      : '';
    const agentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)"><tr><td style="background:#2D2D3F;padding:28px 36px"><span style="color:#00E5A0;font-size:18px;font-weight:700;letter-spacing:-.3px">DFG Booking</span><span style="color:#ffffff;font-size:13px;margin-left:12px;opacity:.6">New appointment</span></td></tr><tr><td style="padding:32px 36px"><p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1a1a2e">New booking received</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px"><tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:90px">Date</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827">${safe.date}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#00E5A0">${safe.time}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Client</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827">${safe.client}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Email</td><td style="padding:6px 0;font-size:14px;color:#111827"><a href="mailto:${safe.email}" style="color:#2D2D3F">${safe.email}</a></td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Phone</td><td style="padding:6px 0;font-size:14px;color:#111827">${safe.phone}</td></tr>${notesRow}</table><a href="${safe.adminUrl}" style="display:inline-block;background:#2D2D3F;color:#00E5A0;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">View in Admin Panel</a></td></tr><tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0"><p style="margin:0;font-size:12px;color:#9ca3af">Digits Financial Group - 18425 NW 2nd Ave, Suite 403, Miami FL 33169</p></td></tr></table></td></tr></table></body></html>`;
    await sendEmail(env, agent.notify_email, `New booking — ${clientName} on ${date} at ${time}`, agentHtml, ics);
    dlog(env, '[submit] agent email sent OK');
  } catch (err) {
    derr('[submit] agent email failed:', String(err));
  }

  // 5b. Client confirmation (CF send_email requires verified destination; fails silently for unverified)
  try {
    const clientHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)"><tr><td style="background:#2D2D3F;padding:28px 36px"><span style="color:#00E5A0;font-size:18px;font-weight:700">DFG Booking</span><span style="color:#ffffff;font-size:13px;margin-left:12px;opacity:.6">Appointment confirmed</span></td></tr><tr><td style="padding:32px 36px"><p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a2e">You're all set, ${safe.first}!</p><p style="margin:0 0 24px;font-size:15px;color:#6b7280">Your appointment with Digits Financial Group is confirmed.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px"><tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:90px">Date</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827">${safe.date}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#00E5A0">${safe.time}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#6b7280">Address</td><td style="padding:6px 0;font-size:14px;color:#111827">18425 NW 2nd Ave, Suite 403, Miami FL 33169</td></tr></table><p style="margin:0;font-size:14px;color:#6b7280">Questions? <a href="tel:+13059272731" style="color:#2D2D3F">+1 305-927-2731</a> · <a href="mailto:info@digitsfinancial.tax" style="color:#2D2D3F">info@digitsfinancial.tax</a></p></td></tr><tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0"><p style="margin:0;font-size:12px;color:#9ca3af">Digits Financial Group · 18425 NW 2nd Ave, Suite 403, Miami FL 33169</p></td></tr></table></td></tr></table></body></html>`;
    await sendEmail(env, email, `Appointment confirmed — ${date} at ${time}`, clientHtml, ics);
    dlog(env, '[submit] client email sent OK');
  } catch (err) {
    derr('[submit] client email failed:', String(err));
  }

  return Response.json({ success: true, bookingId }, { headers: CORS });
}

// ─── Email via CF Email Service binding ──────────────────────────────────────

async function sendEmail(env: Env, to: string, subject: string, html: string, icsContent?: string) {
  await env.EMAIL.send({
    to,
    from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
    subject,
    html,
    ...(icsContent ? {
      attachments: [{
        content: icsContent,
        filename: 'appointment.ics',
        type: 'text/calendar; method=REQUEST',
        disposition: 'attachment' as const,
      }],
    } : {}),
  });
}

// ─── ICS generator ───────────────────────────────────────────────────────────

function generateIcs(bookingId: number, date: string, time: string, durationMin: number, agentName: string, clientName: string, notes: string): string {
  const [year, month, day] = date.split('-');
  const [hour, min] = time.split(':');
  const pad = (n: number) => String(n).padStart(2, '0');
  const startMin = parseInt(hour) * 60 + parseInt(min);
  const endMin = startMin + durationMin;
  const dtstart = `${year}${month}${day}T${hour}${min}00`;
  const dtend = `${year}${month}${day}T${pad(Math.floor(endMin / 60))}${pad(endMin % 60)}00`;
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const summaryClient = escIcs(clientName.split(' ')[0] ?? '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DFG//Booking//EN', 'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:dfg-booking-${bookingId}@digitsfinancial.tax`,
    `DTSTART;TZID=America/New_York:${dtstart}`,
    `DTEND;TZID=America/New_York:${dtend}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:DFG — ${summaryClient}`,
    `DESCRIPTION:Agent: ${escIcs(agentName)}\\nClient: ${escIcs(clientName)}\\nNotes: ${escIcs(notes)}`,
    'LOCATION:18425 NW 2nd Ave Suite 403 Miami FL 33169',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n') + '\r\n';
}
