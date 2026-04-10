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
| Framework | React + Vite |
| Package manager | pnpm |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | react-i18next (`src/i18n/en.json`, `src/i18n/es.json`) |
| Hosting | Cloudflare Pages |
| Appointments backend | Cloudflare Worker (`POST /api/appointments`) |
| Email | Gmail API via CF Worker (OAuth2) |

### i18n

The reference uses simple `lang` state + inline ternaries — replace with `react-i18next`. Language toggle in navbar. URL strategy: `/?lang=es` or path prefix `/es/`. Add `hreflang` meta tags for EN/ES SEO.

### Appointment Booking

Frontend form (name, email, phone, service, date, time, message, language pref) POSTs to a Cloudflare Worker which sends confirmation email via Gmail API to both the client and `info@digitsfinancial.tax`.

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
