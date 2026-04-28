# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page redesign for **Digits Financial Group** (digitsfinancial.tax) — a Miami-based financial services firm. Replacing a WordPress site with a React + Vite SPA deployed on Cloudflare Pages. See `PRD.md` for full requirements, services, brand guidelines, and deployment plan.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build (outputs to dist/)
pnpm preview    # Preview production build locally
pnpm lint       # Run ESLint
```

## Reference Design

`draft-digits-financial-group/` is a **visual reference from Google AI Studio** — use it for layout, color palette, component patterns, and copy inspiration. It is not production code. Root `.gitignore` excludes it from version control.

Reference stack: React 19 + Vite 6 + Tailwind CSS v4, single-file `src/App.tsx` (873 lines, 12 components), `motion/react` animations, `lucide-react` icons, `useState`-based EN/ES toggle.

## Architecture

The reference renders 12 sections in order:

`Navbar → Hero → TrustStats → Services → About → TaxesToGo → FAQ → Appointment → Footer`

Plus 3 floating elements: `WhatsAppButton`, `ScrollToTop`, `CookieConsent`.

**Do not replicate the monolithic single-file pattern.** Split into `src/components/`, `src/sections/`, and `src/i18n/`.

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite 6 |
| Package manager | pnpm |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | react-i18next (`src/i18n/en.json`, `src/i18n/es.json`) |
| Hosting | Cloudflare Pages (`dfg-demo-landing` project, production branch: `main`) |
| Backend | CF Pages Functions (`functions/` directory — same runtime as Workers) |
| Database | Cloudflare D1 (`dfg-booking`, binding `DB`) |
| Email | CF Email Workers (`send_email` binding `EMAIL`, from `bookings@vivnotify.com`) |
| CAPTCHA | Cloudflare Turnstile (site key: `VITE_TURNSTILE_SITE_KEY`, secret: CF Pages secret) |
| Admin auth | CF Zero Trust / CF Access protecting `/admin*` |

### Deployment

```bash
pnpm deploy    # pnpm build && wrangler pages deploy dist
```

`wrangler.toml` at project root — `functions/` is picked up automatically. Secrets set via `wrangler pages secret put`, never in files. Local secrets in `.dev.vars` (gitignored; template at `.dev.vars.example`).

### wrangler.toml Bindings

```toml
name = "dfg-demo-landing"
pages_build_output_dir = "dist"
compatibility_date = "2025-04-10"

[[d1_databases]]
binding = "DB"
database_name = "dfg-booking"
database_id = "..."  # wrangler d1 create dfg-booking

[[send_email]]
name = "EMAIL"
```

### i18n

Language toggle in navbar. Detection order: `?lang=es` querystring → localStorage → browser language. Do not use path-based routing (`/es/`) — the SPA uses scroll navigation only.

### Booking System (3-step flow replacing Simply Schedule Appointments / WP)

**Frontend** (`src/sections/BookingModal.tsx` or `BookingPage.tsx`):
- Step 1: Agent selection — cards grouped by `agent_group`, fetched from `GET /api/booking/agents`
- Step 2: Calendar — month view with available dates from `GET /api/booking/availability`, then time slots from `GET /api/booking/slots`
- Step 3: Contact form (firstName, lastName, email, phone, address, city, state, zip, notes) + Turnstile widget

**Backend** (`functions/api/booking/`):
- `agents.ts` — `GET /api/booking/agents`
- `availability.ts` — `GET /api/booking/availability?agent_id=&year=&month=`
- `slots.ts` — `GET /api/booking/slots?agent_id=&date=` (working hours minus booked minus blackouts)
- `submit.ts` — `POST /api/booking/submit` (verify Turnstile → race-condition check → INSERT → send emails)

**Email on submit**: agent notification email with `.ics` calendar invite attachment + client confirmation. Reference send pattern: `github.com/ainglese-dev/vivcomau-demo-landing` → `worker/contact.ts`.

**Slot availability logic**: agent `working_hours` JSON (`{1:["10:00","22:00"],...}` weekday→[start,end]) generates slots at `slot_duration_min` intervals, minus existing `bookings` rows for that agent+date, minus `blackouts`.

### Admin Panel (`/admin`)

- Route: `/admin` and `/admin/*` served by `functions/admin/[[path]].ts`
- **Server-rendered HTML** (Pico CSS via CDN) — no React SPA, no second Vite build
- Protected by CF Zero Trust (CF Access) at the edge — configure in CF dashboard
- Admin API at `functions/api/admin/` — validates `Cf-Access-Jwt-Assertion` header
- Features: booking list/filter/CSV export per agent, agent + group CRUD, blackout management, settings (slot duration, timezone, etc.)

### CF Zero Trust Setup (one-time, dashboard only)

1. CF Zero Trust → Access → Applications → Add → Self-hosted
2. Domain: `dfg-demo-landing.pages.dev` (update to custom domain when live), Path: `/admin*`
3. Policy: allow specific emails (One-time PIN identity provider — no OAuth app needed)

### D1 Schema (`db/schema.sql`)

Tables: `agent_groups`, `agents` (with `working_hours` JSON + `notify_email`), `blackouts`, `bookings`, `settings`.
Apply: `wrangler d1 execute dfg-booking --file=db/schema.sql`
Local: `wrangler d1 execute dfg-booking --local --file=db/schema.sql`

### Appointment Booking (legacy note)

`src/sections/Appointment.tsx` and `functions/api/appointments.ts` are stubs — **replace** with the booking system above. Do not extend the stub.

### Theme & Branding

Reference color variables from `draft-digits-financial-group/src/index.css`:

- Primary: `#2D2D3F` (dark navy)
- Accent: `#00E5A0` (green)
- Fonts: **Fraunces** (headings) + **Work Sans** (body) — both via Google Fonts

Tone: professional, approachable, bilingual-friendly. "Se habla Español" is a visible trust signal, not hidden.

## Business Constants

- Phone/WhatsApp: `+1 305-927-2731` (`https://wa.me/13059272731`)
- Address: 18425 NW 2nd Ave, Suite 403, Miami FL 33169
- Hours: Mon–Fri 10am–10pm, Sat 9am–10pm, Sun 9am–5pm
- Email: `info@digitsfinancial.tax`
- Footer: "Powered by viv53.com"
- Services (7): Tax Preparation, Bookkeeping, Credit Repair, Line of Credit, Entity Creation, Life Insurance, Public Notary
