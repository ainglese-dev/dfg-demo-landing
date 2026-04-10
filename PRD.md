# DIGITS FINANCIAL GROUP — Landing Page Redesign PRD

**Version:** 1.0
**Date:** April 9, 2026
**Author:** Angel (VIV53 LLC)
**Status:** Draft
**Workflow:** Google AI Studio (design inspiration) → Claude Code via VS Code (build)

---

## 1. Overview

Replace the existing WordPress site at digitsfinancial.tax with a modern React + Vite single-page site hosted on Cloudflare Pages. DFG is a Miami-based financial services company co-owned by Angel and Alfredo (same owners as VIV53 LLC). The site currently runs WordPress with GTranslate (6 languages), a scheduling plugin, and WhatsApp integration — all of which will be replaced with leaner, purpose-built solutions.

### 1.1 What Changes

| Current (WordPress) | New (React + Vite) |
|---------------------|-------------------|
| GTranslate plugin (6 langs) | i18n with EN + ES only (Miami market) |
| Simple Schedule Appointments plugin | Cloudflare Workers + Gmail API |
| Generic WordPress theme | Custom design, full redesign |
| Shared hosting (slow) | Cloudflare Pages (global CDN) |
| Cookie consent plugin | Lightweight custom banner or Zaraz |
| WhatsApp plugin | Direct wa.me link |

### 1.2 What Stays

- All 7 service offerings (same scope)
- TaxesToGo™ app references and links
- WhatsApp CTA (+1 305-927-2731)
- Office location: 18425 NW 2nd Ave, Suite 403, Miami FL 33169
- Hours: Mon-Fri 10am-10pm, Sat 9am-10pm, Sun 9am-5pm (walk-ins allowed)
- Contact: info@digitsfinancial.tax / +1 305-927-2731
- Footer: "Powered by viv53.com"

---

## 2. Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | Replace slow WordPress with fast, modern site | LCP < 2s, PageSpeed ≥ 90 |
| G2 | Generate inbound leads (appointments + calls) | Form submissions, WhatsApp clicks, call clicks tracked |
| G3 | Serve Miami's bilingual market natively | Full EN/ES i18n, not machine-translated |
| G4 | Streamline appointment booking with custom backend | CF Worker handles scheduling + Gmail API confirmation |
| G5 | Professional, trustworthy financial services aesthetic | Full redesign, no generic WordPress look |

---

## 3. Target Audience

- **Primary:** Miami residents (EN + ES) needing tax preparation, bookkeeping, or entity creation
- **Secondary:** Small business owners needing ongoing bookkeeping, credit repair, or lines of credit
- **Tertiary:** Families seeking life insurance or notary services

---

## 4. Services (all retained)

### 4.1 Tax Preparation (Personal & Business)
Accurate filings, maximized deductions, compliance. Individual and business returns. Core revenue driver.

### 4.2 Bookkeeping
Income/expense tracking, financial records, tax compliance support for small businesses.

### 4.3 Credit Repair
Error identification, negative mark removal, credit score improvement, loan/mortgage qualification guidance.

### 4.4 Line of Credit
Personalized borrowing solutions, flexible access to funds, personal and business use.

### 4.5 Entity Creation
LLC, corporation, partnership formation. Legal requirements, paperwork, tax structure guidance.

### 4.6 Life Insurance
Term, whole, universal coverage. Needs assessment and plan selection.

### 4.7 Public Notary
Signature authentication, oaths, contract verification, real estate transactions, power of attorney.

---

## 5. Page Structure (Single-Page Layout)

```
┌──────────────────────────────────────────┐
│  NAVBAR                                  │
│  Logo | Services | About | Contact |     │
│  Appointments | EN/ES toggle             │
├──────────────────────────────────────────┤
│  HERO                                    │
│  Headline + subtext                      │
│  Dual CTA: "Book Appointment" / "Call"   │
│  TaxesToGo™ app badge/link               │
├──────────────────────────────────────────┤
│  TRUST BAR (stats strip)                 │
│  100+ customers | 10%+ tax savings |     │
│  Weekly appointments | Entities created  │
├──────────────────────────────────────────┤
│  SERVICES (7 cards, grid or scroll)      │
│  Tax Prep | Bookkeeping | Credit Repair  │
│  Line of Credit | Entity Creation |      │
│  Life Insurance | Public Notary          │
│  Each: icon + title + short desc + CTA   │
├──────────────────────────────────────────┤
│  ABOUT US                                │
│  Mission + Vision (side-by-side or tabs) │
│  Team / trust signals                    │
├──────────────────────────────────────────┤
│  TAXESTOGO™ FEATURE SECTION              │
│  App description + download/access link  │
│  "Send docs, messages, signatures        │
│   securely to your preparer"             │
├──────────────────────────────────────────┤
│  FAQ (accordion)                         │
│  5 existing Q&As, expandable             │
├──────────────────────────────────────────┤
│  APPOINTMENT BOOKING                     │
│  Inline form: name, email, phone,        │
│  service, preferred date/time, message   │
│  → CF Worker → Gmail API confirmation    │
├──────────────────────────────────────────┤
│  CONTACT + LOCATION                      │
│  Google Maps embed | Address | Hours     │
│  Email | Phone | WhatsApp                │
│  Social links (FB, Twitter/X, YouTube)   │
├──────────────────────────────────────────┤
│  FOOTER                                  │
│  Logo | Nav links | Services links |     │
│  Data Privacy Policy | "Se habla         │
│  Español" | Powered by viv53.com         │
└──────────────────────────────────────────┘
```

