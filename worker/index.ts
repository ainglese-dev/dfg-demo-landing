import { handleAgents } from './booking/agents';
import { handleAvailability } from './booking/availability';
import { handleSlots } from './booking/slots';
import { handleSubmit } from './booking/submit';
import { handleAdminBookings } from './admin/api/bookings';
import { handleExport } from './admin/api/export';
import { handleAdminAgents } from './admin/api/agents';
import { handleAdminGroups } from './admin/api/groups';
import { handleAdminBlackouts } from './admin/api/blackouts';
import { handleAdminSettings } from './admin/api/settings';
import { handleAdminPanel } from './admin/panel';

interface EmailServiceBinding {
  send(message: {
    to: string | string[];
    from: string | { email: string; name: string };
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      content: string | ArrayBuffer;
      filename: string;
      type: string;
      disposition: 'attachment' | 'inline';
      contentId?: string;
    }>;
  }): Promise<{ messageId: string }>;
}

export interface Env {
  DB: D1Database;
  EMAIL: EmailServiceBinding;
  ASSETS: Fetcher;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_URL?: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  CF_ACCESS_LOGOUT_URL?: string;
  CF_ACCESS_TEAM?: string;
  CF_ACCESS_AUD?: string;
  DEBUG?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cf-Access-Jwt-Assertion',
        },
      });
    }

    // Booking API
    if (pathname === '/api/booking/agents')       return handleAgents(request, env);
    if (pathname === '/api/booking/availability') return handleAvailability(request, env);
    if (pathname === '/api/booking/slots')        return handleSlots(request, env);
    if (pathname === '/api/booking/submit')       return handleSubmit(request, env);

    // Admin API — export must come before the generic bookings route
    if (pathname.startsWith('/api/admin/bookings/export')) return handleExport(request, env);
    if (pathname.startsWith('/api/admin/bookings'))        return handleAdminBookings(request, env);
    if (pathname.startsWith('/api/admin/agents'))          return handleAdminAgents(request, env);
    if (pathname.startsWith('/api/admin/groups'))          return handleAdminGroups(request, env);
    if (pathname.startsWith('/api/admin/blackouts'))       return handleAdminBlackouts(request, env);
    if (pathname.startsWith('/api/admin/settings'))        return handleAdminSettings(request, env);

    // Admin HTML panel
    if (pathname.startsWith('/admin')) return handleAdminPanel(request, env);

    // Try static asset first, fall back to SPA root for client-side navigation
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return env.ASSETS.fetch(new Request(new URL('/', request.url).href, request));
    }
  },
};
