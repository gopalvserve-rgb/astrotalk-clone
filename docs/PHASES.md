# Phase Plan — AstroTalk Clone

Phase 1 is built. This document specifies Phases 2–9 with concrete tasks, files
to create, and acceptance criteria so future sessions can pick up cleanly.

---

## Phase 2 — Astrology Core Engines (3–4 weeks)

**Goal**: Real Vedic calculations replace the Phase-1 stubs.

### Tasks

| # | Task | Files |
|---|---|---|
| 2.1 | Integrate `swisseph` (Swiss Ephemeris) Node binding | `packages/astrology/src/ephemeris.ts` |
| 2.2 | Sidereal Lagna + planet placements + houses (Placidus / Whole Sign) | `packages/astrology/src/kundali.ts` |
| 2.3 | Real Panchang (tithi/vara/nakshatra/yoga/karana) | `packages/astrology/src/panchang.ts` |
| 2.4 | Vimshottari Dasha tree (Maha → Antar → Pratyantar) | `packages/astrology/src/dasha.ts` |
| 2.5 | Ashtakoot 36-Guna matching | `packages/astrology/src/matching.ts` |
| 2.6 | Shubh Muhurat — 7 types (marriage, griha pravesh, mundan, naamkaran, annaprashan, bhoomi pujan, car/bike) | `packages/astrology/src/muhurat.ts` |
| 2.7 | All Calculators page + sub-routes | `apps/web/src/app/calculators/*` |
| 2.8 | Horoscope CMS (admin writes daily horoscopes for 12 signs × 4 periods) | `apps/admin/src/app/articles/*` |

### Acceptance
- `/free-kundli` returns a correct sidereal chart matching AstroTalk's output (±1° on lagna)
- `/panchang` matches Drik / Drig panchang for Delhi to ±2 min on sunrise/sunset
- `/matchmaking` returns 28+ guna for two test charts that are known compatible
- All 7 muhurat pages live + working

---

## Phase 3 — Full AI Layer (2–3 weeks)

**Goal**: All AI features fully wired with Gemini + DeepSeek.

### Tasks

| # | Task | Files |
|---|---|---|
| 3.1 | Wire `/ai/kundali` end-to-end (uses real chart from Phase 2) | `apps/web/src/app/ai/kundali/*` |
| 3.2 | `/ai/numerology` with full report card UI | `apps/web/src/app/ai/numerology/*` |
| 3.3 | `/ai/vastu` with house diagram input | `apps/web/src/app/ai/vastu/*` |
| 3.4 | `/ai/name-generator` (business + baby) | `apps/web/src/app/ai/name-generator/*` |
| 3.5 | Face reading polish — multi-angle support | `apps/web/src/app/face-reading/*` |
| 3.6 | Palm reading polish — both hands | `apps/web/src/app/palm-reading/*` |
| 3.7 | Tarot — card UI + deck (RWS images) + 3-card / 10-card spreads | `apps/web/src/app/tarot/*` |
| 3.8 | AI chat fallback — when no astrologer online, route to AI | `apps/web/src/lib/chat-router.ts` |
| 3.9 | AI cost cap per user per day | `apps/web/src/lib/ai-budget.ts` |
| 3.10 | Streaming responses (SSE) for long reports | `apps/web/src/app/api/ai/stream/route.ts` |

### Acceptance
- All AI tasks complete in <30s for 90th percentile
- Wallet correctly deducted + refunded on failure
- Daily cost cap enforced

---

## Phase 4 — Real-time Consultation (4–5 weeks)

**Goal**: Live chat, voice and video sessions with per-minute billing.

### Tasks

| # | Task | Files |
|---|---|---|
| 4.1 | Socket.IO server for chat rooms | `apps/web/src/server/socket.ts` |
| 4.2 | Chat UI — typing, read receipts, attachments | `apps/web/src/app/chat-with-astrologer/[id]/*` |
| 4.3 | Wallet meter — 1-min ticks, auto-disconnect on low balance | `apps/web/src/lib/billing-meter.ts` |
| 4.4 | Agora SDK for voice + video | `packages/realtime/*` |
| 4.5 | Astrologer dashboard (separate sub-domain) | `apps/astrologer/*` |
| 4.6 | Astrologer KYC + onboarding (Aadhaar/PAN) | `apps/astrologer/src/app/onboarding/*` |
| 4.7 | Astrologer payout (Cashfree Payouts) — T+2 settlement | `packages/payments/src/cashfree-payouts.ts` |
| 4.8 | Reviews + ratings system | `apps/web/src/app/reviews/*` |
| 4.9 | AI-pandit hot-swap (when human goes offline) | `apps/web/src/lib/astrologer-router.ts` |