---

## 6. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18 + Vite | Shared stack with VIV53 / VIVCOM |
| Package manager | pnpm | Fast, disk-efficient, workspace-ready |
| Styling | Tailwind CSS + shadcn/ui | Consistent with VIV53 ecosystem |
| i18n | react-i18next | Lightweight, JSON-based EN/ES translations |
| Hosting | Cloudflare Pages | Free, global CDN, same as VIVCOM |
| Appointments backend | Cloudflare Workers | Serverless, receives form → sends Gmail API confirmation |
| Email | Gmail API (via CF Worker) | Appointment confirmations to client + DFG |
| Analytics | Cloudflare Web Analytics | Privacy-first, free |
| Ads (future) | Google Ads (gtag.js via Zaraz) | Conversion tracking ready |
| WhatsApp | wa.me link with pre-filled message | Zero backend |
| Domain | digitsfinancial.tax (existing) | DNS cutover post-approval |

---

## 7. Internationalization (i18n)

### 7.1 Scope
- **EN** (default) + **ES** (Miami bilingual market)
- Drop FR, DE, IT, PT (GTranslate bloat, no real audience)

### 7.2 Implementation
- `react-i18next` with JSON translation files (`en.json`, `es.json`)
- Language toggle in navbar (flag icon or "EN | ES" text toggle)
- URL strategy: `digitsfinancial.tax/` (EN) / `digitsfinancial.tax/es/` (ES) — or query param `?lang=es`
- SEO: `hreflang` tags for EN/ES variants
- All static copy human-translated (not machine) — Angel handles ES copy

---

## 8. Appointment Booking System

### 8.1 Frontend Form Fields
- Full name (required)
- Email (required)
- Phone (required)
- Service interest (dropdown: all 7 services)
- Preferred date (date picker)
- Preferred time slot (dropdown: business hours in 30-min increments)
- Message (textarea, optional)
- Language preference (EN/ES, auto-detected from current locale)

### 8.2 Backend Flow
```
User submits form
  → CF Worker receives POST /api/appointments
  → Validates + sanitizes input
  → Sends confirmation email via Gmail API:
      - To client: "Your appointment request has been received"
      - To DFG (info@digitsfinancial.tax): "New appointment request from [name]"
  → Returns success/error to frontend
  → Frontend shows thank-you state
```

### 8.3 Gmail API Auth
- OAuth2 service account or refresh token stored in CF Worker secrets
- Sender: info@digitsfinancial.tax (or noreply@digitsfinancial.tax)

### 8.4 Future Enhancement
- Calendar integration (Google Calendar API) to check availability
- Auto-confirm vs pending states
- Reminder emails (24h before)

---

## 9. Brand Guidelines

### 9.1 Current Identity (preserve direction, refresh execution)
- **Logo:** Current DFG logo (extract SVG from WordPress or recreate)
- **Colors:** Extract from current site (blues + professional palette — TBD exact hex)
- **Tone:** Trustworthy, professional, approachable, bilingual-friendly

### 9.2 Design Direction
- Financial services aesthetic: clean, authoritative, not flashy
- Readable typography (accessibility matters for tax/financial content)
- Warm undertones to feel approachable (not cold corporate)
- "Se habla Español" as a visible trust signal, not hidden
- Google AI Studio for initial design exploration/moodboarding before build

---

## 10. Conversion & Lead Capture

### 10.1 Primary CTAs
- "Book Appointment" → scrolls to appointment form
- "Call Now" → `tel:+13059272731`

### 10.2 WhatsApp
- Floating button (bottom-right)
- Link: `https://wa.me/13059272731?text=Hi%20DFG%2C%20I%27d%20like%20to%20schedule%20an%20appointment`
- Spanish variant: `?text=Hola%20DFG%2C%20me%20gustaría%20agendar%20una%20cita`

### 10.3 TaxesToGo™ App
- Prominent badge/link in hero + dedicated section
- App Store / Play Store links (or web app URL — TBD)

