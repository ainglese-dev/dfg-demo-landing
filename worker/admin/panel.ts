import type { Env } from '../index';
import { verifyAccessJwt, extractAccessToken } from '../lib/auth';
import { esc, escJs } from '../lib/escape';
import { derr } from '../lib/log';

const ICONS = {
  dashboard: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  bookings:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  settings:  `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

const STATUS_BADGE: Record<string, string> = {
  pending:   'background:#fef3c7;color:#92400e',
  confirmed: 'background:#d1fae5;color:#065f46',
  cancelled: 'background:#fee2e2;color:#991b1b',
  completed: 'background:#dbeafe;color:#1e40af',
};

function badge(status: string): string {
  const s = STATUS_BADGE[String(status)] ?? 'background:#f3f4f6;color:#374151';
  return `<span style="display:inline-block;padding:.2em .65em;border-radius:999px;font-size:.7rem;font-weight:600;white-space:nowrap;${s}">${esc(status)}</span>`;
}

function htmlPage(env: Env, title: string, body: string, activePage: string, adminToken: string): string {
  const tabs = [
    { href: '/admin',          icon: ICONS.dashboard, label: 'Home'     },
    { href: '/admin/bookings', icon: ICONS.bookings,  label: 'Bookings' },
    { href: '/admin/settings', icon: ICONS.settings,  label: 'Settings' },
  ];

  const settingsPaths = ['/admin/settings', '/admin/agents', '/admin/groups', '/admin/blackouts'];
  const normalizedActive = settingsPaths.includes(activePage) ? '/admin/settings' : activePage;

  const tabsHtml = tabs.map(({ href, icon, label }) => {
    const color = normalizedActive === href ? '#00E5A0' : '#9ca3af';
    return `<a href="${href}" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:10px 2px;min-height:56px;color:${color};text-decoration:none;transition:color .15s">
      ${icon}
      <span style="font-size:9px;font-weight:500;line-height:1;letter-spacing:.01em">${label}</span>
    </a>`;
  }).join('');

  const logoutUrl = esc(env.CF_ACCESS_LOGOUT_URL ?? '#');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>${esc(title)} — DFG Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Work+Sans:wght@400;500;600&display=swap"/>
  <script>window.__adminToken=${escJs(adminToken)};</script>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
    body { font-family: 'Work Sans', sans-serif; background: #f9fafb; }
    h1, h2, h3, h4 { font-family: 'Fraunces', serif; }
    dialog::backdrop { background: rgba(0,0,0,.55); }
    details summary { cursor: pointer; }
    table { width: 100%; border-collapse: collapse; font-size: .875rem; }
    thead th { background: #f3f4f6; padding: .6rem .75rem; text-align: left; font-weight: 600; font-size: .75rem; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    tbody td { padding: .7rem .75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    input, select, textarea { width: 100%; padding: .5rem .75rem; border: 1px solid #d1d5db; border-radius: .5rem; font-size: .875rem; font-family: 'Work Sans', sans-serif; background: white; transition: border-color .15s, box-shadow .15s; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #00E5A0; box-shadow: 0 0 0 3px rgba(0,229,160,.15); }
    label { display: flex; flex-direction: column; gap: .35rem; font-size: .8rem; font-weight: 500; color: #374151; }
    button[type="submit"], .btn-primary { background: #2D2D3F; color: white; border: none; padding: .6rem 1.25rem; border-radius: .5rem; font-size: .875rem; font-weight: 500; cursor: pointer; font-family: 'Work Sans', sans-serif; transition: opacity .15s; white-space: nowrap; }
    button[type="submit"]:hover, .btn-primary:hover { opacity: .88; }
    .btn-danger { background: #fee2e2; color: #991b1b; border: none; padding: .6rem 1.25rem; border-radius: .5rem; font-size: .875rem; font-weight: 500; cursor: pointer; font-family: 'Work Sans', sans-serif; }
    .btn-ghost { background: transparent; color: #6b7280; border: 1px solid #e5e7eb; padding: .6rem 1.25rem; border-radius: .5rem; font-size: .875rem; font-weight: 500; cursor: pointer; font-family: 'Work Sans', sans-serif; }
    .card { background: white; border-radius: .75rem; border: 1px solid #e5e7eb; overflow: hidden; }
    .section-title { font-size: 1.25rem; font-weight: 600; color: #2D2D3F; margin: 0 0 1rem; }
    .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  </style>
</head>
<body>
  <header class="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14" style="background:#2D2D3F">
    <h1 class="text-base font-semibold tracking-tight" style="color:#00E5A0;font-family:Fraunces,serif">DFG Admin</h1>
    <a href="${logoutUrl}" class="text-xs px-3 py-1.5 rounded-lg border transition-colors" style="color:#f87171;border-color:rgba(248,113,113,.3)">Logout</a>
  </header>

  <main class="pt-16 pb-24 px-4 max-w-4xl mx-auto">
    ${body}
  </main>

  <nav class="fixed bottom-0 inset-x-0 z-40 flex border-t" style="background:#2D2D3F;border-color:rgba(255,255,255,.1);padding-bottom:env(safe-area-inset-bottom)">
    ${tabsHtml}
  </nav>
</body>
</html>`;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

async function renderDashboard(env: Env): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM bookings WHERE date=? AND status!='cancelled'`
  ).bind(today).first<{ cnt: number }>();
  const upcoming = await env.DB.prepare(`
    SELECT b.*, a.name as agent_name, g.name as group_name
    FROM bookings b
    LEFT JOIN agents a ON b.agent_id = a.id
    LEFT JOIN agent_groups g ON a.group_id = g.id
    WHERE b.date >= ? AND b.status != 'cancelled'
    ORDER BY b.date, b.time LIMIT 20
  `).bind(today).all<Record<string, unknown>>();

  const bookingsMap = Object.fromEntries(upcoming.results.map((b) => [
    String(b.id),
    { id: b.id, date: b.date, time: b.time, first_name: b.first_name, last_name: b.last_name,
      email: b.email, phone: b.phone ?? '', agent_name: b.agent_name ?? '—', status: b.status },
  ]));

  const rows = upcoming.results.map((b) =>
    `<tr onclick="openBooking(${escJs(b.id)})" style="cursor:pointer">
      <td style="white-space:nowrap;font-weight:500">${esc(b.date)}</td>
      <td>${esc(b.time)}</td>
      <td style="font-weight:500">${esc(b.first_name)} ${esc(b.last_name)}</td>
      <td class="hidden sm:table-cell" style="color:#6b7280;font-size:.875rem">${esc(b.email)}</td>
      <td class="hidden md:table-cell" style="color:#6b7280;font-size:.875rem">${esc(b.agent_name ?? '—')}</td>
      <td class="hidden md:table-cell" style="color:#6b7280;font-size:.875rem">${esc(b.group_name ?? '—')}</td>
      <td>${badge(String(b.status))}</td>
    </tr>`
  ).join('');

  return `<h2 class="section-title mt-4">Dashboard</h2>

  <div class="grid gap-3 mb-6" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
    <div class="card p-5">
      <div class="text-3xl font-bold" style="color:#2D2D3F">${todayCount?.cnt ?? 0}</div>
      <div class="text-sm text-gray-500 mt-1">Bookings today</div>
    </div>
  </div>

  <h3 class="text-base font-semibold text-gray-700 mb-3">Upcoming bookings</h3>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Date</th><th>Time</th><th>Client</th>
          <th class="hidden sm:table-cell">Email</th>
          <th class="hidden md:table-cell">Agent</th>
          <th class="hidden md:table-cell">Group</th>
          <th>Status</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9ca3af">No upcoming bookings</td></tr>'}</tbody>
      </table>
    </div>
    <p style="font-size:.75rem;color:#9ca3af;padding:.5rem 1rem;border-top:1px solid #f3f4f6">Tap a row to view details</p>
  </div>

  <!-- Booking detail modal -->
  <dialog id="booking-modal" style="border:none;border-radius:1rem;box-shadow:0 20px 60px rgba(0,0,0,.2);padding:0;width:calc(100% - 2rem);max-width:400px;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);margin:0;max-height:90vh;overflow-y:auto">
    <div style="padding:1.25rem">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem">
        <div>
          <p style="margin:0;font-size:.7rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Booking</p>
          <h2 style="margin:0;font-size:1.2rem;font-weight:600;color:#2D2D3F;font-family:Fraunces,serif">#<span id="m-id"></span></h2>
        </div>
        <button onclick="document.getElementById('booking-modal').close()" aria-label="Close"
          style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:.25rem;border-radius:.375rem;line-height:0">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:.75rem;padding:1rem;margin-bottom:1rem">
        <p style="margin:0 0 .25rem;font-weight:600;color:#111827" id="m-name"></p>
        <p style="margin:0 0 .15rem;font-size:.875rem;color:#6b7280" id="m-email"></p>
        <p style="margin:0 0 .75rem;font-size:.875rem;color:#6b7280" id="m-phone"></p>
        <p style="margin:0 0 .15rem;font-size:.875rem;font-weight:500;color:#374151" id="m-datetime"></p>
        <p style="margin:0;font-size:.875rem;color:#6b7280">Agent: <span id="m-agent"></span></p>
      </div>
      <div id="m-done-notice" style="display:none;background:#f3f4f6;border-radius:.5rem;padding:.75rem 1rem;margin-bottom:1rem;font-size:.875rem;color:#6b7280;text-align:center"></div>
      <div id="m-cancel-section">
        <label style="display:flex;flex-direction:column;gap:.35rem;font-size:.8rem;font-weight:500;color:#374151;margin-bottom:.75rem">
          Reason for cancellation <span style="color:#ef4444">*</span>
          <textarea id="m-reason" rows="2" oninput="onReasonInput()"
            placeholder="e.g. Agent unavailable on this date"
            style="resize:none;padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:.5rem;font-size:.875rem;font-family:inherit"></textarea>
        </label>
        <button id="m-cancel-btn" onclick="cancelBookingFromModal()" disabled
          style="width:100%;padding:.7rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;font-family:inherit;cursor:pointer;background:#fee2e2;color:#991b1b;opacity:.5">
          Cancel &amp; Notify Client
        </button>
      </div>
    </div>
  </dialog>

  <script>
  var BOOKINGS = ${escJs(bookingsMap)};
  var cfJwt = function(){ return window.__adminToken || ''; };

  function openBooking(id) {
    var b = BOOKINGS[String(id)];
    var modal = document.getElementById('booking-modal');
    document.getElementById('m-id').textContent = b.id;
    document.getElementById('m-name').textContent = b.first_name + ' ' + b.last_name;
    document.getElementById('m-email').textContent = b.email;
    document.getElementById('m-phone').textContent = b.phone || '—';
    document.getElementById('m-datetime').textContent = b.date + ' at ' + b.time;
    document.getElementById('m-agent').textContent = b.agent_name;
    modal.dataset.id = b.id;
    var cancellable = b.status !== 'cancelled' && b.status !== 'completed';
    document.getElementById('m-cancel-section').style.display = cancellable ? '' : 'none';
    var doneNotice = document.getElementById('m-done-notice');
    doneNotice.style.display = cancellable ? 'none' : '';
    doneNotice.textContent = 'This booking is ' + b.status + '.';
    if (cancellable) {
      document.getElementById('m-reason').value = '';
      var btn = document.getElementById('m-cancel-btn');
      btn.disabled = true; btn.style.opacity = '.5';
    }
    modal.showModal();
  }

  function onReasonInput() {
    var reason = document.getElementById('m-reason').value.trim();
    var btn = document.getElementById('m-cancel-btn');
    btn.disabled = reason.length === 0;
    btn.style.opacity = reason.length > 0 ? '1' : '.5';
  }

  async function cancelBookingFromModal() {
    var modal  = document.getElementById('booking-modal');
    var id     = modal.dataset.id;
    var reason = document.getElementById('m-reason').value.trim();
    if (!reason) return;
    var btn = document.getElementById('m-cancel-btn');
    btn.disabled = true; btn.textContent = 'Cancelling…'; btn.style.opacity = '.6';
    var r = await fetch('/api/admin/bookings/' + encodeURIComponent(id) + '/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': cfJwt() },
      body: JSON.stringify({ reason: reason })
    });
    if (r.ok) { modal.close(); location.reload(); }
    else {
      btn.disabled = false; btn.style.opacity = '1';
      btn.textContent = 'Cancel & Notify Client';
      alert('Failed to cancel. Please try again.');
    }
  }
  </script>`;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

async function renderBookings(env: Env, url: URL): Promise<string> {
  const agentId  = url.searchParams.get('agent_id') ?? '';
  const status   = url.searchParams.get('status')   ?? '';
  const dateFrom = url.searchParams.get('date_from') ?? '';
  const dateTo   = url.searchParams.get('date_to')   ?? '';

  const agents = await env.DB.prepare('SELECT id,name FROM agents ORDER BY name').all<{ id: number; name: string }>();
  const agentOptions = agents.results.map((a) =>
    `<option value="${esc(a.id)}"${agentId === String(a.id) ? ' selected' : ''}>${esc(a.name)}</option>`
  ).join('');

  let q = `SELECT b.*,a.name as agent_name FROM bookings b LEFT JOIN agents a ON b.agent_id=a.id WHERE 1=1`;
  const p: (string | number)[] = [];
  if (agentId)  { q += ' AND b.agent_id=?'; p.push(agentId); }
  if (status)   { q += ' AND b.status=?';   p.push(status); }
  if (dateFrom) { q += ' AND b.date>=?';    p.push(dateFrom); }
  if (dateTo)   { q += ' AND b.date<=?';    p.push(dateTo); }
  q += ' ORDER BY b.date ASC, b.time ASC LIMIT 500';

  const { results } = await env.DB.prepare(q).bind(...p).all<Record<string, unknown>>();
  const today = new Date().toISOString().slice(0, 10);

  const pastRows     = results.filter((b) => String(b.date) < today).reverse();
  const todayRows    = results.filter((b) => String(b.date) === today);
  const upcomingRows = results.filter((b) => String(b.date) > today);

  const bookingsMap = Object.fromEntries(results.map((b) => [
    String(b.id),
    { id: b.id, date: b.date, time: b.time, first_name: b.first_name, last_name: b.last_name,
      email: b.email, phone: b.phone ?? '', agent_name: b.agent_name ?? '—', status: b.status },
  ]));

  const chevron = `<svg width="14" height="14" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`;

  const tableHead = `<thead><tr>
    <th class="hidden sm:table-cell">#</th>
    <th>Date</th>
    <th class="hidden sm:table-cell">Time</th>
    <th>Client</th>
    <th class="hidden md:table-cell">Email</th>
    <th class="hidden lg:table-cell">Phone</th>
    <th class="hidden md:table-cell">Agent</th>
    <th>Status</th>
    <th class="hidden sm:table-cell"></th>
  </tr></thead>`;

  const renderRows = (rows: Record<string, unknown>[], emptyMsg: string) => {
    if (!rows.length) return `<tr><td colspan="9" style="text-align:center;padding:2.5rem 1rem;color:#9ca3af">${emptyMsg}</td></tr>`;
    return rows.map((b) =>
      `<tr onclick="openBooking(${escJs(b.id)})" style="cursor:pointer">
        <td class="hidden sm:table-cell" style="color:#9ca3af;font-size:.75rem">#${esc(b.id)}</td>
        <td style="white-space:nowrap;font-weight:500">${esc(b.date)}</td>
        <td class="hidden sm:table-cell" style="color:#6b7280;white-space:nowrap">${esc(b.time)}</td>
        <td>${esc(b.first_name)} ${esc(b.last_name)}</td>
        <td class="hidden md:table-cell" style="color:#6b7280;font-size:.875rem">${esc(b.email)}</td>
        <td class="hidden lg:table-cell" style="color:#6b7280;font-size:.875rem;white-space:nowrap">${esc(b.phone ?? '')}</td>
        <td class="hidden md:table-cell" style="color:#6b7280;font-size:.875rem">${esc(b.agent_name ?? '—')}</td>
        <td>${badge(String(b.status))}</td>
        <td class="hidden sm:table-cell">${chevron}</td>
      </tr>`
    ).join('');
  };

  // CSV export uses JS fetch to carry the JWT header (plain <a href> strips custom headers)
  const csvParams = new URLSearchParams(url.searchParams).toString();

  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem;margin-bottom:1rem">
    <h2 class="section-title mb-0">Bookings</h2>
    <button onclick="exportCsv()" class="btn-ghost" style="padding:.4rem .9rem;font-size:.875rem">Export CSV</button>
  </div>

  <details class="card mb-4 overflow-visible">
    <summary class="px-4 py-3 text-sm font-medium text-gray-600 flex items-center gap-2">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
      Filter bookings
    </summary>
    <form method="GET" action="/admin/bookings" class="p-4 pt-0 flex flex-wrap gap-3 items-end border-t border-gray-100">
      <label class="min-w[140px] flex-1">Agent
        <select name="agent_id"><option value="">All agents</option>${agentOptions}</select>
      </label>
      <label class="min-w-[130px] flex-1">Status
        <select name="status">
          <option value="">All</option>
          ${['pending','confirmed','cancelled','completed'].map((s) => `<option${status===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </label>
      <label class="min-w-[130px] flex-1">From<input type="date" name="date_from" value="${esc(dateFrom)}"/></label>
      <label class="min-w-[130px] flex-1">To<input type="date" name="date_to" value="${esc(dateTo)}"/></label>
      <button type="submit">Apply</button>
    </form>
  </details>

  <!-- Tabs: Past | Today | Upcoming -->
  <div style="display:flex;gap:.5rem;margin-bottom:1rem">
    <button id="btn-past"     onclick="showTab('past')"     style="flex:1;padding:.6rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;cursor:pointer;font-family:inherit">
      Past <span style="font-size:.75rem;opacity:.7">(${pastRows.length})</span>
    </button>
    <button id="btn-today"    onclick="showTab('today')"    style="flex:1;padding:.6rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;cursor:pointer;font-family:inherit">
      Today <span style="font-size:.75rem;opacity:.7">(${todayRows.length})</span>
    </button>
    <button id="btn-upcoming" onclick="showTab('upcoming')" style="flex:1;padding:.6rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;cursor:pointer;font-family:inherit">
      Upcoming <span style="font-size:.75rem;opacity:.7">(${upcomingRows.length})</span>
    </button>
  </div>

  <div class="card">
    <div id="tab-past"     class="table-wrap" style="display:none">
      <table>${tableHead}<tbody>${renderRows(pastRows,     'No past bookings')}</tbody></table>
    </div>
    <div id="tab-today"    class="table-wrap" style="display:none">
      <table>${tableHead}<tbody>${renderRows(todayRows,    'No bookings today')}</tbody></table>
    </div>
    <div id="tab-upcoming" class="table-wrap" style="display:none">
      <table>${tableHead}<tbody>${renderRows(upcomingRows, 'No upcoming bookings')}</tbody></table>
    </div>
    <p style="font-size:.75rem;color:#9ca3af;padding:.5rem 1rem;border-top:1px solid #f3f4f6">Tap a row to view details</p>
  </div>

  <!-- Booking detail modal -->
  <dialog id="booking-modal" style="border:none;border-radius:1rem;box-shadow:0 20px 60px rgba(0,0,0,.2);padding:0;width:calc(100% - 2rem);max-width:400px;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);margin:0;max-height:90vh;overflow-y:auto">
    <div style="padding:1.25rem">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem">
        <div>
          <p style="margin:0;font-size:.7rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Booking</p>
          <h2 style="margin:0;font-size:1.2rem;font-weight:600;color:#2D2D3F;font-family:Fraunces,serif">#<span id="m-id"></span></h2>
        </div>
        <button onclick="document.getElementById('booking-modal').close()" aria-label="Close"
          style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:.25rem;border-radius:.375rem;line-height:0">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:.75rem;padding:1rem;margin-bottom:1rem">
        <p style="margin:0 0 .25rem;font-weight:600;color:#111827" id="m-name"></p>
        <p style="margin:0 0 .15rem;font-size:.875rem;color:#6b7280" id="m-email"></p>
        <p style="margin:0 0 .75rem;font-size:.875rem;color:#6b7280" id="m-phone"></p>
        <p style="margin:0 0 .15rem;font-size:.875rem;font-weight:500;color:#374151" id="m-datetime"></p>
        <p style="margin:0;font-size:.875rem;color:#6b7280">Agent: <span id="m-agent"></span></p>
      </div>
      <div id="m-done-notice" style="display:none;background:#f3f4f6;border-radius:.5rem;padding:.75rem 1rem;margin-bottom:1rem;font-size:.875rem;color:#6b7280;text-align:center"></div>
      <div id="m-cancel-section">
        <label style="display:flex;flex-direction:column;gap:.35rem;font-size:.8rem;font-weight:500;color:#374151;margin-bottom:.75rem">
          Reason for cancellation <span style="color:#ef4444">*</span>
          <textarea id="m-reason" rows="2" oninput="onReasonInput()"
            placeholder="e.g. Agent unavailable on this date"
            style="resize:none;padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:.5rem;font-size:.875rem;font-family:inherit"></textarea>
        </label>
        <button id="m-cancel-btn" onclick="cancelBookingFromModal()" disabled
          style="width:100%;padding:.7rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;font-family:inherit;cursor:pointer;background:#fee2e2;color:#991b1b;opacity:.5">
          Cancel &amp; Notify Client
        </button>
      </div>
    </div>
  </dialog>

  <script>
  var BOOKINGS = ${escJs(bookingsMap)};
  var CSV_PARAMS = ${escJs(csvParams)};
  var TODAY_COUNT = ${todayRows.length};
  var UPCOMING_COUNT = ${upcomingRows.length};
  var cfJwt = function(){ return window.__adminToken || ''; };

  function showTab(name) {
    ['past','today','upcoming'].forEach(function(t) {
      document.getElementById('tab-' + t).style.display = t === name ? '' : 'none';
      var btn = document.getElementById('btn-' + t);
      btn.style.background = t === name ? '#2D2D3F' : '#f3f4f6';
      btn.style.color      = t === name ? '#ffffff'  : '#374151';
    });
  }
  // Auto-select: Today if has entries, else Upcoming, else Past
  (function() {
    var tab = TODAY_COUNT > 0 ? 'today' : UPCOMING_COUNT > 0 ? 'upcoming' : 'past';
    showTab(tab);
  })();

  function openBooking(id) {
    var b = BOOKINGS[String(id)];
    var modal = document.getElementById('booking-modal');
    document.getElementById('m-id').textContent = b.id;
    document.getElementById('m-name').textContent = b.first_name + ' ' + b.last_name;
    document.getElementById('m-email').textContent = b.email;
    document.getElementById('m-phone').textContent = b.phone || '—';
    document.getElementById('m-datetime').textContent = b.date + ' at ' + b.time;
    document.getElementById('m-agent').textContent = b.agent_name;
    modal.dataset.id = b.id;
    var cancellable = b.status !== 'cancelled' && b.status !== 'completed';
    document.getElementById('m-cancel-section').style.display = cancellable ? '' : 'none';
    var doneNotice = document.getElementById('m-done-notice');
    doneNotice.style.display = cancellable ? 'none' : '';
    doneNotice.textContent = 'This booking is ' + b.status + '.';
    if (cancellable) {
      document.getElementById('m-reason').value = '';
      var btn = document.getElementById('m-cancel-btn');
      btn.disabled = true; btn.style.opacity = '.5';
    }
    modal.showModal();
  }

  function onReasonInput() {
    var reason = document.getElementById('m-reason').value.trim();
    var btn = document.getElementById('m-cancel-btn');
    btn.disabled = reason.length === 0;
    btn.style.opacity = reason.length > 0 ? '1' : '.5';
  }

  async function cancelBookingFromModal() {
    var modal  = document.getElementById('booking-modal');
    var id     = modal.dataset.id;
    var reason = document.getElementById('m-reason').value.trim();
    if (!reason) return;
    var btn = document.getElementById('m-cancel-btn');
    btn.disabled = true; btn.textContent = 'Cancelling…'; btn.style.opacity = '.6';
    var r = await fetch('/api/admin/bookings/' + encodeURIComponent(id) + '/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': cfJwt() },
      body: JSON.stringify({ reason: reason })
    });
    if (r.ok) { modal.close(); location.reload(); }
    else {
      btn.disabled = false; btn.style.opacity = '1';
      btn.textContent = 'Cancel & Notify Client';
      alert('Failed to cancel. Please try again.');
    }
  }

  async function exportCsv() {
    var r = await fetch('/api/admin/bookings/export.csv?' + CSV_PARAMS, {
      headers: { 'Cf-Access-Jwt-Assertion': cfJwt() }
    });
    if (!r.ok) { alert('Export failed (' + r.status + ')'); return; }
    var blob = await r.blob();
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bookings.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
  </script>`;
}

// ─── Settings (General + Agents + Blackouts) ──────────────────────────────────

async function renderSettings(env: Env, defaultTab = 'general'): Promise<string> {
  const [agentsRes, blackoutsRes, settingsRes] = await Promise.all([
    env.DB.prepare('SELECT * FROM agents ORDER BY name').all<Record<string, unknown>>(),
    env.DB.prepare('SELECT b.*,a.name as agent_name FROM blackouts b LEFT JOIN agents a ON b.agent_id=a.id ORDER BY b.date').all<Record<string, unknown>>(),
    env.DB.prepare('SELECT key,value FROM settings').all<{ key: string; value: string }>(),
  ]);

  const s = Object.fromEntries(settingsRes.results.map((r) => [r.key, r.value]));
  const agentOptions = agentsRes.results.map((a) =>
    `<option value="${esc(a.id)}">${esc(a.name)}</option>`
  ).join('');

  const tabs = ['general', 'agents', 'blackouts'] as const;

  const tabBtns = tabs.map((t) => {
    const labels: Record<string, string> = { general: 'General', agents: 'Agents', blackouts: 'Blackouts' };
    const active = defaultTab === t;
    return `<button onclick="showSettingsTab('${t}')" id="stab-${t}"
      style="padding:.55rem .9rem;border-radius:.5rem;border:none;font-size:.8rem;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;background:${active ? '#2D2D3F' : '#f3f4f6'};color:${active ? '#ffffff' : '#374151'}">
      ${labels[t]}
    </button>`;
  }).join('');

  // ── General ──
  const generalHtml = `
    <div class="card p-5 max-w-md">
      <form onsubmit="saveSettings(event)" class="space-y-4">
        <label>Meeting duration (minutes)
          <input name="meeting_duration_min" type="number" value="${esc(s.meeting_duration_min ?? 60)}" min="15" max="240"/>
        </label>
        <label>Timezone
          <input name="timezone" value="${esc(s.timezone ?? 'America/New_York')}" placeholder="e.g. America/New_York"/>
        </label>
        <button type="submit">Save Settings</button>
      </form>
    </div>`;

  // ── Agents ──
  const SERVICES = ['Tax Preparation','Bookkeeping','Credit Repair','Line of Credit','Entity Creation','Life Insurance','Public Notary'];

  const serviceCheckboxes = (prefix: string, checked: string[] = []) =>
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem .75rem">
      ${SERVICES.map((name) => `<label style="flex-direction:row;align-items:center;gap:.5rem;font-weight:400;cursor:pointer">
        <input type="checkbox" name="${prefix}" value="${esc(name)}"${checked.includes(name) ? ' checked' : ''} style="width:auto;margin:0"/>
        <span style="font-size:.8rem">${esc(name)}</span>
      </label>`).join('')}
    </div>`;

  const PRESET_COLORS = ['#00E5A0','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#10B981','#F97316','#6366F1','#EC4899','#14B8A6'];

  const colorSwatchRow = (hiddenId: string, pickerId: string, current = '#00E5A0') =>
    `<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-top:.25rem">
      ${PRESET_COLORS.map((c) => `<button type="button"
        onclick="selectAccentColor('${hiddenId}','${pickerId}','${c}')"
        title="${c}"
        style="width:26px;height:26px;border-radius:50%;background:${c};border:2.5px solid ${c === current ? '#2D2D3F' : 'transparent'};cursor:pointer;flex-shrink:0;transition:border-color .15s"
        id="${hiddenId}-sw-${c.slice(1)}"></button>`).join('')}
      <input type="color" id="${pickerId}" value="${current}"
        onchange="selectAccentColor('${hiddenId}','${pickerId}',this.value)"
        style="width:26px;height:26px;padding:1px;border:2px solid #d1d5db;border-radius:50%;cursor:pointer;flex-shrink:0;background:none" title="Custom color"/>
    </div>
    <input type="hidden" id="${hiddenId}" name="accent_color" value="${current}"/>`;

  // Serialize agent data for the JS edit modal — escJs prevents <script> escape
  const agentArray = agentsRes.results.map((a) => ({
    id: a.id, name: a.name, title: a.title ?? '', notify_email: a.notify_email,
    slot_duration_min: a.slot_duration_min ?? 60, active: a.active,
    working_hours: a.working_hours ?? '',
    accent_color: (a.accent_color as string) || '#00E5A0',
    specializations: (() => { try { return JSON.parse(a.specializations as string ?? '[]'); } catch { return []; } })(),
  }));

  const agentRows = agentsRes.results.map((a) => {
    const isActive = Boolean(a.active);
    const rawColor = (a.accent_color as string) || '#00E5A0';
    const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : '#00E5A0';
    const statusStyle = isActive
      ? 'background:#d1fae5;color:#065f46'
      : 'background:#f3f4f6;color:#6b7280';
    const statusLabel = isActive ? 'Active' : 'Inactive';
    return `<tr onclick="openAgentEdit(${escJs(a.id)})" style="cursor:pointer">
      <td class="hidden sm:table-cell" style="color:#9ca3af;font-size:.75rem">#${esc(a.id)}</td>
      <td style="font-weight:500">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:.4rem;vertical-align:middle;flex-shrink:0"></span>${esc(a.name)}
      </td>
      <td class="hidden sm:table-cell" style="color:#6b7280;font-size:.875rem">${esc(a.title ?? '')}</td>
      <td class="hidden lg:table-cell" style="color:#6b7280;font-size:.875rem">${esc(a.notify_email)}</td>
      <td><span style="display:inline-block;padding:.2em .65em;border-radius:999px;font-size:.7rem;font-weight:600;white-space:nowrap;${statusStyle}">${statusLabel}</span></td>
    </tr>`;
  }).join('');

  const agentsHtml = `
    <details class="card mb-4 overflow-visible">
      <summary class="px-4 py-3 text-sm font-medium text-gray-600">+ Add New Agent</summary>
      <form onsubmit="createAgent(event)" class="p-4 pt-3 border-t border-gray-100 space-y-4">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
          <label>Name<input name="name" required placeholder="Full name"/></label>
          <label>Title<input name="title" placeholder="e.g. Tax Specialist"/></label>
          <label>Email<input name="notify_email" type="email" required placeholder="agent@example.com"/></label>
          <label>Slot duration (min)<input name="slot_duration_min" type="number" value="60"/></label>
        </div>
        <label style="gap:.5rem">Specializations
          ${serviceCheckboxes('specializations')}
        </label>
        <label style="gap:.4rem">Accent Color
          ${colorSwatchRow('nc-color-value','nc-color-picker')}
        </label>
        <label>Working hours JSON (Mon–Fri keys 1–5)
          <textarea name="working_hours" rows="2">{"1":["10:00","22:00"],"2":["10:00","22:00"],"3":["10:00","22:00"],"4":["10:00","22:00"],"5":["10:00","22:00"]}</textarea>
        </label>
        <button type="submit">Create Agent</button>
      </form>
    </details>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th class="hidden sm:table-cell">#</th><th>Name</th>
            <th class="hidden sm:table-cell">Title</th>
            <th class="hidden lg:table-cell">Email</th>
            <th>Status</th>
          </tr></thead>
          <tbody>${agentRows || '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#9ca3af">No agents</td></tr>'}</tbody>
        </table>
      </div>
      <p style="font-size:.75rem;color:#9ca3af;padding:.5rem 1rem;border-top:1px solid #f3f4f6">Tap a row to edit</p>
    </div>

    <!-- Agent edit modal -->
    <dialog id="agent-modal" style="border:none;border-radius:1rem;box-shadow:0 20px 60px rgba(0,0,0,.2);padding:0;width:calc(100% - 2rem);max-width:480px;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);margin:0;max-height:90vh;overflow-y:auto">
      <div style="padding:1.25rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
          <h2 style="margin:0;font-size:1.1rem;font-weight:600;color:#2D2D3F;font-family:Fraunces,serif">Edit Agent</h2>
          <button onclick="document.getElementById('agent-modal').close()" aria-label="Close"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:.25rem;line-height:0">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form id="agent-edit-form" onsubmit="saveAgent(event)" class="space-y-3">
          <input type="hidden" id="ae-id"/>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
            <label style="grid-column:1/-1">Name <span style="color:#ef4444">*</span>
              <input id="ae-name" name="name" required/>
            </label>
            <label>Title<input id="ae-title" name="title"/></label>
            <label>Notify email <span style="color:#ef4444">*</span>
              <input id="ae-email" name="notify_email" type="email" required/>
            </label>
            <label>Slot (min)<input id="ae-slot" name="slot_duration_min" type="number" min="15"/></label>
          </div>
          <label style="gap:.5rem">Specializations
            <div id="ae-specs" style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem .75rem;margin-top:.25rem">
              ${SERVICES.map((name) => `<label style="flex-direction:row;align-items:center;gap:.5rem;font-weight:400;cursor:pointer">
                <input type="checkbox" class="ae-spec-cb" value="${esc(name)}" style="width:auto;margin:0"/>
                <span style="font-size:.8rem">${esc(name)}</span>
              </label>`).join('')}
            </div>
          </label>
          <label style="gap:.4rem">Accent Color
            ${colorSwatchRow('ae-color-value','ae-color-picker')}
          </label>
          <label>Working hours JSON
            <textarea id="ae-hours" name="working_hours" rows="2" style="resize:none"></textarea>
          </label>
          <div style="display:flex;gap:.5rem;margin-top:.25rem">
            <button type="submit" class="btn-primary" style="flex:1">Save Changes</button>
            <button type="button" id="ae-toggle-btn" onclick="toggleAgentFromModal()" style="flex:1;padding:.6rem 1rem;border-radius:.5rem;border:none;font-size:.875rem;font-weight:500;cursor:pointer;font-family:inherit"></button>
          </div>
        </form>
      </div>
    </dialog>`;

  // ── Blackouts ──
  const blackoutRows = blackoutsRes.results.map((b) =>
    `<tr>
      <td style="white-space:nowrap;font-weight:500">${esc(b.date)}</td>
      <td style="color:#6b7280;font-size:.875rem">${esc(b.agent_name ?? 'All agents')}</td>
      <td style="color:#6b7280;font-size:.875rem">${esc(b.reason ?? '')}</td>
      <td><button onclick="deleteBlackout(${escJs(b.id)})" class="btn-danger" style="font-size:.8rem;padding:.3rem .7rem">Delete</button></td>
    </tr>`
  ).join('');

  const blackoutsHtml = `
    <details class="card mb-4 overflow-visible" open>
      <summary class="px-4 py-3 text-sm font-medium text-gray-600">+ Add Blackout Date</summary>
      <form onsubmit="createBlackout(event)" class="p-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 items-end">
        <label class="flex-1 min-w-[150px]">Agent
          <select name="agent_id"><option value="">All agents</option>${agentOptions}</select>
        </label>
        <label class="flex-1 min-w-[140px]">From<input type="date" name="date_from" required/></label>
        <label class="flex-1 min-w-[140px]">To (range)<input type="date" name="date_to"/></label>
        <label class="flex-1 min-w-[160px]">Reason<input name="reason" placeholder="Optional"/></label>
        <button type="submit">Add Blackout</button>
      </form>
    </details>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Agent</th><th>Reason</th><th></th></tr></thead>
          <tbody>${blackoutRows || '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#9ca3af">No blackouts</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;

  const show = (t: string) => defaultTab === t ? '' : ' style="display:none"';

  return `<h2 class="section-title mt-4">Settings</h2>

  <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.25rem">
    ${tabBtns}
  </div>

  <div id="stab-general-content"${show('general')}>${generalHtml}</div>
  <div id="stab-agents-content"${show('agents')}>${agentsHtml}</div>
  <div id="stab-blackouts-content"${show('blackouts')}>${blackoutsHtml}</div>

  <script>
  var jwt = function(){ return window.__adminToken || ''; };
  var AGENTS = ${escJs(agentArray)};

  function selectAccentColor(hiddenId, pickerId, color) {
    var inp = document.getElementById(hiddenId);
    if (inp) inp.value = color;
    var picker = document.getElementById(pickerId);
    if (picker && /^#[0-9a-fA-F]{6}$/.test(color)) picker.value = color;
    // Update swatch borders in the same row
    document.querySelectorAll('[id^="' + hiddenId + '-sw-"]').forEach(function(sw) {
      sw.style.borderColor = sw.title === color ? '#2D2D3F' : 'transparent';
    });
  }

  function showSettingsTab(name) {
    ['general','agents','blackouts'].forEach(function(t) {
      document.getElementById('stab-' + t + '-content').style.display = t === name ? '' : 'none';
      var btn = document.getElementById('stab-' + t);
      btn.style.background = t === name ? '#2D2D3F' : '#f3f4f6';
      btn.style.color      = t === name ? '#ffffff'  : '#374151';
    });
  }

  async function saveSettings(e) {
    e.preventDefault();
    var f = new FormData(e.target);
    var r = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt() }, body: JSON.stringify(Object.fromEntries(f)) });
    if (r.ok) alert('Settings saved!'); else alert('Save failed.');
  }

  async function createAgent(e) {
    e.preventDefault();
    var f = new FormData(e.target);
    var b = Object.fromEntries(f);
    if (b.slot_duration_min) b.slot_duration_min = parseInt(b.slot_duration_min);
    // Collect checked specializations from the form
    var specs = Array.from(e.target.querySelectorAll('input[name="specializations"]:checked')).map(function(cb){ return cb.value; });
    b.specializations = JSON.stringify(specs);
    b.accent_color = document.getElementById('nc-color-value').value || '#00E5A0';
    delete b.group_id;
    var r = await fetch('/api/admin/agents', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt() }, body: JSON.stringify(b) });
    if (r.ok) location.href = '/admin/agents'; else alert('Failed to create agent.');
  }

  function openAgentEdit(id) {
    var a = AGENTS.find(function(x){ return String(x.id) === String(id); });
    if (!a) return;
    document.getElementById('ae-id').value = a.id;
    document.getElementById('ae-name').value = a.name;
    document.getElementById('ae-title').value = a.title || '';
    document.getElementById('ae-email').value = a.notify_email;
    document.getElementById('ae-slot').value = a.slot_duration_min;
    document.getElementById('ae-hours').value = a.working_hours;
    // Set specialization checkboxes
    document.querySelectorAll('.ae-spec-cb').forEach(function(cb) {
      cb.checked = a.specializations.indexOf(cb.value) !== -1;
    });
    // Set accent color
    selectAccentColor('ae-color-value', 'ae-color-picker', a.accent_color || '#00E5A0');
    // Set toggle button label and style
    var toggleBtn = document.getElementById('ae-toggle-btn');
    if (a.active) {
      toggleBtn.textContent = 'Deactivate';
      toggleBtn.style.background = '#fee2e2';
      toggleBtn.style.color = '#991b1b';
    } else {
      toggleBtn.textContent = 'Activate';
      toggleBtn.style.background = '#d1fae5';
      toggleBtn.style.color = '#065f46';
    }
    toggleBtn.dataset.currentActive = a.active ? '1' : '0';
    document.getElementById('agent-modal').showModal();
  }

  async function saveAgent(e) {
    e.preventDefault();
    var id = document.getElementById('ae-id').value;
    var specs = Array.from(document.querySelectorAll('.ae-spec-cb:checked')).map(function(cb){ return cb.value; });
    var body = {
      name:             document.getElementById('ae-name').value.trim(),
      title:            document.getElementById('ae-title').value.trim(),
      notify_email:     document.getElementById('ae-email').value.trim(),
      slot_duration_min: parseInt(document.getElementById('ae-slot').value),
      working_hours:    document.getElementById('ae-hours').value.trim(),
      specializations:  JSON.stringify(specs),
      accent_color:     document.getElementById('ae-color-value').value || '#00E5A0',
    };
    var r = await fetch('/api/admin/agents/' + encodeURIComponent(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt() }, body: JSON.stringify(body) });
    if (r.ok) { document.getElementById('agent-modal').close(); location.href = '/admin/agents'; }
    else { alert('Failed to save changes.'); }
  }

  async function toggleAgentFromModal() {
    var id = document.getElementById('ae-id').value;
    var btn = document.getElementById('ae-toggle-btn');
    var newActive = btn.dataset.currentActive === '1' ? 0 : 1;
    var r = await fetch('/api/admin/agents/' + encodeURIComponent(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt() }, body: JSON.stringify({ active: newActive }) });
    if (r.ok) { document.getElementById('agent-modal').close(); location.href = '/admin/agents'; }
    else { alert('Failed to update status.'); }
  }

  async function createBlackout(e) {
    e.preventDefault();
    var f = new FormData(e.target);
    var b = Object.fromEntries(f);
    if (!b.agent_id) delete b.agent_id;
    if (!b.date_to) delete b.date_to;
    var r = await fetch('/api/admin/blackouts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt() }, body: JSON.stringify(b) });
    if (r.ok) location.href = '/admin/blackouts'; else alert('Failed to add blackout.');
  }

  async function deleteBlackout(id) {
    if (!confirm('Delete this blackout?')) return;
    await fetch('/api/admin/blackouts/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'Cf-Access-Jwt-Assertion': jwt() } });
    location.href = '/admin/blackouts';
  }
  </script>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function handleAdminPanel(request: Request, env: Env): Promise<Response> {
  if (!(await verifyAccessJwt(request, env))) {
    return new Response('Access denied.', { status: 403, headers: { 'Content-Type': 'text/plain' } });
  }

  const adminToken = extractAccessToken(request);

  const url  = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/admin';

  try {
    let body: string;
    let pageTitle: string;

    if (path === '/admin') {
      body = await renderDashboard(env);
      pageTitle = 'Dashboard';
    } else if (path === '/admin/bookings') {
      body = await renderBookings(env, url);
      pageTitle = 'Bookings';
    } else if (path === '/admin/settings') {
      body = await renderSettings(env, 'general');
      pageTitle = 'Settings';
    } else if (path === '/admin/agents') {
      body = await renderSettings(env, 'agents');
      pageTitle = 'Settings';
    } else if (path === '/admin/groups') {
      body = await renderSettings(env, 'groups');
      pageTitle = 'Settings';
    } else if (path === '/admin/blackouts') {
      body = await renderSettings(env, 'blackouts');
      pageTitle = 'Settings';
    } else {
      return new Response('Not Found', { status: 404 });
    }

    return new Response(htmlPage(env, pageTitle, body, path, adminToken), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (err) {
    derr('[admin]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