### Acceptance
- Two users can chat live with <500ms latency
- 1-min wallet meter tick deducts the right amount
- Astrologer settles to their bank in T+2 via Cashfree

---

## Phase 5 — Commerce & Bookings (3–4 weeks)

**Goal**: Shop + Pooja + Yatra + Sewa, all functional with checkout.

### Tasks

| # | Task | Files |
|---|---|---|
| 5.1 | Shop product CRUD in admin | `apps/admin/src/app/products/*` |
| 5.2 | Shop UI — list, filters, product page, cart | `apps/web/src/app/shop/*` |
| 5.3 | Checkout — wallet OR Cashfree | `apps/web/src/app/checkout/*` |
| 5.4 | Order tracking + status webhook | `apps/web/src/app/api/orders/*` |
| 5.5 | Pooja booking — pandit assignment + live stream URL | `apps/web/src/app/pooja/[slug]/*` |
| 5.6 | Yatra booking + group capacity tracking | `apps/web/src/app/yatra/[slug]/*` |
| 5.7 | Sewa donations + receipt PDF | `apps/web/src/app/sewa/[slug]/*` |
| 5.8 | Tax invoicing (GST) | `packages/invoicing/*` |

---

## Phase 6 — Live & Community (2–3 weeks)

### Tasks
| # | Task | Files |
|---|---|---|
| 6.1 | Live Darshan — YouTube embed + admin uploader (mux/cloudflare) | `apps/web/src/app/darshan/*` |
| 6.2 | Meditation library + audio player | `apps/web/src/app/meditation/*` |
| 6.3 | Mantra library — text + audio + lyrics | `apps/web/src/app/mantras/*` |
| 6.4 | Blog / Articles CMS | `apps/admin/src/app/articles/*` |
| 6.5 | Horoscope daily auto-generation (Gemini, scheduled job at 12am IST) | `apps/web/src/jobs/horoscope-daily.ts` |

---

## Phase 7 — React Native App (4–6 weeks)

### Tasks
| # | Task | Files |
|---|---|---|
| 7.1 | Expo project scaffold sharing types with `@astrotalk/shared` | `apps/mobile/*` |
| 7.2 | Auth (phone OTP) using same API | `apps/mobile/src/screens/auth/*` |
| 7.3 | Dashboard tabs (Astrology / Numerology / Vastu) | `apps/mobile/src/screens/dashboard/*` |
| 7.4 | Chat + Call (Agora React Native SDK) | `apps/mobile/src/screens/consult/*` |
| 7.5 | Wallet recharge (Cashfree React Native SDK) | `apps/mobile/src/screens/wallet/*` |
| 7.6 | Push notifications (FCM) | `apps/mobile/src/push/*` |
| 7.7 | Deep linking — `astrotalk://` | `apps/mobile/app.json` |
| 7.8 | EAS build + Play Store + App Store listings | `apps/mobile/eas.json` |

---

## Phase 8 — White-label Tooling (2 weeks)

### Tasks
| # | Task | Files |
|---|---|---|
| 8.1 | Tenant signup wizard (in admin) | `apps/admin/src/app/tenants/new/*` |
| 8.2 | DNS verification (CNAME/A check) | `apps/admin/src/lib/dns-verify.ts` |
| 8.3 | Theme builder UI (logo upload, colours, fonts) | `apps/admin/src/app/tenants/[id]/theme/*` |
| 8.4 | Automated DB provisioning script (already at `tools/tenant-provisioner`) — admin UI wrapper | `apps/admin/src/app/api/tenants/new/route.ts` |
| 8.5 | Per-tenant Cashfree credentials | encrypted in `tenant_settings` |
| 8.6 | Billing for tenants (monthly licence) | `apps/admin/src/app/tenants/[id]/billing/*` |

---

## Phase 9 — Polish & Scale (2 weeks)

### Tasks
| # | Task |
|---|---|
| 9.1 | SEO — server-side rendering metadata for every page, sitemap.xml, robots.txt, structured data |
| 9.2 | GA4 / Mixpanel analytics |
| 9.3 | Performance — image optimisation, ISR, edge cache |
| 9.4 | Security audit — OWASP top 10, rate limiting, CSRF, DPDP Act compliance |
| 9.5 | Load testing — k6 scripts for chat + wallet |
| 9.6 | Backups — daily PG dumps to S3 |
| 9.7 | Observability — Sentry + OpenTelemetry |

---

## Cross-cutting standards

- All new code is TypeScript strict.
- Every API route enforces tenant resolution + module check.
- Every wallet-touching operation goes through `db.$transaction(...)`.
- Every AI call goes through `packages/ai/router` — never direct provider calls.
- Every new page has a server component shell and a client form (where input is needed).