### 10.4 Tracking
- Conversion events: form submission, WhatsApp click, call click, TaxesToGo link click
- UTM parameter passthrough on appointment form
- Google Ads conversion tracking ready (gtag.js via Zaraz)

---

## 11. SEO

- Semantic HTML5 structure
- Meta tags: title, description, Open Graph, Twitter Card (EN + ES variants)
- Schema.org LocalBusiness + FinancialService structured data
- `hreflang` tags for EN/ES
- Alt text on all images
- Sitemap.xml + robots.txt on Cloudflare Pages
- Canonical URLs per language variant

---

## 12. Content Migration

| Content | Source | Action |
|---------|--------|--------|
| Service descriptions (7) | Current WordPress | Rewrite / polish for new design |
| Mission & Vision | Current WordPress | Keep, minor copy edit |
| FAQ (5 Q&As) | Current WordPress | Keep, add more if needed |
| Testimonials / stats | Current WordPress | Verify numbers, keep |
| TaxesToGo™ copy | Current WordPress | Keep, update links if needed |
| Images | Current WordPress | Extract usable assets, replace stock with better options |
| Privacy Policy | Current WordPress | Migrate to static page/modal |
| ES translations | N/A | Create from scratch (Angel) |

---

## 13. Deployment Plan

```
Phase 0 — Design (Week 1)
  └─ Google AI Studio: moodboard + layout exploration
  └─ Lock color palette, typography, component style

Phase 1 — Demo (Week 1-2)
  └─ Init React+Vite project via Claude Code (pnpm)
  └─ Build all sections (EN first)
  └─ Deploy to Cloudflare Pages preview URL

Phase 2 — Backend + i18n (Week 2-3)
  └─ CF Worker for appointment booking
  └─ Gmail API integration
  └─ Add ES translations (react-i18next)

Phase 3 — Iterate (Week 3-4)
  └─ Review with Alfredo
  └─ Content polish, image finalization
  └─ Performance audit (Lighthouse ≥ 90)

Phase 4 — Go Live (Week 4)
  └─ Point digitsfinancial.tax DNS to Cloudflare Pages
  └─ SSL auto-provisioned by Cloudflare
  └─ Verify: forms, Gmail confirmations, WhatsApp, i18n, analytics
  └─ Google Ads conversion tracking verification
  └─ Decommission WordPress hosting
```

---

## 14. Open Items / Decisions Needed

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | SVG logo file (extract or recreate) | Angel | ⏳ Pending |
| 2 | Exact brand hex colors from current site | Angel | ⏳ Pending |
| 3 | TaxesToGo™ app links (App Store / Play Store / web URL) | Alfredo | ⏳ Pending |
| 4 | Professional photos (office, team) or keep stock? | Alfredo | ⏳ Decision |
| 5 | Gmail API setup — service account or OAuth refresh token? | Angel | ⏳ Decision |
| 6 | Sender email for confirmations (info@ or noreply@) | Angel + Alfredo | ⏳ Decision |
| 7 | Google Ads account — existing or new? | Angel + Alfredo | ⏳ Pending |
| 8 | Privacy Policy — update needed for new stack? | Angel | ⏳ Decision |
| 9 | Social media links — verify current FB/Twitter/YouTube are active | Alfredo | ⏳ Pending |
| 10 | FAQ — add more Q&As or keep existing 5? | Alfredo | ⏳ Decision |
| 11 | Stats bar numbers — verify accuracy (100+ customers, etc.) | Alfredo | ⏳ Pending |
| 12 | Cloudflare Zaraz vs direct gtag.js for ads/analytics | Angel | ⏳ Decision |
| 13 | Appointment time slots — align with actual staff availability | Alfredo | ⏳ Pending |

---

## 15. Optional Enhancements (Future)

| Priority | Feature | Effort | Notes |
|----------|---------|--------|-------|
| P1 | Google Calendar API integration | Medium | Auto-check availability, avoid double-booking |
| P2 | Online document upload (secure) | Medium | Client uploads W-2s, 1099s via portal |
| P3 | Client portal / dashboard | High | Track appointment status, doc submissions |
| P4 | Google Reviews widget | Low | Trust signal, pull from Places API |
| P5 | Blog / tax tips section | Medium | SEO long-tail content, markdown-driven |
| P6 | SMS appointment reminders | Medium | Twilio or CF Worker + SMS API |
| P7 | Chatbot (AI-powered) | High | Pre-qualify leads, answer basic tax Qs |
| P8 | Google Ads landing page variants | Low | `/lp/tax-prep`, `/lp/entity-creation` for ad-specific CTAs |

---

*End of PRD — ready for Google AI Studio exploration → Claude Code build.*